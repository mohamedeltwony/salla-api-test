// React Hooks for Salla Orders and Checkout

import { useState, useEffect, useCallback } from 'react';
import {
  sallaOrdersService,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrdersQueryParams,
  CheckoutSessionRequest,
  CheckoutSession,
  PaymentIntent,
  OrderTracking,
  ShippingMethod,
  PaymentMethodOption,
} from '../services/salla/orders';
import {
  SallaOrder,
  SallaShippingAddress,
  SallaBillingAddress,
  handleSallaError,
} from '../services/salla';

// Orders hook
interface UseSallaOrdersOptions {
  autoFetch?: boolean;
  initialParams?: OrdersQueryParams;
}

interface UseSallaOrdersReturn {
  orders: SallaOrder[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  fetchOrders: (params?: OrdersQueryParams) => Promise<void>;
  refreshOrders: () => Promise<void>;
  clearError: () => void;
}

export function useSallaOrders(
  options: UseSallaOrdersOptions = {}
): UseSallaOrdersReturn {
  const { autoFetch = true, initialParams = {} } = options;

  const [orders, setOrders] = useState<SallaOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentParams, setCurrentParams] = useState<OrdersQueryParams>(initialParams);

  const fetchOrders = useCallback(async (params: OrdersQueryParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const mergedParams = { ...currentParams, ...params };
      const response = await sallaOrdersService.getOrders(mergedParams);
      
      if (response.success && response.data) {
        setOrders(response.data);
        setCurrentParams(mergedParams);
        
        // Update pagination if available
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.current_page,
            totalPages: response.pagination.last_page,
            totalItems: response.pagination.total,
            hasNextPage: response.pagination.current_page < response.pagination.last_page,
            hasPrevPage: response.pagination.current_page > 1,
          });
        }
      } else {
        throw new Error('Invalid orders response format');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [currentParams]);

  const refreshOrders = useCallback(async () => {
    await fetchOrders(currentParams);
  }, [fetchOrders, currentParams]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch, fetchOrders]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    refreshOrders,
    clearError,
  };
}

// Single order hook
interface UseSallaOrderReturn {
  order: SallaOrder | null;
  loading: boolean;
  error: string | null;
  tracking: OrderTracking | null;
  trackingLoading: boolean;
  trackingError: string | null;
  fetchOrder: () => Promise<void>;
  updateOrder: (updateData: UpdateOrderRequest) => Promise<void>;
  cancelOrder: (reason?: string) => Promise<void>;
  fetchTracking: () => Promise<void>;
  requestRefund: (refundData: any) => Promise<void>;
  clearError: () => void;
}

export function useSallaOrder(orderId: string | null): UseSallaOrderReturn {
  const [order, setOrder] = useState<SallaOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await sallaOrdersService.getOrder(orderId);
      
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        throw new Error('Invalid order response format');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const updateOrder = useCallback(async (updateData: UpdateOrderRequest) => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await sallaOrdersService.updateOrder(orderId, updateData);
      
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        throw new Error('Failed to update order');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error updating order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const cancelOrder = useCallback(async (reason?: string) => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await sallaOrdersService.cancelOrder(orderId, reason);
      
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error canceling order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const fetchTracking = useCallback(async () => {
    if (!orderId) return;
    
    setTrackingLoading(true);
    setTrackingError(null);

    try {
      const response = await sallaOrdersService.getOrderTracking(orderId);
      
      if (response.success && response.data) {
        setTracking(response.data);
      } else {
        throw new Error('Invalid tracking response format');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setTrackingError(errorMessage);
      console.error('Error fetching tracking:', err);
    } finally {
      setTrackingLoading(false);
    }
  }, [orderId]);

  const requestRefund = useCallback(async (refundData: any) => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await sallaOrdersService.requestRefund(orderId, refundData);
      
      if (response.success) {
        // Refresh order data after refund request
        await fetchOrder();
      } else {
        throw new Error('Failed to request refund');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(errorMessage);
      console.error('Error requesting refund:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [orderId, fetchOrder]);

  const clearError = useCallback(() => {
    setError(null);
    setTrackingError(null);
  }, []);

  // Auto-fetch order on mount or when orderId changes
  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  return {
    order,
    loading,
    error,
    tracking,
    trackingLoading,
    trackingError,
    fetchOrder,
    updateOrder,
    cancelOrder,
    fetchTracking,
    requestRefund,
    clearError,
  };
}

// Checkout hook
interface UseSallaCheckoutReturn {
  checkoutSession: CheckoutSession | null;
  paymentIntent: PaymentIntent | null;
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethodOption[];
  loading: {
    session: boolean;
    payment: boolean;
    shipping: boolean;
    paymentMethods: boolean;
    order: boolean;
  };
  error: {
    session: string | null;
    payment: string | null;
    shipping: string | null;
    paymentMethods: string | null;
    order: string | null;
  };
  createCheckoutSession: (sessionData?: CheckoutSessionRequest) => Promise<CheckoutSession>;
  createPaymentIntent: (amount: number, currency: string, paymentMethod: string) => Promise<PaymentIntent>;
  confirmPayment: (paymentIntentId: string, paymentMethodData?: any) => Promise<PaymentIntent>;
  fetchShippingMethods: (shippingAddress?: Partial<SallaShippingAddress>) => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  createOrder: (orderData: CreateOrderRequest) => Promise<SallaOrder>;
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  calculateShipping: (methodId: string, address: Partial<SallaShippingAddress>) => Promise<any>;
  validateCheckout: (checkoutData: any) => Promise<any>;
  clearError: (key: keyof UseSallaCheckoutReturn['error']) => void;
  clearAllErrors: () => void;
}

export function useSallaCheckout(): UseSallaCheckoutReturn {
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  
  const [loading, setLoading] = useState({
    session: false,
    payment: false,
    shipping: false,
    paymentMethods: false,
    order: false,
  });
  
  const [error, setError] = useState({
    session: null as string | null,
    payment: null as string | null,
    shipping: null as string | null,
    paymentMethods: null as string | null,
    order: null as string | null,
  });

  const createCheckoutSession = useCallback(async (sessionData: CheckoutSessionRequest = {}) => {
    setLoading(prev => ({ ...prev, session: true }));
    setError(prev => ({ ...prev, session: null }));

    try {
      const response = await sallaOrdersService.createCheckoutSession(sessionData);
      
      if (response.success && response.data) {
        setCheckoutSession(response.data);
        return response.data;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(prev => ({ ...prev, session: errorMessage }));
      console.error('Error creating checkout session:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, session: false }));
    }
  }, []);

  const createPaymentIntent = useCallback(async (
    amount: number,
    currency: string,
    paymentMethod: string
  ) => {
    setLoading(prev => ({ ...prev, payment: true }));
    setError(prev => ({ ...prev, payment: null }));

    try {
      const response = await sallaOrdersService.createPaymentIntent(amount, currency, paymentMethod);
      
      if (response.success && response.data) {
        setPaymentIntent(response.data);
        return response.data;
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(prev => ({ ...prev, payment: errorMessage }));
      console.error('Error creating payment intent:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, payment: false }));
    }
  }, []);

  const confirmPayment = useCallback(async (
    paymentIntentId: string,
    paymentMethodData?: any
  ) => {
    setLoading(prev => ({ ...prev, payment: true }));
    setError(prev => ({ ...prev, payment: null }));

    try {
      const response = await sallaOrdersService.confirmPaymentIntent(paymentIntentId, paymentMethodData);
      
      if (response.success && response.data) {
        setPaymentIntent(response.data);
        return response.data;
      } else {
        throw new Error('Failed to confirm payment');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(prev => ({ ...prev, payment: errorMessage }));
      console.error('Error confirming payment:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, payment: false }));
    }
  }, []);

  const fetchShippingMethods = useCallback(async (shippingAddress?: Partial<SallaShippingAddress>) => {
    setLoading(prev => ({ ...prev, shipping: true }));
    setError(prev => ({ ...prev, shipping: null }));

    try {
      const response = await sallaOrdersService.getShippingMethods(shippingAddress);
      
      if (response.success && response.data) {
        setShippingMethods(response.data);
      } else {
        throw new Error('Failed to fetch shipping methods');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(prev => ({ ...prev, shipping: errorMessage }));
      console.error('Error fetching shipping methods:', err);
    } finally {
      setLoading(prev => ({ ...prev, shipping: false }));
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    setLoading(prev => ({ ...prev, paymentMethods: true }));
    setError(prev => ({ ...prev, paymentMethods: null }));

    try {
      const response = await sallaOrdersService.getPaymentMethods();
      
      if (response.success && response.data) {
        setPaymentMethods(response.data);
      } else {
        throw new Error('Failed to fetch payment methods');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(prev => ({ ...prev, paymentMethods: errorMessage }));
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoading(prev => ({ ...prev, paymentMethods: false }));
    }
  }, []);

  const createOrder = useCallback(async (orderData: CreateOrderRequest) => {
    setLoading(prev => ({ ...prev, order: true }));
    setError(prev => ({ ...prev, order: null }));

    try {
      const response = await sallaOrdersService.createOrder(orderData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      setError(prev => ({ ...prev, order: errorMessage }));
      console.error('Error creating order:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, order: false }));
    }
  }, []);

  const applyCoupon = useCallback(async (couponCode: string) => {
    try {
      await sallaOrdersService.applyCoupon(couponCode);
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      console.error('Error applying coupon:', err);
      throw new Error(errorMessage);
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      await sallaOrdersService.removeCoupon();
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      console.error('Error removing coupon:', err);
      throw new Error(errorMessage);
    }
  }, []);

  const calculateShipping = useCallback(async (
    methodId: string,
    address: Partial<SallaShippingAddress>
  ) => {
    try {
      const response = await sallaOrdersService.calculateShipping(methodId, address);
      return response.data;
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      console.error('Error calculating shipping:', err);
      throw new Error(errorMessage);
    }
  }, []);

  const validateCheckout = useCallback(async (checkoutData: any) => {
    try {
      const response = await sallaOrdersService.validateCheckout(checkoutData);
      return response.data;
    } catch (err: any) {
      const errorMessage = handleSallaError(err);
      console.error('Error validating checkout:', err);
      throw new Error(errorMessage);
    }
  }, []);

  const clearError = useCallback((key: keyof typeof error) => {
    setError(prev => ({ ...prev, [key]: null }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setError({
      session: null,
      payment: null,
      shipping: null,
      paymentMethods: null,
      order: null,
    });
  }, []);

  // Auto-fetch payment methods on mount
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    checkoutSession,
    paymentIntent,
    shippingMethods,
    paymentMethods,
    loading,
    error,
    createCheckoutSession,
    createPaymentIntent,
    confirmPayment,
    fetchShippingMethods,
    fetchPaymentMethods,
    createOrder,
    applyCoupon,
    removeCoupon,
    calculateShipping,
    validateCheckout,
    clearError,
    clearAllErrors,
  };
}