import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { normalizeString } from '../utils/string';

export interface Ingredient {
  id: string;
  name: string;
  base_unit: string;
  category: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  sodium: number;
}

export function useIngredients(searchTerm: string) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const searchIngredients = async () => {
      if (!searchTerm.trim()) {
        setIngredients([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Normalizar el término de búsqueda
        const normalizedSearch = normalizeString(searchTerm);

        // Realizar la búsqueda usando ILIKE para coincidencia parcial
        const { data, error: searchError } = await supabase
          .from('ingredients')
          .select(`
            id,
            name,
            base_unit,
            category,
            calories,
            proteins,
            carbohydrates,
            fats,
            fiber,
            sodium
          `)
          .ilike('search_name', `%${normalizedSearch}%`)
          .limit(10);

        if (searchError) throw searchError;

        // Ordenar resultados por relevancia
        const sortedData = (data || []).sort((a, b) => {
          const aNameNorm = normalizeString(a.name);
          const bNameNorm = normalizeString(b.name);
          const searchNorm = normalizedSearch;

          // Coincidencia exacta (ignorando mayúsculas/minúsculas y acentos)
          if (aNameNorm === searchNorm) return -1;
          if (bNameNorm === searchNorm) return 1;

          // Coincidencia al inicio de la palabra
          if (aNameNorm.startsWith(searchNorm) && !bNameNorm.startsWith(searchNorm)) return -1;
          if (bNameNorm.startsWith(searchNorm) && !aNameNorm.startsWith(searchNorm)) return 1;

          // Coincidencia parcial - calcular la posición más cercana al inicio
          const aIndex = aNameNorm.indexOf(searchNorm);
          const bIndex = bNameNorm.indexOf(searchNorm);
          if (aIndex !== bIndex) return aIndex - bIndex;

          // Si las posiciones son iguales, priorizar nombres más cortos
          if (aNameNorm.length !== bNameNorm.length) {
            return aNameNorm.length - bNameNorm.length;
          }

          // Ordenar alfabéticamente si todo lo demás es igual
          return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
        });

        setIngredients(sortedData);
      } catch (err) {
        console.error('Error searching ingredients:', err);
        setError(err instanceof Error ? err : new Error('Error al buscar ingredientes'));
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchIngredients, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  return { ingredients, loading, error };
}