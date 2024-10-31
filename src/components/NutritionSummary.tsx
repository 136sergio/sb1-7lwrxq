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
    { title: 'Proteínas', value: nutrition.proteins, color: '#10B981', shortLabel: 'P' },
    { title: 'Carbohidratos', value: nutrition.carbohydrates, color: '#3B82F6', shortLabel: 'C' },
    { title: 'Grasas', value: nutrition.fats, color: '#EF4444', shortLabel: 'G' },
    { title: 'Fibra', value: nutrition.fiber, color: '#8B5CF6', shortLabel: 'F' },
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
            label={({ dataEntry }) => (
              dataEntry.value > total * 0.1 ? dataEntry.shortLabel : ''
            )}
            labelStyle={{
              fontSize: '4px',
              fontFamily: 'sans-serif',
              fill: '#fff',
              fontWeight: 'bold',
            }}
            labelPosition={65}
          />
        </div>
        <span className="text-sm font-medium text-gray-600">
          {Math.round(nutrition.calories)} kcal
        </span>
      </div>

      {showDetails && (
        <div className="absolute z-10 bg-white rounded-lg shadow-lg p-4 min-w-[280px] top-full left-0 mt-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Calorías:</span>
              <span className="font-medium">{nutrition.calories.toFixed(1)} kcal</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
                <span className="text-gray-600">Proteínas:</span>
              </div>
              <span className="font-medium">{nutrition.proteins.toFixed(1)}g</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                <span className="text-gray-600">Carbohidratos:</span>
              </div>
              <span className="font-medium">{nutrition.carbohydrates.toFixed(1)}g</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                <span className="text-gray-600">Grasas:</span>
              </div>
              <span className="font-medium">{nutrition.fats.toFixed(1)}g</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
                <span className="text-gray-600">Fibra:</span>
              </div>
              <span className="font-medium">{nutrition.fiber.toFixed(1)}g</span>
            </div>

            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-gray-600">Sodio:</span>
              <span className="font-medium">{nutrition.sodium.toFixed(1)}mg</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionSummary;