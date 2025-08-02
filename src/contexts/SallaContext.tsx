// Salla API Context Provider

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  sallaApi,
  SallaProduct,
  SallaCategory,
  SallaCart,
  SallaUser,
  handleSallaError,
} from '../services/salla';

// Types
interface SallaState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: SallaUser | null;
  cart: SallaCart | null;
  categories: SallaCategory[];
  featuredProducts: SallaProduct[];
  loading: {
    auth: boolean;
    cart: boolean;
    categories: boolean;
    products: boolean;
  };
  error: {
    auth: string | null;
    cart: string | null;
    categories: string | null;
    products: string | null;
    general: string | null;
  };
}

type SallaAction =
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_USER'; payload: SallaUser | null }
  | { type: 'SET_CART'; payload: SallaCart | null }
  | { type: 'SET_CATEGORIES'; payload: SallaCategory[] }
  | { type: 'SET_FEATURED_PRODUCTS'; payload: SallaProduct[] }
  | { type: 'SET_LOADING'; payload: { key: keyof SallaState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof SallaState['error']; value: string | null } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_STATE' };

interface SallaContextType {
  state: SallaState;
  dispatch: React.Dispatch<SallaAction>;
  // Auth methods
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  // Cart methods
  addToCart: (productId: string, quantity?: number, options?: any) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  // Data fetching methods
  fetchCategories: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  // Utility methods
  initialize: () => Promise<void>;
  clearError: (key: keyof SallaState['error']) => void;
  clearAllErrors: () => void;
}

// Initial state
const initialState: SallaState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  cart: null,
  categories: [],
  featuredProducts: [],
  loading: {
    auth: false,
    cart: false,
    categories: false,
    products: false,
  },
  error: {
    auth: null,
    cart: null,
    categories: null,
    products: null,
    general: null,
  },
};

// Reducer
function sallaReducer(state: SallaState, action: SallaAction): SallaState {
  switch (action.type) {
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_FEATURED_PRODUCTS':
      return { ...state, featuredProducts: action.payload };
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: { ...state.error, [action.payload.key]: action.payload.value },
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: {
          auth: null,
          cart: null,
          categories: null,
          products: null,
          general: null,
        },
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context
const SallaContext = createContext<SallaContextType | undefined>(undefined);

// Provider component
interface SallaProviderProps {
  children: ReactNode;
}

export function SallaProvider({ children }: SallaProviderProps) {
  const [state, dispatch] = useReducer(sallaReducer, initialState);

  // Auth methods
  const login = async (credentials: { email: string; password: string }) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'auth', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'auth', value: null } });

    try {
      const response = await sallaApi.login(credentials);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        dispatch({ type: 'SET_USER', payload: response.data.user });
        
        // Fetch user's cart after login
        await fetchCart();
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      const errorMessage = handleSallaError(error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'auth', value: errorMessage } });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'auth', value: false } });
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'auth', value: true } });

    try {
      await sallaApi.logout();
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_CART', payload: null });
    } catch (error: any) {
      const errorMessage = handleSallaError(error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'auth', value: errorMessage } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'auth', value: false } });
    }
  };

  const register = async (userData: any) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'auth', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'auth', value: null } });

    try {
      const response = await sallaApi.register(userData);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        dispatch({ type: 'SET_USER', payload: response.data.user });
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      const errorMessage = handleSallaError(error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'auth', value: errorMessage } });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'auth', value: false } });
    }
  };

  // Cart methods
  const fetchCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'cart', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'cart', value: null } });

    try {
      const response = await sallaApi.getCart();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (error: any) {
      const errorMessage = handleSallaError(error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'cart', value: errorMessage } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'cart', value: false } });
    }
  };

  const addToCart = async (productId: string, quantity = 1, options: any = {}) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'cart', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'cart', value: null } });

    try {
      const response = await sallaApi.addToCart({
        product_id: productId,
        quantity,
        ...options,
      });
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (error: any) {
      const errorMessage = handleSallaError(error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'cart', value: errorMessage } });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'cart', value: false } });
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'cart', value: true } });

    try {
      const response = await sallaApi.updateCartItem(itemId, { quantity });
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (error: any) {
      const errorMessage = handleSallaError(error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'cart', value: errorMessage } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'cart', value: false } });
    }
  };

  const removeFromCart = async (itemId: string) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'cart', value: true } });

    try {
      const response = await sallaApi.removeFromCart(itemId);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (error: any) {
      const errorMessage = handleSallaError(error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'cart', value: errorMessage } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'cart', value: false } });
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'cart', value: true } });

    try {
      const response = await sallaApi.clearCart();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (error: any) {
      const errorMessage = handleSallaError(error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'cart', value: errorMessage } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'cart', value: false } });
    }
  };

  // Data fetching methods
  const fetchCategories = async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'categories', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'categories', value: null } });

    try {
      const response = await sallaApi.getCategories();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CATEGORIES', payload: response.data });
      }
    } catch (error: any) {
      const errorMessage = handleSallaError(error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'categories', value: errorMessage } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'categories', value: false } });
    }
  };

  const fetchFeaturedProducts = async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'products', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'products', value: null } });

    try {
      const response = await sallaApi.getProducts({ featured: true, per_page: 12 });
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_FEATURED_PRODUCTS', payload: response.data });
      }
    } catch (error: any) {
      const errorMessage = handleSallaError(error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'products', value: errorMessage } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'products', value: false } });
    }
  };

  const fetchUserProfile = async () => {
    if (!state.isAuthenticated) return;

    dispatch({ type: 'SET_LOADING', payload: { key: 'auth', value: true } });

    try {
      const response = await sallaApi.getUserProfile();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data });
      }
    } catch (error: any) {
      const errorMessage = handleSallaError(error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'auth', value: errorMessage } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'auth', value: false } });
    }
  };

  // Initialize the Salla context
  const initialize = async () => {
    try {
      // Check if user is already authenticated
      const token = localStorage.getItem('salla_access_token');
      if (token) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        await Promise.all([
          fetchUserProfile(),
          fetchCart(),
        ]);
      }

      // Always fetch categories and featured products
      await Promise.all([
        fetchCategories(),
        fetchFeaturedProducts(),
      ]);
    } catch (error) {
      console.error('Error initializing Salla context:', error);
    } finally {
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  };

  // Utility methods
  const clearError = (key: keyof SallaState['error']) => {
    dispatch({ type: 'SET_ERROR', payload: { key, value: null } });
  };

  const clearAllErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  const contextValue: SallaContextType = {
    state,
    dispatch,
    login,
    logout,
    register,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCategories,
    fetchFeaturedProducts,
    fetchUserProfile,
    initialize,
    clearError,
    clearAllErrors,
  };

  return (
    <SallaContext.Provider value={contextValue}>
      {children}
    </SallaContext.Provider>
  );
}

// Hook to use Salla context
export function useSalla() {
  const context = useContext(SallaContext);
  if (context === undefined) {
    throw new Error('useSalla must be used within a SallaProvider');
  }
  return context;
}

// Export types for external use
export type { SallaState, SallaAction, SallaContextType };