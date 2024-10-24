import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { menuService } from '../services/database';

interface MealPlanItem {
  recipeName: string;
  quantity: number;
}

interface WeeklyMenu {
  id: string;
  name: string;
  year: number;
  week: number;
  meal_count: number;
  meal_types: string[];
  meal_plan: MealPlanItem[][][];
}

const ViewWeeklyMenuPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [loading, setLoading] = useState(true);

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    const loadMenu = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const menuData = await menuService.getById(id);
        if (menuData) {
          setMenu(menuData);
        }
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton customPath="/menus" />
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>No se encontró el menú solicitado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton customPath="/menus" />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 break-words">{menu.name}</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-50"></th>
                {weekDays.map((day) => (
                  <th key={day} className="border border-gray-300 p-2 bg-gray-50 text-sm font-medium text-gray-700 whitespace-nowrap">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {menu.meal_types.map((mealType, mealIndex) => (
                <tr key={mealType}>
                  <td className="border border-gray-300 p-2 font-medium bg-gray-50 text-sm text-gray-700 whitespace-nowrap">
                    {mealType}
                  </td>
                  {weekDays.map((_, dayIndex) => (
                    <td key={`${mealType}-${dayIndex}`} className="border border-gray-300 p-2">
                      {menu.meal_plan[dayIndex][mealIndex].map((item, recipeIndex) => (
                        <div key={`${item.recipeName}-${recipeIndex}`} className="text-sm text-gray-600 break-words">
                          {item.recipeName}
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewWeeklyMenuPage;