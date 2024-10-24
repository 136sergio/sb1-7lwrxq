import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Recipe, WeeklyMenu, recipeService, menuService } from '../services/database';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const refreshRecipes = useCallback(async () => {
    if (!user) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch (err) {
      console.error('Error loading recipes:', err);
      setError(err instanceof Error ? err : new Error('Error al cargar las recetas'));
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshRecipes();
  }, [refreshRecipes]);

  return { recipes, loading, error, setRecipes, refreshRecipes };
}

export function useWeeklyMenus() {
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const refreshMenus = useCallback(async () => {
    if (!user) {
      setMenus([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await menuService.getAll();
      setMenus(data);
    } catch (err) {
      console.error('Error loading menus:', err);
      setError(err instanceof Error ? err : new Error('Error al cargar los menús'));
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshMenus();
  }, [refreshMenus]);

  return { menus, loading, error, setMenus, refreshMenus };
}