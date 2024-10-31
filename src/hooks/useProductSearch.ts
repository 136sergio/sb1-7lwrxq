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

function searchOpenFoodFacts(query: string): Promise<Product[]> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    const callbackName = 'openFoodFactsCallback' + Date.now();

    (window as any)[callbackName] = (data: any) => {
      document.body.removeChild(script);
      delete (window as any)[callbackName];

      const products = (data.products || [])
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
          nutrition: {
            calories: parseFloat(product.nutriments['energy-kcal_100g']) || 0,
            proteins: parseFloat(product.nutriments.proteins_100g) || 0,
            carbohydrates: parseFloat(product.nutriments.carbohydrates_100g) || 0,
            fats: parseFloat(product.nutriments.fat_100g) || 0,
            fiber: parseFloat(product.nutriments.fiber_100g) || 0,
            sodium: parseFloat(product.nutriments.sodium_100g) || 0
          }
        }));

      resolve(products);
    };

    script.src = `https://es.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=24&callback=${callbackName}`;
    document.body.appendChild(script);

    script.onerror = () => {
      document.body.removeChild(script);
      delete (window as any)[callbackName];
      resolve([]);
    };

    setTimeout(() => {
      if ((window as any)[callbackName]) {
        document.body.removeChild(script);
        delete (window as any)[callbackName];
        resolve([]);
      }
    }, 5000);
  });
}

export function useProductSearch(searchTerm: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        setProducts([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const results = await searchOpenFoodFacts(searchTerm);
        
        if (!mounted) return;

        const sortedProducts = results.sort((a, b) => {
          if (a.nutrition && !b.nutrition) return -1;
          if (!a.nutrition && b.nutrition) return 1;

          const aRelevance = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
          const bRelevance = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
          if (aRelevance !== bRelevance) return bRelevance - aRelevance;

          return 0;
        });

        setProducts(sortedProducts);
      } catch (err) {
        if (!mounted) return;
        console.error('Error searching products:', err);
        setError('Error al buscar productos');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const debounceTimeout = setTimeout(searchProducts, 300);
    
    return () => {
      mounted = false;
      clearTimeout(debounceTimeout);
    };
  }, [searchTerm]);

  return { products, loading, error };
}