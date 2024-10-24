import { supabase, handleSupabaseError } from '../lib/supabase';

export interface Recipe {
  id: string;
  name: string;
  meal_types: string[];
  week_days: string[];
  ingredients: string;
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

  async create(recipe: Omit<Recipe, 'id' | 'user_id'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('recipes')
        .insert([{ ...recipe, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  async update(id: string, recipe: Partial<Recipe>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('recipes')
        .update(recipe)
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
        .from('recipes')
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
        .from('recipes')
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
        // Find the highest counter for menus with the same base name
        const baseNamePattern = new RegExp(`^${menu.name}(?: \\((\\d+)\\))?$`);
        let maxCounter = 0;

        existingMenus.forEach(existingMenu => {
          const match = existingMenu.name.match(baseNamePattern);
          if (match) {
            const counter = match[1] ? parseInt(match[1], 10) : 0;
            maxCounter = Math.max(maxCounter, counter);
          }
        });

        // If there's at least one menu with this name, add counter
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
          .neq('id', id) // Exclude current menu
          .ilike('name', `${menu.name}%`);

        if (searchError) throw searchError;

        let uniqueName = menu.name;
        if (existingMenus && existingMenus.length > 0) {
          // Find the highest counter for menus with the same base name
          const baseNamePattern = new RegExp(`^${menu.name}(?: \\((\\d+)\\))?$`);
          let maxCounter = 0;

          existingMenus.forEach(existingMenu => {
            const match = existingMenu.name.match(baseNamePattern);
            if (match) {
              const counter = match[1] ? parseInt(match[1], 10) : 0;
              maxCounter = Math.max(maxCounter, counter);
            }
          });

          // If there's at least one menu with this name, add counter
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