import React, { useState } from 'react';
import { MealPlanItem } from '../types/menu';
import { PieChart } from 'react-minimal-pie-chart';

interface MenuNutritionInfoProps {
  mealPlan: MealPlanItem[][][];
  mealTypes: string[];
  weekDays: string[];
}

const MenuNutritionInfo: React.FC<MenuNutritionInfoProps> = ({ mealPlan, mealTypes, weekDays }) => {
  const [hoveredCell, setHoveredCell] = useState<{ dayIndex: number; mealIndex: number } | null>(null);

  const calculateDailyNutrition = (dayIndex: number) => {
    return mealPlan[dayIndex].reduce((dayTotal, meals) => {
      const mealTotal = meals.reduce((mealTotal, item) => {
        if (item.nutrition) {
          return {
            calories: mealTotal.calories + item.nutrition.calories,
            proteins: mealTotal.proteins + item.nutrition.proteins,
            carbohydrates: mealTotal.carbohydrates + item.nutrition.carbohydrates,
            fats: mealTotal.fats + item.nutrition.fats,
            fiber: mealTotal.fiber + item.nutrition.fiber,
            sodium: mealTotal.sodium + item.nutrition.sodium,
          };
        }
        return mealTotal;
      }, { calories: 0, proteins: 0, carbohydrates: 0, fats: 0, fiber: 0, sodium: 0 });

      return {
        calories: dayTotal.calories + mealTotal.calories,
        proteins: dayTotal.proteins + mealTotal.proteins,
        carbohydrates: dayTotal.carbohydrates + mealTotal.carbohydrates,
        fats: dayTotal.fats + mealTotal.fats,
        fiber: dayTotal.fiber + mealTotal.fiber,
        sodium: dayTotal.sodium + mealTotal.sodium,
      };
    }, { calories: 0, proteins: 0, carbohydrates: 0, fats: 0, fiber: 0, sodium: 0 });
  };

  const calculateMealNutrition = (dayIndex: number, mealIndex: number) => {
    return mealPlan[dayIndex][mealIndex].reduce((total, item) => {
      if (item.nutrition) {
        return {
          calories: total.calories + item.nutrition.calories,
          proteins: total.proteins + item.nutrition.proteins,
          carbohydrates: total.carbohydrates + item.nutrition.carbohydrates,
          fats: total.fats + item.nutrition.fats,
          fiber: total.fiber + item.nutrition.fiber,
          sodium: total.sodium + item.nutrition.sodium,
        };
      }
      return total;
    }, { calories: 0, proteins: 0, carbohydrates: 0, fats: 0, fiber: 0, sodium: 0 });
  };

  const NutritionCell = ({ nutrition, dayIndex, mealIndex }: { 
    nutrition: any; 
    dayIndex: number; 
    mealIndex: number;
  }) => {
    const total = nutrition.proteins + nutrition.carbohydrates + nutrition.fats + nutrition.fiber;
    const isHovered = hoveredCell?.dayIndex === dayIndex && hoveredCell?.mealIndex === mealIndex;
    
    const pieData = [
      { title: 'Proteínas', value: nutrition.proteins, color: '#10B981' },
      { title: 'Carbohidratos', value: nutrition.carbohydrates, color: '#3B82F6' },
      { title: 'Grasas', value: nutrition.fats, color: '#EF4444' },
      { title: 'Fibra', value: nutrition.fiber, color: '#8B5CF6' },
    ].filter(item => item.value > 0);

    if (total === 0) return null;

    return (
      <div 
        className="relative h-full w-full flex items-center justify-center cursor-pointer p-4"
        onMouseEnter={() => setHoveredCell({ dayIndex, mealIndex })}
        onMouseLeave={() => setHoveredCell(null)}
      >
        <div className="relative w-24 h-24">
          <PieChart
            data={pieData}
            lineWidth={20}
            paddingAngle={2}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {Math.round(nutrition.calories)}
              </div>
              <div className="text-xs text-gray-500">kcal</div>
            </div>
          </div>
        </div>

        {isHovered && (
          <div className="absolute z-20 bg-white rounded-lg shadow-lg p-4 min-w-[200px] left-1/2 transform -translate-x-1/2 mt-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Calorías:</div>
              <div className="text-right font-medium">{nutrition.calories.toFixed(1)} kcal</div>
              
              <div className="text-gray-600">Proteínas:</div>
              <div className="text-right font-medium">{nutrition.proteins.toFixed(1)}g</div>
              
              <div className="text-gray-600">Carbohidratos:</div>
              <div className="text-right font-medium">{nutrition.carbohydrates.toFixed(1)}g</div>
              
              <div className="text-gray-600">Grasas:</div>
              <div className="text-right font-medium">{nutrition.fats.toFixed(1)}g</div>
              
              <div className="text-gray-600">Fibra:</div>
              <div className="text-right font-medium">{nutrition.fiber.toFixed(1)}g</div>
              
              <div className="text-gray-600">Sodio:</div>
              <div className="text-right font-medium">{nutrition.sodium.toFixed(1)}mg</div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
              {pieData.map((item) => (
                <div key={item.title} className="flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <table className="w-full border-collapse border border-gray-300 bg-white/50 backdrop-blur-sm">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 font-medium text-gray-700"></th>
            {weekDays.map(day => (
              <th key={day} className="border border-gray-300 p-2 font-medium text-gray-700">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mealTypes.map((mealType, mealIndex) => (
            <tr key={mealType}>
              <td className="border border-gray-300 p-2 font-medium text-gray-700">
                {mealType}
              </td>
              {weekDays.map((_, dayIndex) => {
                const nutrition = calculateMealNutrition(dayIndex, mealIndex);
                return (
                  <td key={`${mealType}-${dayIndex}`} className="border border-gray-300">
                    <NutritionCell 
                      nutrition={nutrition} 
                      dayIndex={dayIndex} 
                      mealIndex={mealIndex}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td className="border border-gray-300 p-2 font-medium text-gray-700">
              Total Diario
            </td>
            {weekDays.map((_, dayIndex) => {
              const nutrition = calculateDailyNutrition(dayIndex);
              return (
                <td key={`total-${dayIndex}`} className="border border-gray-300">
                  <NutritionCell 
                    nutrition={nutrition} 
                    dayIndex={dayIndex} 
                    mealIndex={-1}
                  />
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MenuNutritionInfo;