import { supabase, handleSupabaseError } from '../lib/supabase';
import { WeeklyMenu, MealPlanItem } from '../types/menu';

export interface Recipe {
  id: string;
  name: string;
  meal_types: string[];
  week_days: string[];
  instructions: string;
  user_id: string;
  recipe_ingredients?: {
    name: string;
    quantity: number;
    unit: string;
    is_product: boolean;
    calories?: number;
    proteins?: number;
    carbohydrates?: number;
    fats?: number;
    fiber?: number;
    sodium?: number;
  }[];
}

export const recipeService = {
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            name,
            quantity,
            unit,
            is_product,
            calories,
            proteins,
            carbohydrates,
            fats,
            fiber,
            sodium
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async getById(id: string): Promise<Recipe | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            name,
            quantity,
            unit,
            is_product,
            calories,
            proteins,
            carbohydrates,
            fats,
            fiber,
            sodium
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async create(recipe: Omit<Recipe, 'id' | 'user_id'>, ingredients: any[]) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase.rpc('create_recipe_with_ingredients', {
        p_name: recipe.name,
        p_meal_types: recipe.meal_types,
        p_week_days: recipe.week_days,
        p_instructions: recipe.instructions,
        p_user_id: user.id,
        p_ingredients: ingredients
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async update(id: string, recipe: Partial<Recipe>, ingredients: any[]) {
    try {
      const { data, error } = await supabase.rpc('update_recipe_with_ingredients', {
        p_recipe_id: id,
        p_name: recipe.name,
        p_meal_types: recipe.meal_types,
        p_week_days: recipe.week_days,
        p_instructions: recipe.instructions,
        p_ingredients: ingredients
      });

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
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
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