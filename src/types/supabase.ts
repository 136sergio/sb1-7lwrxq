export interface Database {
    public: {
      Tables: {
        recipes: {
          Row: {
            id: string;
            user_id: string;
            name: string;
            meal_types: string[];
            week_days: string[];
            ingredients: string;
            instructions: string;
            created_at: string;
            updated_at: string;
          };
          Insert: Omit<Database['public']['Tables']['recipes']['Row'], 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Database['public']['Tables']['recipes']['Insert']>;
        };
        weekly_menus: {
          Row: {
            id: string;
            user_id: string;
            name: string;
            year: number;
            week: number;
            meal_count: number;
            meal_types: string[];
            meal_plan: any[][][];
            created_at: string;
            updated_at: string;
          };
          Insert: Omit<Database['public']['Tables']['weekly_menus']['Row'], 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Database['public']['Tables']['weekly_menus']['Insert']>;
        };
        admin_users: {
          Row: {
            id: string;
            created_at: string;
          };
          Insert: Pick<Database['public']['Tables']['admin_users']['Row'], 'id'>;
          Update: never;
        };
      };
    };
  }