import { supabase } from '../lib/supabase';

export const adminService = {
  async verifyAdminAccess() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('not_admin');

      return true;
    } catch (error) {
      console.error('Error verifying admin access:', error);
      throw error;
    }
  },

  async getUsers() {
    try {
      await this.verifyAdminAccess();

      const { data: users, error: usersError } = await supabase.rpc('get_auth_users');
      if (usersError) throw usersError;

      // Get admin users
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('id');

      const adminUserIds = new Set(adminUsers?.map(admin => admin.id) || []);

      // Get recipes and menus count for each user
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const [recipesCount, menusCount] = await Promise.all([
            supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('weekly_menus').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
          ]);

          return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            recipes_count: recipesCount.count || 0,
            menus_count: menusCount.count || 0,
            is_admin: adminUserIds.has(user.id)
          };
        })
      );

      return usersWithStats;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getAllRecipes() {
    try {
      await this.verifyAdminAccess();

      // First get all recipes
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('id, name, user_id, created_at');

      if (recipesError) throw recipesError;

      // Then get all users to map their emails
      const { data: users, error: usersError } = await supabase.rpc('get_auth_users');
      if (usersError) throw usersError;

      // Create a map of user IDs to emails
      const userEmailMap = new Map(users.map(user => [user.id, user.email]));

      // Map recipes with user emails
      return recipes?.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        user_id: recipe.user_id,
        user_email: userEmailMap.get(recipe.user_id) || 'Unknown',
        created_at: recipe.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  async getAllMenus() {
    try {
      await this.verifyAdminAccess();

      // First get all menus
      const { data: menus, error: menusError } = await supabase
        .from('weekly_menus')
        .select('id, name, user_id, created_at');

      if (menusError) throw menusError;

      // Then get all users to map their emails
      const { data: users, error: usersError } = await supabase.rpc('get_auth_users');
      if (usersError) throw usersError;

      // Create a map of user IDs to emails
      const userEmailMap = new Map(users.map(user => [user.id, user.email]));

      // Map menus with user emails
      return menus?.map(menu => ({
        id: menu.id,
        name: menu.name,
        user_id: menu.user_id,
        user_email: userEmailMap.get(menu.user_id) || 'Unknown',
        created_at: menu.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching menus:', error);
      throw error;
    }
  },

  async createUser(email: string, password: string) {
    try {
      await this.verifyAdminAccess();

      const { data, error } = await supabase.rpc('admin_create_user', {
        user_email: email,
        user_password: password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUserAdminStatus(userId: string, makeAdmin: boolean) {
    try {
      await this.verifyAdminAccess();

      if (makeAdmin) {
        const { error } = await supabase
          .from('admin_users')
          .insert({ id: userId })
          .single();

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', userId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      throw error;
    }
  }
};