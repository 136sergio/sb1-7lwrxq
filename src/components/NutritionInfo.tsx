import React from 'react';
import { PieChart } from 'react-minimal-pie-chart';

interface Ingredient {
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
}

interface NutritionSummary {
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  sodium: number;
}

interface NutritionInfoProps {
  ingredients: Ingredient[];
}

const NutritionInfo: React.FC<NutritionInfoProps> = ({ ingredients }) => {
  const nutritionSummary = ingredients.reduce<NutritionSummary>(
    (acc, ingredient) => {
      if (ingredient.calories !== undefined) {
        const ratio = ingredient.quantity / 100; // Los valores nutricionales son por 100g/ml
        return {
          calories: acc.calories + (ingredient.calories * ratio),
          proteins: acc.proteins + ((ingredient.proteins || 0) * ratio),
          carbohydrates: acc.carbohydrates + ((ingredient.carbohydrates || 0) * ratio),
          fats: acc.fats + ((ingredient.fats || 0) * ratio),
          fiber: acc.fiber + ((ingredient.fiber || 0) * ratio),
          sodium: acc.sodium + ((ingredient.sodium || 0) * ratio)
        };
      }
      return acc;
    },
    { calories: 0, proteins: 0, carbohydrates: 0, fats: 0, fiber: 0, sodium: 0 }
  );

  const total = nutritionSummary.proteins + nutritionSummary.carbohydrates + 
                nutritionSummary.fats + nutritionSummary.fiber;

  const pieData = [
    { title: 'Proteínas', value: nutritionSummary.proteins, color: '#10B981' },
    { title: 'Carbohidratos', value: nutritionSummary.carbohydrates, color: '#3B82F6' },
    { title: 'Grasas', value: nutritionSummary.fats, color: '#EF4444' },
    { title: 'Fibra', value: nutritionSummary.fiber, color: '#8B5CF6' },
  ].filter(item => item.value > 0);

  if (total === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Nutricional</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="text-gray-600">Calorías:</div>
          <div className="text-right font-medium">{nutritionSummary.calories.toFixed(1)} kcal</div>
          
          <div className="text-gray-600">Proteínas:</div>
          <div className="text-right font-medium">{nutritionSummary.proteins.toFixed(1)}g</div>
          
          <div className="text-gray-600">Carbohidratos:</div>
          <div className="text-right font-medium">{nutritionSummary.carbohydrates.toFixed(1)}g</div>
          
          <div className="text-gray-600">Grasas:</div>
          <div className="text-right font-medium">{nutritionSummary.fats.toFixed(1)}g</div>
          
          <div className="text-gray-600">Fibra:</div>
          <div className="text-right font-medium">{nutritionSummary.fiber.toFixed(1)}g</div>
          
          <div className="text-gray-600">Sodio:</div>
          <div className="text-right font-medium">{nutritionSummary.sodium.toFixed(1)}mg</div>
        </div>

        {total > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-48 h-48">
              <PieChart
                data={pieData}
                lineWidth={40}
                paddingAngle={2}
                label={({ dataEntry }) => `${Math.round((dataEntry.value / total) * 100)}%`}
                labelStyle={{
                  fontSize: '4px',
                  fontFamily: 'sans-serif',
                  fill: '#fff',
                }}
                labelPosition={75}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {pieData.map((item) => (
                <div key={item.title} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionInfo;