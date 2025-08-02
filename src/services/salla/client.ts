// Salla API Client

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { SALLA_CONFIG, API_ENDPOINTS, HTTP_STATUS } from './config';
import {
  SallaApiResponse,
  SallaApiError,
  SallaProduct,
  SallaCategory,
  SallaCart,
  SallaOrder,
  SallaCustomer,
  SallaSearchParams,
  SallaWishlist,
  SallaAuthToken,
} from './types';

export class SallaApiClient {
  private client: AxiosInstance;
  private accessToken: string;
  public notifications?: any;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || SALLA_CONFIG.accessToken;
    
    this.client = axios.create({
      baseURL: SALLA_CONFIG.baseURL,
      timeout: SALLA_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
    // Notifications service will be initialized later to avoid circular dependency
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const sallaError: SallaApiError = {
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code || 'UNKNOWN_ERROR',
          status: error.response?.status || 500,
          details: error.response?.data,
        };
        return Promise.reject(sallaError);
      }
    );
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  private async request<T>(
    config: AxiosRequestConfig
  ): Promise<SallaApiResponse<T>> {
    try {
      const response = await this.client.request<SallaApiResponse<T>>(config);
      return response.data;
    } catch (error) {
      throw error as SallaApiError;
    }
  }

  // HTTP Methods for services
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // Authentication Methods
  public async authenticate(
    clientId: string,
    clientSecret: string,
    code: string
  ): Promise<SallaAuthToken> {
    const response = await this.request<SallaAuthToken>({
      method: 'POST',
      url: API_ENDPOINTS.auth.token,
      data: {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
    });
    return response.data;
  }

  public async refreshToken(refreshToken: string): Promise<SallaAuthToken> {
    const response = await this.request<SallaAuthToken>({
      method: 'POST',
      url: API_ENDPOINTS.auth.refresh,
      data: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
    });
    return response.data;
  }

  // Product Methods
  public async getProducts(
    params?: SallaSearchParams
  ): Promise<SallaApiResponse<SallaProduct[]>> {
    return this.request<SallaProduct[]>({
      method: 'GET',
      url: API_ENDPOINTS.products.list,
      params,
    });
  }

  public async getProduct(id: string): Promise<SallaProduct> {
    const response = await this.request<SallaProduct>({
      method: 'GET',
      url: API_ENDPOINTS.products.details(id),
    });
    return response.data;
  }

  public async searchProducts(
    params: SallaSearchParams
  ): Promise<SallaApiResponse<SallaProduct[]>> {
    return this.request<SallaProduct[]>({
      method: 'GET',
      url: API_ENDPOINTS.products.search,
      params,
    });
  }

  // Category Methods
  public async getCategories(): Promise<SallaApiResponse<SallaCategory[]>> {
    return this.request<SallaCategory[]>({
      method: 'GET',
      url: API_ENDPOINTS.categories.list,
    });
  }

  public async getCategory(id: string): Promise<SallaCategory> {
    const response = await this.request<SallaCategory>({
      method: 'GET',
      url: API_ENDPOINTS.categories.details(id),
    });
    return response.data;
  }

  public async getCategoryProducts(
    id: string,
    params?: SallaSearchParams
  ): Promise<SallaApiResponse<SallaProduct[]>> {
    return this.request<SallaProduct[]>({
      method: 'GET',
      url: API_ENDPOINTS.categories.products(id),
      params,
    });
  }

  // Cart Methods
  public async getCart(): Promise<SallaCart> {
    const response = await this.request<SallaCart>({
      method: 'GET',
      url: API_ENDPOINTS.cart.get,
    });
    return response.data;
  }

  public async addToCart(
    productId: string,
    quantity: number,
    variantId?: string
  ): Promise<SallaCart> {
    const response = await this.request<SallaCart>({
      method: 'POST',
      url: API_ENDPOINTS.cart.add,
      data: {
        product_id: productId,
        quantity,
        variant_id: variantId,
      },
    });
    return response.data;
  }

  public async updateCartItem(
    itemId: string,
    quantity: number
  ): Promise<SallaCart> {
    const response = await this.request<SallaCart>({
      method: 'PUT',
      url: API_ENDPOINTS.cart.update(itemId),
      data: { quantity },
    });
    return response.data;
  }

  public async removeFromCart(itemId: string): Promise<SallaCart> {
    const response = await this.request<SallaCart>({
      method: 'DELETE',
      url: API_ENDPOINTS.cart.remove(itemId),
    });
    return response.data;
  }

  public async clearCart(): Promise<void> {
    await this.request<void>({
      method: 'DELETE',
      url: API_ENDPOINTS.cart.clear,
    });
  }

  // Order Methods
  public async getOrders(
    params?: { page?: number; per_page?: number }
  ): Promise<SallaApiResponse<SallaOrder[]>> {
    return this.request<SallaOrder[]>({
      method: 'GET',
      url: API_ENDPOINTS.orders.list,
      params,
    });
  }

  public async getOrder(id: string): Promise<SallaOrder> {
    const response = await this.request<SallaOrder>({
      method: 'GET',
      url: API_ENDPOINTS.orders.details(id),
    });
    return response.data;
  }

  public async createOrder(orderData: any): Promise<SallaOrder> {
    const response = await this.request<SallaOrder>({
      method: 'POST',
      url: API_ENDPOINTS.orders.create,
      data: orderData,
    });
    return response.data;
  }

  // User Methods
  public async getUserProfile(): Promise<SallaCustomer> {
    const response = await this.request<SallaCustomer>({
      method: 'GET',
      url: API_ENDPOINTS.users.profile,
    });
    return response.data;
  }

  public async getUserOrders(
    params?: { page?: number; per_page?: number }
  ): Promise<SallaApiResponse<SallaOrder[]>> {
    return this.request<SallaOrder[]>({
      method: 'GET',
      url: API_ENDPOINTS.users.orders,
      params,
    });
  }

  public async getUserWishlist(): Promise<SallaWishlist> {
    const response = await this.request<SallaWishlist>({
      method: 'GET',
      url: API_ENDPOINTS.users.wishlist,
    });
    return response.data;
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      await this.request({
        method: 'GET',
        url: '/health',
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const sallaApi = new SallaApiClient();