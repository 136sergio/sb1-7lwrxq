import { MealPlanItem, Recipe } from '../types/menu';

export function getMealTypes(count: number): string[] {
  switch (count) {
    case 1: return ['Comida'];
    case 2: return ['Comida', 'Cena'];
    case 3: return ['Desayuno', 'Comida', 'Cena'];
    case 4: return ['Desayuno', 'Comida', 'Merienda', 'Cena'];
    case 5: return ['Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena'];
    case 6: return ['Desayuno', 'Media Mañana', 'Almuerzo', 'Comida', 'Merienda', 'Cena'];
    default: return ['Desayuno', 'Comida', 'Merienda', 'Cena'];
  }
}

export function generateRandomMenu(recipes: Recipe[], mealTypes: string[], weekDays: string[]): MealPlanItem[][][] {
  // Crear un mapa de recetas por tipo de comida y día
  const recipeMap = new Map<string, Recipe[]>();
  
  mealTypes.forEach(mealType => {
    weekDays.forEach(weekDay => {
      const key = `${mealType}-${weekDay}`;
      const filteredRecipes = recipes.filter(recipe => {
        const matchesMealType = recipe.meal_types.length === 0 || recipe.meal_types.includes(mealType);
        const matchesWeekDay = recipe.week_days.length === 0 || recipe.week_days.includes(weekDay);
        return matchesMealType && matchesWeekDay;
      });
      recipeMap.set(key, filteredRecipes);
    });
  });

  // Generar el menú aleatorio
  const randomMenu: MealPlanItem[][][] = Array(7).fill(null).map(() => 
    Array(mealTypes.length).fill(null).map(() => [])
  );

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    for (let mealIndex = 0; mealIndex < mealTypes.length; mealIndex++) {
      const mealType = mealTypes[mealIndex];
      const weekDay = weekDays[dayIndex];
      const key = `${mealType}-${weekDay}`;
      const availableRecipes = [...(recipeMap.get(key) || [])];

      if (availableRecipes.length > 0) {
        // Seleccionar 1-2 recetas aleatorias para cada comida
        const numRecipes = Math.floor(Math.random() * 2) + 1;
        const selectedRecipes: MealPlanItem[] = [];

        for (let i = 0; i < numRecipes && i < availableRecipes.length; i++) {
          const randomIndex = Math.floor(Math.random() * availableRecipes.length);
          const recipe = availableRecipes[randomIndex];
          selectedRecipes.push({
            recipeName: recipe.name,
            quantity: 1
          });
          // Eliminar la receta seleccionada para evitar duplicados
          availableRecipes.splice(randomIndex, 1);
        }

        randomMenu[dayIndex][mealIndex] = selectedRecipes;
      }
    }
  }

  return randomMenu;
}