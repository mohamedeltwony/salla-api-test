// React Hook for Salla Shopping Cart

import { useState, useEffect, useCallback } from 'react';
import {
  sallaApi,
  SallaCart,
  SallaCartItem,
  SallaApiResponse,
  transformSallaCartToBazaar,
  handleSallaError,
} from '../services/salla';

interface UseSallaCartOptions {
  autoFetch?: boolean;
  syncWithLocalStorage?: boolean;
}

interface UseSallaCartReturn {
  cart: SallaCart | null;
  cartItems: SallaCartItem[];
  loading: boolean;
  error: string | null;
  itemCount: number;
  totalAmount: number;
  subtotalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  addToCart: (productId: string, quantity?: number, options?: any) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
}

export function useSallaCart(
  options: UseSallaCartOptions = {}
): UseSallaCartReturn {
  const { autoFetch = true, syncWithLocalStorage = true } = options;

  const [cart, setCart] = useState<SallaCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const cartItems = cart?.items || [];
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart?.totals.total.amount || 0;
  const subtotalAmount = cart?.totals.subtotal.amount || 0;
  const taxAmount = cart?.totals.tax.amount || 0;
  const shippingAmount = cart?.totals.shipping.amount || 0;
  const discountAmount = cart?.totals.discount.amount || 0;

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: SallaApiResponse<SallaCart> = await sallaApi.getCart();
      
      if (response.success && response.data) {
        setCart(response.data);
        
        // Sync with local storage if enabled
        if (syncWithLocalStorage) {
          const bazaarCart = transformSallaCartToBazaar(response.data);
          localStorage.setItem('bazaar_cart', JSON.stringify(bazaarCart));
        }
      } else {
        throw new Error('Invalid cart response format');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [syncWithLocalStorage]);

  const addToCart = useCallback(async (
    productId: string,
    quantity: number = 1,
    options: any = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response: SallaApiResponse<SallaCart> = await sallaApi.addToCart({
        product_id: productId,
        quantity,
        ...options,
      });
      
      if (response.success && response.data) {
        setCart(response.data);
        
        // Sync with local storage if enabled
        if (syncWithLocalStorage) {
          const bazaarCart = transformSallaCartToBazaar(response.data);
          localStorage.setItem('bazaar_cart', JSON.stringify(bazaarCart));
        }
      } else {
        throw new Error('Failed to add item to cart');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error adding to cart:', err);
      throw err; // Re-throw for component handling
    } finally {
      setLoading(false);
    }
  }, [syncWithLocalStorage]);

  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      const response: SallaApiResponse<SallaCart> = await sallaApi.updateCartItem(itemId, {
        quantity,
      });
      
      if (response.success && response.data) {
        setCart(response.data);
        
        // Sync with local storage if enabled
        if (syncWithLocalStorage) {
          const bazaarCart = transformSallaCartToBazaar(response.data);
          localStorage.setItem('bazaar_cart', JSON.stringify(bazaarCart));
        }
      } else {
        throw new Error('Failed to update cart item');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error updating cart item:', err);
    } finally {
      setLoading(false);
    }
  }, [syncWithLocalStorage]);

  const removeFromCart = useCallback(async (itemId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response: SallaApiResponse<SallaCart> = await sallaApi.removeFromCart(itemId);
      
      if (response.success && response.data) {
        setCart(response.data);
        
        // Sync with local storage if enabled
        if (syncWithLocalStorage) {
          const bazaarCart = transformSallaCartToBazaar(response.data);
          localStorage.setItem('bazaar_cart', JSON.stringify(bazaarCart));
        }
      } else {
        throw new Error('Failed to remove item from cart');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error removing from cart:', err);
    } finally {
      setLoading(false);
    }
  }, [syncWithLocalStorage]);

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: SallaApiResponse<SallaCart> = await sallaApi.clearCart();
      
      if (response.success && response.data) {
        setCart(response.data);
        
        // Clear local storage if enabled
        if (syncWithLocalStorage) {
          localStorage.removeItem('bazaar_cart');
        }
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error clearing cart:', err);
    } finally {
      setLoading(false);
    }
  }, [syncWithLocalStorage]);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchCart();
    }
  }, [autoFetch, fetchCart]);

  return {
    cart,
    cartItems,
    loading,
    error,
    itemCount,
    totalAmount,
    subtotalAmount,
    taxAmount,
    shippingAmount,
    discountAmount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    refreshCart,
    clearError,
  };
}

// Hook for cart item operations
export function useSallaCartItem(itemId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQuantity = useCallback(async (quantity: number) => {
    if (!itemId) return;
    
    setLoading(true);
    setError(null);

    try {
      await sallaApi.updateCartItem(itemId, { quantity });
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error updating cart item quantity:', err);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  const remove = useCallback(async () => {
    if (!itemId) return;
    
    setLoading(true);
    setError(null);

    try {
      await sallaApi.removeFromCart(itemId);
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error removing cart item:', err);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    updateQuantity,
    remove,
    clearError,
  };
}