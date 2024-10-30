import { supabase, handleSupabaseError } from '../lib/supabase';

export interface Recipe {
  id: string;
  name: string;
  meal_types: string[];
  week_days: string[];
  instructions: string;
  user_id: string;
}

export interface WeeklyMenu {
  id: string;
  name: string;
  year: number;
  week: number;
  meal_count: number;
  meal_types: string[];
  meal_plan: any[][][];
  user_id: string;
}

export interface RecipeIngredient {
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
}

export const recipeService = {
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async getById(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Obtener la receta
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (recipeError) throw recipeError;

      // Obtener los ingredientes de la receta
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .select(`
          ingredient_id,
          quantity,
          unit,
          ingredients:ingredient_id (
            name,
            base_unit
          )
        `)
        .eq('recipe_id', id);

      if (ingredientsError) throw ingredientsError;

      return {
        ...recipe,
        ingredients: ingredients?.map(item => ({
          ingredientId: item.ingredient_id,
          name: item.ingredients.name,
          quantity: item.quantity,
          unit: item.unit || item.ingredients.base_unit
        })) || []
      };
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async create(recipe: Omit<Recipe, 'id' | 'user_id'>, ingredients: RecipeIngredient[]) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert([{ ...recipe, user_id: user.id }])
        .select()
        .single();
      
      if (recipeError) throw recipeError;

      if (ingredients.length > 0) {
        await this.addIngredients(recipeData.id, ingredients);
      }

      return recipeData;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async update(id: string, recipe: Partial<Recipe>, ingredients?: RecipeIngredient[]) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error: updateError } = await supabase
        .from('recipes')
        .update(recipe)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (updateError) throw updateError;

      if (ingredients) {
        // Primero eliminar los ingredientes existentes
        const { error: deleteError } = await supabase
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', id);
        
        if (deleteError) throw deleteError;

        // Luego añadir los nuevos ingredientes
        if (ingredients.length > 0) {
          await this.addIngredients(id, ingredients);
        }
      }

      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async delete(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Primero eliminar los ingredientes relacionados
      const { error: deleteIngredientsError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id);
      
      if (deleteIngredientsError) throw deleteIngredientsError;

      // Luego eliminar la receta
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async addIngredients(recipeId: string, ingredients: RecipeIngredient[]) {
    try {
      const { error } = await supabase
        .from('recipe_ingredients')
        .insert(ingredients.map(ingredient => ({
          recipe_id: recipeId,
          ingredient_id: ingredient.ingredient_id,
          quantity: ingredient.quantity,
          unit: ingredient.unit
        })));
      
      if (error) throw error;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }
};

export const menuService = {
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('weekly_menus')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async create(menu: Omit<WeeklyMenu, 'id' | 'user_id'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Check for existing menus with the same name
      const { data: existingMenus, error: searchError } = await supabase
        .from('weekly_menus')
        .select('name')
        .eq('user_id', user.id)
        .ilike('name', `${menu.name}%`);

      if (searchError) throw searchError;

      let uniqueName = menu.name;
      if (existingMenus && existingMenus.length > 0) {
        const baseNamePattern = new RegExp(`^${menu.name}(?: \\((\\d+)\\))?$`);
        let maxCounter = 0;

        existingMenus.forEach(existingMenu => {
          const match = existingMenu.name.match(baseNamePattern);
          if (match) {
            const counter = match[1] ? parseInt(match[1], 10) : 0;
            maxCounter = Math.max(maxCounter, counter);
          }
        });

        if (maxCounter >= 0) {
          uniqueName = `${menu.name} (${maxCounter + 1})`;
        }
      }

      const { data, error } = await supabase
        .from('weekly_menus')
        .insert([{ ...menu, name: uniqueName, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async update(id: string, menu: Partial<WeeklyMenu>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // If name is being updated, check for duplicates
      if (menu.name) {
        const { data: existingMenus, error: searchError } = await supabase
          .from('weekly_menus')
          .select('name')
          .eq('user_id', user.id)
          .neq('id', id)
          .ilike('name', `${menu.name}%`);

        if (searchError) throw searchError;

        let uniqueName = menu.name;
        if (existingMenus && existingMenus.length > 0) {
          const baseNamePattern = new RegExp(`^${menu.name}(?: \\((\\d+)\\))?$`);
          let maxCounter = 0;

          existingMenus.forEach(existingMenu => {
            const match = existingMenu.name.match(baseNamePattern);
            if (match) {
              const counter = match[1] ? parseInt(match[1], 10) : 0;
              maxCounter = Math.max(maxCounter, counter);
            }
          });

          if (maxCounter >= 0) {
            uniqueName = `${menu.name} (${maxCounter + 1})`;
          }
        }

        menu.name = uniqueName;
      }

      const { data, error } = await supabase
        .from('weekly_menus')
        .update(menu)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async delete(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('weekly_menus')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async getById(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('weekly_menus')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }
};