// Salla Authentication Service

import axios, { AxiosResponse } from 'axios';
import { SALLA_CONFIG, API_ENDPOINTS, HTTP_STATUS } from './config';
import {
  SallaApiResponse,
  SallaUser,
  SallaAuthResponse,
  SallaLoginRequest,
  SallaRegisterRequest,
  SallaResetPasswordRequest,
  SallaChangePasswordRequest,
  SallaVerifyEmailRequest,
  SallaRefreshTokenRequest,
  handleSallaError,
} from './types';

// Extended auth interfaces
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

export interface UserProfile extends SallaUser {
  preferences?: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  addresses?: Array<{
    id: string;
    type: 'shipping' | 'billing';
    is_default: boolean;
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  }>;
  orders_count?: number;
  total_spent?: number;
  last_login?: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'facebook' | 'twitter' | 'apple';
  access_token: string;
  id_token?: string;
}

export interface TwoFactorAuthRequest {
  code: string;
  recovery_code?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  preferences?: UserProfile['preferences'];
}

class SallaAuthService {
  private baseURL: string;
  private tokens: AuthTokens | null = null;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor() {
    this.baseURL = SALLA_CONFIG.API_BASE_URL;
    this.loadTokensFromStorage();
  }

  // Token management
  private saveTokensToStorage(tokens: AuthTokens): void {
    try {
      localStorage.setItem('salla_auth_tokens', JSON.stringify(tokens));
      this.tokens = tokens;
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  private loadTokensFromStorage(): void {
    try {
      const stored = localStorage.getItem('salla_auth_tokens');
      if (stored) {
        const tokens = JSON.parse(stored) as AuthTokens;
        if (this.isTokenValid(tokens)) {
          this.tokens = tokens;
        } else {
          this.clearTokensFromStorage();
        }
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
      this.clearTokensFromStorage();
    }
  }

  private clearTokensFromStorage(): void {
    try {
      localStorage.removeItem('salla_auth_tokens');
      localStorage.removeItem('salla_user_profile');
      this.tokens = null;
    } catch (error) {
      console.error('Failed to clear tokens from storage:', error);
    }
  }

  private isTokenValid(tokens: AuthTokens): boolean {
    if (!tokens || !tokens.access_token) return false;
    
    const now = Date.now();
    const expiresAt = tokens.expires_at || (Date.now() + tokens.expires_in * 1000);
    
    // Consider token invalid if it expires in less than 5 minutes
    return expiresAt > now + (5 * 60 * 1000);
  }

  private async makeAuthRequest<T>(
    endpoint: string,
    data?: any,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<SallaApiResponse<T>> {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': this.tokens ? `Bearer ${this.tokens.access_token}` : undefined,
        },
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined,
      };

      const response: AxiosResponse<SallaApiResponse<T>> = await axios(config);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && this.tokens) {
        // Try to refresh token
        try {
          await this.refreshAccessToken();
          // Retry the original request
          const retryConfig = {
            method,
            url: `${this.baseURL}${endpoint}`,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${this.tokens!.access_token}`,
            },
            data: method !== 'GET' ? data : undefined,
            params: method === 'GET' ? data : undefined,
          };
          const retryResponse: AxiosResponse<SallaApiResponse<T>> = await axios(retryConfig);
          return retryResponse.data;
        } catch (refreshError) {
          // Refresh failed, clear tokens and throw original error
          this.clearTokensFromStorage();
          throw error;
        }
      }
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: SallaLoginRequest): Promise<SallaApiResponse<SallaAuthResponse>> {
    try {
      const response = await this.makeAuthRequest<SallaAuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        const tokens: AuthTokens = {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          token_type: response.data.token_type || 'Bearer',
          expires_in: response.data.expires_in,
          expires_at: Date.now() + (response.data.expires_in * 1000),
        };
        
        this.saveTokensToStorage(tokens);
        
        // Save user profile
        if (response.data.user) {
          this.saveUserProfile(response.data.user);
        }
      }

      return response;
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  async register(userData: SallaRegisterRequest): Promise<SallaApiResponse<SallaAuthResponse>> {
    try {
      const response = await this.makeAuthRequest<SallaAuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );

      if (response.success && response.data) {
        const tokens: AuthTokens = {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          token_type: response.data.token_type || 'Bearer',
          expires_in: response.data.expires_in,
          expires_at: Date.now() + (response.data.expires_in * 1000),
        };
        
        this.saveTokensToStorage(tokens);
        
        // Save user profile
        if (response.data.user) {
          this.saveUserProfile(response.data.user);
        }
      }

      return response;
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  async socialLogin(socialData: SocialLoginRequest): Promise<SallaApiResponse<SallaAuthResponse>> {
    try {
      const response = await this.makeAuthRequest<SallaAuthResponse>(
        API_ENDPOINTS.AUTH.SOCIAL_LOGIN,
        socialData
      );

      if (response.success && response.data) {
        const tokens: AuthTokens = {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          token_type: response.data.token_type || 'Bearer',
          expires_in: response.data.expires_in,
          expires_at: Date.now() + (response.data.expires_in * 1000),
        };
        
        this.saveTokensToStorage(tokens);
        
        // Save user profile
        if (response.data.user) {
          this.saveUserProfile(response.data.user);
        }
      }

      return response;
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  async logout(): Promise<SallaApiResponse<any>> {
    try {
      const response = await this.makeAuthRequest<any>(
        API_ENDPOINTS.AUTH.LOGOUT,
        {},
        'POST'
      );
      
      // Clear tokens regardless of API response
      this.clearTokensFromStorage();
      
      return response;
    } catch (error: any) {
      // Clear tokens even if logout API fails
      this.clearTokensFromStorage();
      throw new Error(handleSallaError(error));
    }
  }

  async refreshAccessToken(): Promise<AuthTokens> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = (async () => {
      try {
        const response = await this.makeAuthRequest<SallaAuthResponse>(
          API_ENDPOINTS.AUTH.REFRESH,
          { refresh_token: this.tokens!.refresh_token }
        );

        if (response.success && response.data) {
          const tokens: AuthTokens = {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token || this.tokens!.refresh_token,
            token_type: response.data.token_type || 'Bearer',
            expires_in: response.data.expires_in,
            expires_at: Date.now() + (response.data.expires_in * 1000),
          };
          
          this.saveTokensToStorage(tokens);
          return tokens;
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (error: any) {
        this.clearTokensFromStorage();
        throw new Error(handleSallaError(error));
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Password management
  async requestPasswordReset(email: string): Promise<SallaApiResponse<any>> {
    try {
      return await this.makeAuthRequest<any>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  async resetPassword(resetData: SallaResetPasswordRequest): Promise<SallaApiResponse<any>> {
    try {
      return await this.makeAuthRequest<any>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        resetData
      );
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  async changePassword(passwordData: SallaChangePasswordRequest): Promise<SallaApiResponse<any>> {
    try {
      return await this.makeAuthRequest<any>(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        passwordData
      );
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  // Email verification
  async verifyEmail(verificationData: SallaVerifyEmailRequest): Promise<SallaApiResponse<any>> {
    try {
      return await this.makeAuthRequest<any>(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        verificationData
      );
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  async resendVerificationEmail(): Promise<SallaApiResponse<any>> {
    try {
      return await this.makeAuthRequest<any>(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        {},
        'POST'
      );
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  // Two-factor authentication
  async enableTwoFactor(): Promise<SallaApiResponse<any>> {
    try {
      return await this.makeAuthRequest<any>(
        API_ENDPOINTS.AUTH.ENABLE_2FA,
        {},
        'POST'
      );
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  async disableTwoFactor(twoFactorData: TwoFactorAuthRequest): Promise<SallaApiResponse<any>> {
    try {
      return await this.makeAuthRequest<any>(
        API_ENDPOINTS.AUTH.DISABLE_2FA,
        twoFactorData
      );
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  async verifyTwoFactor(twoFactorData: TwoFactorAuthRequest): Promise<SallaApiResponse<any>> {
    try {
      return await this.makeAuthRequest<any>(
        API_ENDPOINTS.AUTH.VERIFY_2FA,
        twoFactorData
      );
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  // User profile management
  async getUserProfile(): Promise<SallaApiResponse<UserProfile>> {
    try {
      const response = await this.makeAuthRequest<UserProfile>(
        API_ENDPOINTS.USERS.PROFILE,
        {},
        'GET'
      );
      
      if (response.success && response.data) {
        this.saveUserProfile(response.data);
      }
      
      return response;
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  async updateUserProfile(profileData: UpdateProfileRequest): Promise<SallaApiResponse<UserProfile>> {
    try {
      const response = await this.makeAuthRequest<UserProfile>(
        API_ENDPOINTS.USERS.PROFILE,
        profileData,
        'PUT'
      );
      
      if (response.success && response.data) {
        this.saveUserProfile(response.data);
      }
      
      return response;
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  async deleteAccount(): Promise<SallaApiResponse<any>> {
    try {
      const response = await this.makeAuthRequest<any>(
        API_ENDPOINTS.USERS.DELETE_ACCOUNT,
        {},
        'DELETE'
      );
      
      // Clear tokens after successful account deletion
      if (response.success) {
        this.clearTokensFromStorage();
      }
      
      return response;
    } catch (error: any) {
      throw new Error(handleSallaError(error));
    }
  }

  // Utility methods
  private saveUserProfile(user: UserProfile): void {
    try {
      localStorage.setItem('salla_user_profile', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  getUserProfileFromStorage(): UserProfile | null {
    try {
      const stored = localStorage.getItem('salla_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load user profile from storage:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.tokens !== null && this.isTokenValid(this.tokens);
  }

  getAccessToken(): string | null {
    return this.tokens?.access_token || null;
  }

  getTokens(): AuthTokens | null {
    return this.tokens;
  }

  // Session management
  async checkSession(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await this.getUserProfile();
      return response.success;
    } catch (error) {
      console.error('Session check failed:', error);
      this.clearTokensFromStorage();
      return false;
    }
  }

  async extendSession(): Promise<boolean> {
    if (!this.tokens?.refresh_token) {
      return false;
    }

    try {
      await this.refreshAccessToken();
      return true;
    } catch (error) {
      console.error('Session extension failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const sallaAuthService = new SallaAuthService();
export default sallaAuthService;