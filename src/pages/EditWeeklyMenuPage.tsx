import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Shuffle, Eye } from 'lucide-react';
import RecipeSelectionModal from '../components/RecipeSelectionModal';
import ProductSearchModal from '../components/ProductSearchModal';
import ProductQuantityModal from '../components/ProductQuantityModal';
import AddMenuItemModal from '../components/AddMenuItemModal';
import BackButton from '../components/BackButton';
import WeekSelector from '../components/WeekSelector';
import MenuNutritionInfo from '../components/MenuNutritionInfo';
import MenuItemNutrition from '../components/MenuItemNutrition';
import { menuService, recipeService } from '../services/database';
import { useRecipes } from '../hooks/useSupabase';
import { MealPlanItem } from '../types/menu';
import { getMealTypes, generateRandomMenu } from '../utils/menu';

const EditWeeklyMenuPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipes } = useRecipes();
  const [menuName, setMenuName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealCount, setMealCount] = useState(4);
  const [mealTypes, setMealTypes] = useState<string[]>(['Desayuno', 'Comida', 'Merienda', 'Cena']);
  const [mealPlan, setMealPlan] = useState<MealPlanItem[][][]>(Array(7).fill(null).map(() => Array(4).fill([])));
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductQuantityModal, setShowProductQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showNutritionInfo, setShowNutritionInfo] = useState(false);

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    const loadMenu = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const menu = await menuService.getById(id);
        if (menu) {
          setMenuName(menu.name);
          
          const date = new Date();
          date.setFullYear(menu.year);
          date.setDate(1);
          date.setMonth(0);
          date.setDate((menu.week * 7) - 3);
          setSelectedDate(date);
          
          setMealCount(menu.meal_count);
          setMealTypes(menu.meal_types);
          setMealPlan(menu.meal_plan);
        }
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [id]);

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
    setShowRecipeModal(false);
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
          calories: selectedProduct.nutrition.calories * ratio,
          proteins: (selectedProduct.nutrition.proteins || 0) * ratio,
          carbohydrates: (selectedProduct.nutrition.carbohydrates || 0) * ratio,
          fats: (selectedProduct.nutrition.fats || 0) * ratio,
          fiber: (selectedProduct.nutrition.fiber || 0) * ratio,
          sodium: (selectedProduct.nutrition.sodium || 0) * ratio
        } : undefined;

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
      setShowProductQuantityModal(false);
      setSelectedProduct(null);
    }
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
    if (!id) return;

    setIsSubmitting(true);
    try {
      await menuService.update(id, {
        name: menuName,
        year: selectedDate.getFullYear(),
        week: getWeekNumber(selectedDate),
        meal_count: mealCount,
        meal_types: mealTypes,
        meal_plan: mealPlan
      });
      navigate('/menus');
    } catch (error) {
      console.error('Error updating menu:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton showConfirmation={true} hasChanges={hasChanges} />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Editar Menú Semanal</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex-grow">
            <label htmlFor="menuName" className="block text-sm font-medium text-gray-700">Nombre del menú</label>
            <input
              type="text"
              id="menuName"
              va