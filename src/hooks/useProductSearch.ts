import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  brand?: string;
  image?: string;
  quantity?: string;
  nutrition?: {
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
    sodium: number;
  };
  url: string;
}

async function searchOpenFoodFacts(query: string): Promise<Product[]> {
  try {
    const response = await fetch(
      `https://es.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=24`,
      {
        headers: {
          'User-Agent': 'PlanificaTuMenu - React Web App - Version 1.0'
        }
      }
    );

    if (!response.ok) throw new Error('Error en la búsqueda de productos');

    const data = await response.json();
    
    return (data.products || [])
      .filter((product: any) => 
        product.product_name_es || 
        product.product_name
      )
      .map((product: any) => ({
        id: product.code,
        name: product.product_name_es || product.product_name,
        brand: product.brands,
        image: product.image_url,
        quantity: product.quantity,
        url: `https://es.openfoodfacts.org/producto/${product.code}`,
        nutrition: product.nutriments ? {
          calories: product.nutriments['energy-kcal_100g'] || 0,
          proteins: product.nutriments.proteins_100g || 0,
          carbohydrates: product.nutriments.carbohydrates_100g || 0,
          fats: product.nutriments.fat_100g || 0,
          fiber: product.nutriments.fiber_100g || 0,
          sodium: product.nutriments.sodium_100g || 0
        } : undefined
      }));
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

export function useProductSearch(searchTerm: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        setProducts([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const results = await searchOpenFoodFacts(searchTerm);
        
        // Ordenar por relevancia
        const sortedProducts = results.sort((a, b) => {
          // Primero productos con información nutricional
          if (a.nutrition && !b.nutrition) return -1;
          if (!a.nutrition && b.nutrition) return 1;

          // Luego por relevancia del nombre
          const aRelevance = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
          const bRelevance = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
          if (aRelevance !== bRelevance) return bRelevance - aRelevance;

          return 0;
        });

        setProducts(sortedProducts);
      } catch (err) {
        console.error('Error searching products:', err);
        setError('Error al buscar productos');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchProducts, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  return { products, loading, error };
}