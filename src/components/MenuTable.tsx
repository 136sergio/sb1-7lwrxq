import React from 'react';
import { Plus, X } from 'lucide-react';
import { MealPlanItem } from '../types/menu';

interface MenuTableProps {
  mealPlan: MealPlanItem[][][];
  mealTypes: string[];
  weekDays: string[];
  showNutritionInfo: boolean;
  currentDayIndex: number;
  currentMealIndex: number;
  onAddItem: (dayIndex: number, mealIndex: number) => void;
  onRemoveItem: (dayIndex: number, mealIndex: number, itemIndex: number) => void;
}

const MenuTable: React.FC<MenuTableProps> = ({
  mealPlan,
  mealTypes,
  weekDays,
  showNutritionInfo,
  currentDayIndex,
  currentMealIndex,
  onAddItem,
  onRemoveItem,
}) => {
  const calculateDailyCalories = (dayIndex: number): number => {
    return mealPlan[dayIndex].reduce((dayTotal, meals) => {
      return dayTotal + meals.reduce((mealTotal, item) => {
        return mealTotal + (item.nutrition?.calories || 0);
      }, 0);
    }, 0);
  };

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 p-2"></th>
          {weekDays.map((day) => (
            <th key={day} className="border border-gray-300 p-2">{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {mealTypes.map((mealType, mealIndex) => (
          <tr key={mealType}>
            <td className="border border-gray-300 p-2 font-medium">
              {mealType}
            </td>
            {weekDays.map((_, dayIndex) => (
              <td key={`${mealType}-${dayIndex}`} className="border border-gray-300 p-2">
                <div className="space-y-2">
                  {mealPlan[dayIndex][mealIndex].map((item, itemIndex) => (
                    <div key={`${item.recipeName}-${itemIndex}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{item.recipeName}</span>
                          {showNutritionInfo && item.nutrition && (
                            <span className="text-xs text-gray-500">
                              ({Math.round(item.nutrition.calories)} kcal)
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(dayIndex, mealIndex, itemIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {itemIndex < mealPlan[dayIndex][mealIndex].length - 1 && (
                        <hr className="my-1 border-gray-200" />
                      )}
                    </div>
                  ))}
                </div>
                {mealPlan[dayIndex][mealIndex].length < 4 && (
                  <button
                    type="button"
                    onClick={() => onAddItem(dayIndex, mealIndex)}
                    className="w-full text-sm text-green-500 hover:text-green-700 mt-2"
                  >
                    <Plus size={14} className="mx-auto" />
                  </button>
                )}
              </td>
            ))}
          </tr>
        ))}
        {showNutritionInfo && (
          <tr>
            <td className="border border-gray-300 p-2 font-medium">
              Total Diario
            </td>
            {weekDays.map((_, dayIndex) => (
              <td key={`total-${dayIndex}`} className="border border-gray-300 p-2 text-center font-medium">
                {Math.round(calculateDailyCalories(dayIndex))} kcal
              </td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default MenuTable;