// React Hook for Salla Products

import { useState, useEffect, useCallback } from 'react';
import {
  sallaApi,
  SallaProduct,
  SallaApiResponse,
  SallaSearchParams,
  transformSallaProductToBazaar,
  handleSallaError,
} from '../services/salla';
import { Product } from '../models/Product.model';

interface UseSallaProductsOptions {
  autoFetch?: boolean;
  initialParams?: SallaSearchParams;
}

interface UseSallaProductsReturn {
  products: Product[];
  sallaProducts: SallaProduct[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  fetchProducts: (params?: SallaSearchParams) => Promise<void>;
  searchProducts: (query: string, filters?: Partial<SallaSearchParams>) => Promise<void>;
  refreshProducts: () => Promise<void>;
  clearError: () => void;
}

export function useSallaProducts(
  options: UseSallaProductsOptions = {}
): UseSallaProductsReturn {
  const { autoFetch = true, initialParams = {} } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [sallaProducts, setSallaProducts] = useState<SallaProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);
  const [lastParams, setLastParams] = useState<SallaSearchParams>(initialParams);

  const fetchProducts = useCallback(async (params: SallaSearchParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response: SallaApiResponse<SallaProduct[]> = await sallaApi.getProducts(params);
      
      if (response.success && response.data) {
        setSallaProducts(response.data);
        
        // Transform Salla products to Bazaar format
        const transformedProducts = response.data.map(transformSallaProductToBazaar);
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
        
        setLastParams(params);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (
    query: string,
    filters: Partial<SallaSearchParams> = {}
  ) => {
    const searchParams: SallaSearchParams = {
      query,
      ...filters,
    };

    try {
      setLoading(true);
      setError(null);
      
      const response: SallaApiResponse<SallaProduct[]> = await sallaApi.searchProducts(searchParams);
      
      if (response.success && response.data) {
        setSallaProducts(response.data);
        
        // Transform Salla products to Bazaar format
        const transformedProducts = response.data.map(transformSallaProductToBazaar);
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
        
        setLastParams(searchParams);
      } else {
        throw new Error('Invalid search response format');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error searching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    await fetchProducts(lastParams);
  }, [fetchProducts, lastParams]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchProducts(initialParams);
    }
  }, [autoFetch, fetchProducts, initialParams]);

  return {
    products,
    sallaProducts,
    loading,
    error,
    pagination,
    fetchProducts,
    searchProducts,
    refreshProducts,
    clearError,
  };
}

// Hook for fetching a single product
export function useSallaProduct(productId: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [sallaProduct, setSallaProduct] = useState<SallaProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const sallaProductData = await sallaApi.getProduct(id);
      setSallaProduct(sallaProductData);
      
      // Transform to Bazaar format
      const transformedProduct = transformSallaProductToBazaar(sallaProductData);
      setProduct(transformedProduct);
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    } else {
      setProduct(null);
      setSallaProduct(null);
      setError(null);
    }
  }, [productId, fetchProduct]);

  return {
    product,
    sallaProduct,
    loading,
    error,
    refetch: () => productId && fetchProduct(productId),
    clearError,
  };
}