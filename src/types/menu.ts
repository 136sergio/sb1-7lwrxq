export interface MealPlanItem {
  recipeName: string;
  quantity: number;
  isProduct?: boolean;
  nutrition?: {
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
    sodium: number;
  };
}

export interface Recipe {
  id: string;
  name: string;
  meal_types: string[];
  week_days: string[];
}

export interface WeeklyMenu {
  id: string;
  name: string;
  year: number;
  week: number;
  meal_count: number;
  meal_types: string[];
  meal_plan: MealPlanItem[][][];
  user_id?: string;
}