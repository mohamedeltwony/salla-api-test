// Salla Orders API Service

import { AxiosResponse } from 'axios';
import { apiClient } from './client';
import {
  SallaApiResponse,
  SallaOrder,
  SallaOrderItem,
  SallaShippingAddress,
  SallaBillingAddress,
  SallaPaymentMethod,
  SallaPagination,
} from './types';
import { API_ENDPOINTS } from './config';

// Order creation interfaces
export interface CreateOrderRequest {
  shipping_address: Partial<SallaShippingAddress>;
  billing_address?: Partial<SallaBillingAddress>;
  payment_method: string;
  shipping_method?: string;
  coupon_code?: string;
  notes?: string;
  items?: {
    product_id: string;
    quantity: number;
    options?: Record<string, any>;
  }[];
}

export interface UpdateOrderRequest {
  status?: string;
  notes?: string;
  shipping_address?: Partial<SallaShippingAddress>;
  billing_address?: Partial<SallaBillingAddress>;
}

export interface OrdersQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: 'created_at' | 'updated_at' | 'total' | 'status';
  sort_direction?: 'asc' | 'desc';
}

// Checkout interfaces
export interface CheckoutSessionRequest {
  return_url?: string;
  cancel_url?: string;
  webhook_url?: string;
  metadata?: Record<string, any>;
}

export interface CheckoutSession {
  id: string;
  url: string;
  expires_at: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  order_id?: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  payment_method: string;
  client_secret?: string;
  metadata?: Record<string, any>;
}

// Order tracking interfaces
export interface OrderTracking {
  tracking_number: string;
  carrier: string;
  status: string;
  estimated_delivery?: string;
  tracking_url?: string;
  events: OrderTrackingEvent[];
}

export interface OrderTrackingEvent {
  status: string;
  description: string;
  location?: string;
  timestamp: string;
}

// Shipping methods interface
export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  estimated_delivery_days?: number;
  is_available: boolean;
}

// Payment methods interface
export interface PaymentMethodOption {
  id: string;
  name: string;
  type: 'card' | 'wallet' | 'bank_transfer' | 'cash_on_delivery' | 'other';
  description?: string;
  is_available: boolean;
  fees?: {
    fixed: number;
    percentage: number;
  };
  supported_currencies: string[];
}

class SallaOrdersService {
  // Get user orders
  async getOrders(params: OrdersQueryParams = {}): Promise<SallaApiResponse<SallaOrder[]>> {
    try {
      const response: AxiosResponse = await apiClient.get(API_ENDPOINTS.ORDERS.LIST, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get single order
  async getOrder(orderId: string): Promise<SallaApiResponse<SallaOrder>> {
    try {
      const response: AxiosResponse = await apiClient.get(
        API_ENDPOINTS.ORDERS.DETAILS.replace(':id', orderId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<SallaApiResponse<SallaOrder>> {
    try {
      const response: AxiosResponse = await apiClient.post(
        API_ENDPOINTS.ORDERS.CREATE,
        orderData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update order
  async updateOrder(
    orderId: string,
    updateData: UpdateOrderRequest
  ): Promise<SallaApiResponse<SallaOrder>> {
    try {
      const response: AxiosResponse = await apiClient.put(
        API_ENDPOINTS.ORDERS.UPDATE.replace(':id', orderId),
        updateData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<SallaApiResponse<SallaOrder>> {
    try {
      const response: AxiosResponse = await apiClient.post(
        API_ENDPOINTS.ORDERS.CANCEL.replace(':id', orderId),
        { reason }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get order tracking
  async getOrderTracking(orderId: string): Promise<SallaApiResponse<OrderTracking>> {
    try {
      const response: AxiosResponse = await apiClient.get(
        API_ENDPOINTS.ORDERS.TRACKING.replace(':id', orderId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Checkout methods
  async createCheckoutSession(
    sessionData: CheckoutSessionRequest = {}
  ): Promise<SallaApiResponse<CheckoutSession>> {
    try {
      const response: AxiosResponse = await apiClient.post(
        API_ENDPOINTS.CHECKOUT.CREATE_SESSION,
        sessionData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get checkout session
  async getCheckoutSession(sessionId: string): Promise<SallaApiResponse<CheckoutSession>> {
    try {
      const response: AxiosResponse = await apiClient.get(
        API_ENDPOINTS.CHECKOUT.GET_SESSION.replace(':id', sessionId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create payment intent
  async createPaymentIntent(
    amount: number,
    currency: string = 'SAR',
    paymentMethod: string,
    metadata: Record<string, any> = {}
  ): Promise<SallaApiResponse<PaymentIntent>> {
    try {
      const response: AxiosResponse = await apiClient.post(
        API_ENDPOINTS.CHECKOUT.CREATE_PAYMENT_INTENT,
        {
          amount,
          currency,
          payment_method: paymentMethod,
          metadata,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodData?: Record<string, any>
  ): Promise<SallaApiResponse<PaymentIntent>> {
    try {
      const response: AxiosResponse = await apiClient.post(
        API_ENDPOINTS.CHECKOUT.CONFIRM_PAYMENT.replace(':id', paymentIntentId),
        { payment_method_data: paymentMethodData }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get available shipping methods
  async getShippingMethods(
    shippingAddress?: Partial<SallaShippingAddress>
  ): Promise<SallaApiResponse<ShippingMethod[]>> {
    try {
      const response: AxiosResponse = await apiClient.post(
        API_ENDPOINTS.CHECKOUT.SHIPPING_METHODS,
        { shipping_address: shippingAddress }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get available payment methods
  async getPaymentMethods(): Promise<SallaApiResponse<PaymentMethodOption[]>> {
    try {
      const response: AxiosResponse = await apiClient.get(
        API_ENDPOINTS.CHECKOUT.PAYMENT_METHODS
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Apply coupon
  async applyCoupon(couponCode: string): Promise<SallaApiResponse<any>> {
    try {
      const response: AxiosResponse = await apiClient.post(
        API_ENDPOINTS.CHECKOUT.APPLY_COUPON,
        { coupon_code: couponCode }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Remove coupon
  async removeCoupon(): Promise<SallaApiResponse<any>> {
    try {
      const response: AxiosResponse = await apiClient.delete(
        API_ENDPOINTS.CHECKOUT.REMOVE_COUPON
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Calculate shipping cost
  async calculateShipping(
    shippingMethodId: string,
    shippingAddress: Partial<SallaShippingAddress>
  ): Promise<SallaApiResponse<{ cost: number; currency: string; estimated_delivery: string }>> {
    try {
      const response: AxiosResponse = await apiClient.post(
        API_ENDPOINTS.CHECKOUT.CALCULATE_SHIPPING,
        {
          shipping_method_id: shippingMethodId,
          shipping_address: shippingAddress,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Calculate taxes
  async calculateTaxes(
    items: { product_id: string; quantity: number; price: number }[],
    shippingAddress?: Partial<SallaShippingAddress>
  ): Promise<SallaApiResponse<{ tax_amount: number; tax_rate: number; currency: string }>> {
    try {
      const response: AxiosResponse = await apiClient.post(
        API_ENDPOINTS.CHECKOUT.CALCULATE_TAXES,
        {
          items,
          shipping_address: shippingAddress,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Validate checkout data
  async validateCheckout(checkoutData: {
    items: { product_id: string; quantity: number }[];
    shipping_address: Partial<SallaShippingAddress>;
    billing_address?: Partial<SallaBillingAddress>;
    shipping_method_id?: string;
    payment_method?: string;
  }): Promise<SallaApiResponse<{ is_valid: boolean; errors?: string[] }>> {
    try {
      const response: AxiosResponse = await apiClient.post(
        API_ENDPOINTS.CHECKOUT.VALIDATE,
        checkoutData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get order invoice
  async getOrderInvoice(orderId: string): Promise<SallaApiResponse<{ invoice_url: string }>> {
    try {
      const response: AxiosResponse = await apiClient.get(
        API_ENDPOINTS.ORDERS.INVOICE.replace(':id', orderId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Request order refund
  async requestRefund(
    orderId: string,
    refundData: {
      amount?: number;
      reason: string;
      items?: { order_item_id: string; quantity: number }[];
    }
  ): Promise<SallaApiResponse<any>> {
    try {
      const response: AxiosResponse = await apiClient.post(
        API_ENDPOINTS.ORDERS.REFUND.replace(':id', orderId),
        refundData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const sallaOrdersService = new SallaOrdersService();
export default sallaOrdersService;