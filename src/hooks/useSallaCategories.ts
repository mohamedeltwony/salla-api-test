// React Hook for Salla Categories

import { useState, useEffect, useCallback } from 'react';
import {
  sallaApi,
  SallaCategory,
  SallaApiResponse,
  transformSallaCategoryToBazaar,
  handleSallaError,
} from '../services/salla';
import { Category } from '../models/Category.model';

interface UseSallaCategoriesOptions {
  autoFetch?: boolean;
  includeChildren?: boolean;
}

interface UseSallaCategoriesReturn {
  categories: Category[];
  sallaCategories: SallaCategory[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getSallaCategoryById: (id: string) => SallaCategory | undefined;
  refreshCategories: () => Promise<void>;
  clearError: () => void;
}

export function useSallaCategories(
  options: UseSallaCategoriesOptions = {}
): UseSallaCategoriesReturn {
  const { autoFetch = true, includeChildren = true } = options;

  const [categories, setCategories] = useState<Category[]>([]);
  const [sallaCategories, setSallaCategories] = useState<SallaCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: SallaApiResponse<SallaCategory[]> = await sallaApi.getCategories();
      
      if (response.success && response.data) {
        setSallaCategories(response.data);
        
        // Transform Salla categories to Bazaar format
        const transformedCategories = response.data.map(transformSallaCategoryToBazaar);
        setCategories(transformedCategories);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategoryById = useCallback((id: string): Category | undefined => {
    const findCategory = (cats: Category[]): Category | undefined => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children && cat.children.length > 0) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findCategory(categories);
  }, [categories]);

  const getSallaCategoryById = useCallback((id: string): SallaCategory | undefined => {
    const findCategory = (cats: SallaCategory[]): SallaCategory | undefined => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children && cat.children.length > 0) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findCategory(sallaCategories);
  }, [sallaCategories]);

  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [autoFetch, fetchCategories]);

  return {
    categories,
    sallaCategories,
    loading,
    error,
    fetchCategories,
    getCategoryById,
    getSallaCategoryById,
    refreshCategories,
    clearError,
  };
}

// Hook for fetching a single category with its products
export function useSallaCategory(categoryId: string | null) {
  const [category, setCategory] = useState<Category | null>(null);
  const [sallaCategory, setSallaCategory] = useState<SallaCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const sallaCategoryData = await sallaApi.getCategory(id);
      setSallaCategory(sallaCategoryData);
      
      // Transform to Bazaar format
      const transformedCategory = transformSallaCategoryToBazaar(sallaCategoryData);
      setCategory(transformedCategory);
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error fetching category:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchCategory(categoryId);
    } else {
      setCategory(null);
      setSallaCategory(null);
      setError(null);
    }
  }, [categoryId, fetchCategory]);

  return {
    category,
    sallaCategory,
    loading,
    error,
    refetch: () => categoryId && fetchCategory(categoryId),
    clearError,
  };
}

// Hook for fetching category products
export function useSallaCategoryProducts(categoryId: string | null) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);

  const fetchCategoryProducts = useCallback(async (
    id: string,
    params: { page?: number; per_page?: number } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await sallaApi.getCategoryProducts(id, params);
      
      if (response.success && response.data) {
        // Transform products to Bazaar format
        const transformedProducts = response.data.map((product: any) => ({
          id: product.id,
          title: product.name,
          price: product.price.amount,
          sale_price: product.price.sale_price,
          thumbnail: product.images.find((img: any) => img.is_main)?.url || product.images[0]?.url || '',
          images: product.images.map((img: any) => img.url),
          rating: product.rating.average,
          reviews: product.rating.count,
          availability: product.is_available,
          stock: product.stock_quantity,
        }));
        
        setProducts(transformedProducts);
        
        // Set pagination info
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.currentPage,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.totalItems,
            hasNextPage: response.pagination.hasNextPage,
            hasPreviousPage: response.pagination.hasPreviousPage,
          });
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error fetching category products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryProducts(categoryId);
    } else {
      setProducts([]);
      setPagination(null);
      setError(null);
    }
  }, [categoryId, fetchCategoryProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts: (params?: { page?: number; per_page?: number }) => 
      categoryId && fetchCategoryProducts(categoryId, params),
    clearError,
  };
}