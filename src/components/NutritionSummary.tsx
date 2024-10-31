import React, { useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';

interface NutritionProps {
  nutrition: {
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
    sodium: number;
  };
}

const NutritionSummary: React.FC<NutritionProps> = ({ nutrition }) => {
  const [showDetails, setShowDetails] = useState(false);

  const total = nutrition.proteins + nutrition.carbohydrates + nutrition.fats + nutrition.fiber;

  const pieData = [
    { title: 'Proteínas', value: nutrition.proteins, color: '#10B981' },
    { title: 'Carbohidratos', value: nutrition.carbohydrates, color: '#3B82F6' },
    { title: 'Grasas', value: nutrition.fats, color: '#EF4444' },
    { title: 'Fibra', value: nutrition.fiber, color: '#8B5CF6' },
  ].filter(item => item.value > 0);

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <div className="w-6 h-6">
          <PieChart
            data={pieData}
            lineWidth={20}
            paddingAngle={2}
          />
        </div>
        <span className="text-sm font-medium text-gray-600">
          {Math.round(nutrition.calories)} kcal
        </span>
      </div>

      {showDetails && (
        <div className="absolute z-10 bg-white rounded-lg shadow-lg p-4 min-w-[200px] top-full left-0 mt-2">
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

export default NutritionSummary;