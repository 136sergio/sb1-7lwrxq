import React from 'react';
import { MealPlanItem } from '../types/menu';

interface MenuItemNutritionProps {
  items: MealPlanItem[];
}

const MenuItemNutrition: React.FC<MenuItemNutritionProps> = ({ items }) => {
  const totalCalories = items.reduce((total, item) => {
    if (item.nutrition?.calories !== undefined) {
      return total + item.nutrition.calories;
    }
    return total;
  }, 0);

  if (totalCalories === 0) return null;

  return (
    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
      Total: {Math.round(totalCalories)} kcal
    </div>
  );
};

export default MenuItemNutrition;