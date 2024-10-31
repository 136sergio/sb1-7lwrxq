import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, Eye } from 'lucide-react';
import RecipeSelectionModal from '../components/RecipeSelectionModal';
import ProductSearchModal from '../components/ProductSearchModal';
import ProductQuantityModal from '../components/ProductQuantityModal';
import AddMenuItemModal from '../components/AddMenuItemModal';
import BackButton from '../components/BackButton';
import WeekSelector from '../components/WeekSelector';
import MenuTable from '../components/MenuTable';
import MenuNutritionInfo from '../components/MenuNutritionInfo';
import { menuService, recipeService } from '../services/database';
import { useRecipes } from '../hooks/useSupabase';
import { getMealTypes, generateRandomMenu } from '../utils/menu';

const AddWeeklyMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { recipes } = useRecipes();
  const [menuName, setMenuName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealCount, setMealCount] = useState(4);
  const [mealTypes, setMealTypes] = useState<string[]>(['Desayuno', 'Comida', 'Merienda', 'Cena']);
  const [mealPlan, setMealPlan] = useState<any[][][]>(Array(7).fill(null).map(() => Array(4).fill([])));
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductQuantityModal, setShowProductQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showNutritionInfo, setShowNutritionInfo] = useState(false);

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  React.useEffect(() => {
    setMenuName(generateDefaultMenuName(selectedDate));
  }, [selectedDate]);

  const generateDefaultMenuName = (date: Date) => {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const formatDate = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    const year = weekEnd.getFullYear();
    
    return `Menú Semana del ${formatDate(weekStart)} al ${formatDate(weekEnd)} de ${year}`;
  };

  const handleMealCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMealCount = Number(e.target.value);
    setMealCount(newMealCount);
    const newMealTypes = getMealTypes(newMealCount);
    setMealTypes(newMealTypes);
    setMealPlan(Array(7).fill(null).map(() => Array(newMealCount).fill([])));
    setHasChanges(true);
  };

  const handleSelectRecipe = async (recipe: any) => {
    try {
      const recipeDetails = await recipeService.getById(recipe.id);
      if (recipeDetails) {
        const nutrition = recipeDetails.recipe_ingredients?.reduce((acc, ingredient) => {
          if (ingredient.calories === undefined) return acc;
          const ratio = ingredient.quantity / 100;
          return {
            calories: acc.calories + (ingredient.calories * ratio),
            proteins: acc.proteins + ((ingredient.proteins || 0) * ratio),
            carbohydrates: acc.carbohydrates + ((ingredient.carbohydrates || 0) * ratio),
            fats: acc.fats + ((ingredient.fats || 0) * ratio),
            fiber: acc.fiber + ((ingredient.fiber || 0) * ratio),
            sodium: acc.sodium + ((ingredient.sodium || 0) * ratio)
          };
        }, {
          calories: 0,
          proteins: 0,
          carbohydrates: 0,
          fats: 0,
          fiber: 0,
          sodium: 0
        });

        const newMealPlan = [...mealPlan];
        if (newMealPlan[currentDayIndex][currentMealIndex].length < 4) {
          newMealPlan[currentDayIndex][currentMealIndex] = [
            ...newMealPlan[currentDayIndex][currentMealIndex],
            { recipeName: recipe.name, quantity: 1, nutrition }
          ];
          setMealPlan(newMealPlan);
          setHasChanges(true);
        }
      }
    } catch (error) {
      console.error('Error loading recipe details:', error);
    }
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setShowProductModal(false);
    setShowProductQuantityModal(true);
  };

  const handleConfirmProductQuantity = (quantity: number) => {
    if (selectedProduct) {
      const newMealPlan = [...mealPlan];
      if (newMealPlan[currentDayIndex][currentMealIndex].length < 4) {
        const ratio = quantity / 100;
        const nutrition = selectedProduct.nutrition ? {
          calories: (selectedProduct.nutrition.calories || 0) * ratio,
          proteins: (selectedProduct.nutrition.proteins || 0) * ratio,
          carbohydrates: (selectedProduct.nutrition.carbohydrates || 0) * ratio,
          fats: (selectedProduct.nutrition.fats || 0) * ratio,
          fiber: (selectedProduct.nutrition.fiber || 0) * ratio,
          sodium: (selectedProduct.nutrition.sodium || 0) * ratio
        } : {
          calories: 0,
          proteins: 0,
          carbohydrates: 0,
          fats: 0,
          fiber: 0,
          sodium: 0
        };

        newMealPlan[currentDayIndex][currentMealIndex] = [
          ...newMealPlan[currentDayIndex][currentMealIndex],
          {
            recipeName: selectedProduct.name,
            quantity,
            isProduct: true,
            nutrition
          }
        ];
        setMealPlan(newMealPlan);
        setHasChanges(true);
      }
    }
    setShowProductQuantityModal(false);
    setSelectedProduct(null);
    setShowAddItemModal(true);
  };

  const handleGenerateRandomMenu = () => {
    const randomMenu = generateRandomMenu(recipes, mealTypes, weekDays);
    setMealPlan(randomMenu);
    setHasChanges(true);
  };

  const handleRemoveItem = (dayIndex: number, mealIndex: number, itemIndex: number) => {
    const newMealPlan = [...mealPlan];
    newMealPlan[dayIndex][mealIndex] = newMealPlan[dayIndex][mealIndex].filter((_, index) => index !== itemIndex);
    setMealPlan(newMealPlan);
    setHasChanges(true);
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await menuService.create({
        name: menuName,
        year: selectedDate.getFullYear(),
        week: getWeekNumber(selectedDate),
        meal_count: mealCount,
        meal_types: mealTypes,
        meal_plan: mealPlan
      });
      navigate('/menus');
    } catch (error) {
      console.error('Error creating menu:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseRecipeModal = () => {
    setShowRecipeModal(false);
    setShowAddItemModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setShowAddItemModal(true);
  };

  const handleCloseProductQuantityModal = () => {
    setShowProductQuantityModal(false);
    setSelectedProduct(null);
    setShowAddItemModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton showConfirmation={true} hasChanges={hasChanges} />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Añadir Menú Semanal</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex-grow">
            <label htmlFor="menuName" className="block text-sm font-medium text-gray-700">Nombre del menú</label>
            <input
              type="text"
              id="menuName"
              value={menuName}
              onChange={(e) => {
                setMenuName(e.target.value);
                setHasChanges(true);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Semana</label>
            <WeekSelector
              selectedDate={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setHasChanges(true);
              }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="mealCount" className="block text-sm font-medium text-gray-700">Cantidad de comidas</label>
          <select
            id="mealCount"
            value={mealCount}
            onChange={handleMealCountChange}
            className="mt-1 block w-40 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowNutritionInfo(!showNutritionInfo)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="h-5 w-5 mr-2" />
            {showNutritionInfo ? 'Ocultar información nutricional' : 'Ver información nutricional'}
          </button>

          <button
            type="button"
            onClick={handleGenerateRandomMenu}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Shuffle className="h-5 w-5 mr-2" />
            Generar menú aleatorio
          </button>
        </div>

        <MenuTable
          mealPlan={mealPlan}
          mealTypes={mealTypes}
          weekDays={weekDays}
          showNutritionInfo={showNutritionInfo}
          currentDayIndex={currentDayIndex}
          currentMealIndex={currentMealIndex}
          onAddItem={(dayIndex, mealIndex) => {
            setCurrentDayIndex(dayIndex);
            setCurrentMealIndex(mealIndex);
            setShowAddItemModal(true);
          }}
          onRemoveItem={handleRemoveItem}
        />

        {showNutritionInfo && (
          <MenuNutritionInfo
            mealPlan={mealPlan}
            mealTypes={mealTypes}
            weekDays={weekDays}
          />
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Guardando...
              </div>
            ) : (
              'Guardar Menú Semanal'
            )}
          </button>
        </div>
      </form>

      <AddMenuItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onSelectRecipe={() => {
          setShowAddItemModal(false);
          setShowRecipeModal(true);
        }}
        onSelectProduct={() => {
          setShowAddItemModal(false);
          setShowProductModal(true);
        }}
      />

      <RecipeSelectionModal
        isOpen={showRecipeModal}
        onClose={handleCloseRecipeModal}
        onSelectRecipe={handleSelectRecipe}
        mealType={mealTypes[currentMealIndex]}
        weekDay={weekDays[currentDayIndex]}
        usedRecipes={new Set(mealPlan[currentDayIndex][currentMealIndex].map(item => item.recipeName))}
      />

      <ProductSearchModal
        isOpen={showProductModal}
        onClose={handleCloseProductModal}
        onSelectProduct={handleSelectProduct}
      />

      {selectedProduct && (
        <ProductQuantityModal
          isOpen={showProductQuantityModal}
          onClose={handleCloseProductQuantityModal}
          onConfirm={handleConfirmProductQuantity}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default AddWeeklyMenuPage;