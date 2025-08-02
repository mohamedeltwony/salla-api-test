// Salla API User Management Service

import { sallaApi } from './client';
import {
  SallaApiResponse,
  SallaPagination,
  SallaUser,
  SallaAddress,
  SallaWishlistItem,
} from './types';
import { transformUserToBazaarFormat } from './utils';

// User profile interfaces
export interface UserProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female';
  birth_date?: string;
  avatar?: File | string;
  language?: string;
  currency?: string;
}

export interface UserAddressRequest {
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default?: boolean;
}

export interface UserPreferencesRequest {
  language?: string;
  currency?: string;
  timezone?: string;
  newsletter_subscription?: boolean;
  sms_notifications?: boolean;
  email_notifications?: boolean;
  marketing_emails?: boolean;
  order_updates?: boolean;
  promotional_offers?: boolean;
}

export interface UserSecurityRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserNotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  order_updates: boolean;
  promotional_offers: boolean;
  newsletter_subscription: boolean;
  security_alerts: boolean;
}

export interface UserPrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  show_email: boolean;
  show_phone: boolean;
  show_address: boolean;
  allow_data_collection: boolean;
  allow_personalized_ads: boolean;
  allow_third_party_sharing: boolean;
}

export interface UserAccountSettings {
  language: string;
  currency: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  theme: 'light' | 'dark' | 'auto';
  auto_logout_time: number; // in minutes
}

// Response interfaces
export interface UserProfileResponse extends SallaApiResponse {
  data?: SallaUser;
}

export interface UserAddressesResponse extends SallaApiResponse {
  data?: SallaAddress[];
  pagination?: SallaPagination;
}

export interface UserAddressResponse extends SallaApiResponse {
  data?: SallaAddress;
}

export interface UserWishlistResponse extends SallaApiResponse {
  data?: SallaWishlistItem[];
  pagination?: SallaPagination;
}

export interface UserOrdersResponse extends SallaApiResponse {
  data?: any[];
  pagination?: SallaPagination;
}

export interface UserNotificationsResponse extends SallaApiResponse {
  data?: any[];
  pagination?: SallaPagination;
}

// User management service class
export class SallaUserService {
  // Profile management
  async getUserProfile(): Promise<UserProfileResponse> {
    try {
      const response = await sallaApi.get('/customer/profile');
      return {
        success: true,
        data: response.data.data,
        message: 'Profile retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get user profile',
        errors: error.response?.data?.errors,
      };
    }
  }

  async updateUserProfile(profileData: UserProfileRequest): Promise<UserProfileResponse> {
    try {
      const formData = new FormData();
      
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await sallaApi.post('/customer/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: 'Profile updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
        errors: error.response?.data?.errors,
      };
    }
  }

  async uploadAvatar(avatarFile: File): Promise<UserProfileResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await sallaApi.post('/customer/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data,
        message: 'Avatar uploaded successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload avatar',
        errors: error.response?.data?.errors,
      };
    }
  }

  async deleteAvatar(): Promise<SallaApiResponse> {
    try {
      await sallaApi.delete('/customer/profile/avatar');
      return {
        success: true,
        message: 'Avatar deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete avatar',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Address management
  async getUserAddresses(page = 1, limit = 10): Promise<UserAddressesResponse> {
    try {
      const response = await sallaApi.get('/customer/addresses', {
        params: { page, limit },
      });

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: 'Addresses retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get addresses',
        errors: error.response?.data?.errors,
      };
    }
  }

  async getAddress(addressId: string): Promise<UserAddressResponse> {
    try {
      const response = await sallaApi.get(`/customer/addresses/${addressId}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Address retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get address',
        errors: error.response?.data?.errors,
      };
    }
  }

  async createAddress(addressData: UserAddressRequest): Promise<UserAddressResponse> {
    try {
      const response = await sallaApi.post('/customer/addresses', addressData);
      return {
        success: true,
        data: response.data.data,
        message: 'Address created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create address',
        errors: error.response?.data?.errors,
      };
    }
  }

  async updateAddress(addressId: string, addressData: Partial<UserAddressRequest>): Promise<UserAddressResponse> {
    try {
      const response = await sallaApi.put(`/customer/addresses/${addressId}`, addressData);
      return {
        success: true,
        data: response.data.data,
        message: 'Address updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update address',
        errors: error.response?.data?.errors,
      };
    }
  }

  async deleteAddress(addressId: string): Promise<SallaApiResponse> {
    try {
      await sallaApi.delete(`/customer/addresses/${addressId}`);
      return {
        success: true,
        message: 'Address deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete address',
        errors: error.response?.data?.errors,
      };
    }
  }

  async setDefaultAddress(addressId: string): Promise<UserAddressResponse> {
    try {
      const response = await sallaApi.post(`/customer/addresses/${addressId}/default`);
      return {
        success: true,
        data: response.data.data,
        message: 'Default address set successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to set default address',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Wishlist management
  async getUserWishlist(page = 1, limit = 10): Promise<UserWishlistResponse> {
    try {
      const response = await sallaApi.get('/customer/wishlist', {
        params: { page, limit },
      });

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: 'Wishlist retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get wishlist',
        errors: error.response?.data?.errors,
      };
    }
  }

  async addToWishlist(productId: string): Promise<SallaApiResponse> {
    try {
      await sallaApi.post('/customer/wishlist', { product_id: productId });
      return {
        success: true,
        message: 'Product added to wishlist',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to wishlist',
        errors: error.response?.data?.errors,
      };
    }
  }

  async removeFromWishlist(productId: string): Promise<SallaApiResponse> {
    try {
      await sallaApi.delete(`/customer/wishlist/${productId}`);
      return {
        success: true,
        message: 'Product removed from wishlist',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from wishlist',
        errors: error.response?.data?.errors,
      };
    }
  }

  async clearWishlist(): Promise<SallaApiResponse> {
    try {
      await sallaApi.delete('/customer/wishlist');
      return {
        success: true,
        message: 'Wishlist cleared successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear wishlist',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Order history
  async getUserOrders(page = 1, limit = 10, status?: string): Promise<UserOrdersResponse> {
    try {
      const params: any = { page, limit };
      if (status) params.status = status;

      const response = await sallaApi.get('/customer/orders', { params });

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: 'Orders retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get orders',
        errors: error.response?.data?.errors,
      };
    }
  }

  async getUserOrder(orderId: string): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.get(`/customer/orders/${orderId}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Order retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get order',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Notifications
  async getUserNotifications(page = 1, limit = 10, unread_only = false): Promise<UserNotificationsResponse> {
    try {
      const response = await sallaApi.get('/customer/notifications', {
        params: { page, limit, unread_only },
      });

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: 'Notifications retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get notifications',
        errors: error.response?.data?.errors,
      };
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<SallaApiResponse> {
    try {
      await sallaApi.post(`/customer/notifications/${notificationId}/read`);
      return {
        success: true,
        message: 'Notification marked as read',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notification as read',
        errors: error.response?.data?.errors,
      };
    }
  }

  async markAllNotificationsAsRead(): Promise<SallaApiResponse> {
    try {
      await sallaApi.post('/customer/notifications/read-all');
      return {
        success: true,
        message: 'All notifications marked as read',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark all notifications as read',
        errors: error.response?.data?.errors,
      };
    }
  }

  // User preferences and settings
  async getUserPreferences(): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.get('/customer/preferences');
      return {
        success: true,
        data: response.data.data,
        message: 'Preferences retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get preferences',
        errors: error.response?.data?.errors,
      };
    }
  }

  async updateUserPreferences(preferences: UserPreferencesRequest): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.put('/customer/preferences', preferences);
      return {
        success: true,
        data: response.data.data,
        message: 'Preferences updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update preferences',
        errors: error.response?.data?.errors,
      };
    }
  }

  async getNotificationSettings(): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.get('/customer/settings/notifications');
      return {
        success: true,
        data: response.data.data,
        message: 'Notification settings retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get notification settings',
        errors: error.response?.data?.errors,
      };
    }
  }

  async updateNotificationSettings(settings: Partial<UserNotificationSettings>): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.put('/customer/settings/notifications', settings);
      return {
        success: true,
        data: response.data.data,
        message: 'Notification settings updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update notification settings',
        errors: error.response?.data?.errors,
      };
    }
  }

  async getPrivacySettings(): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.get('/customer/settings/privacy');
      return {
        success: true,
        data: response.data.data,
        message: 'Privacy settings retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get privacy settings',
        errors: error.response?.data?.errors,
      };
    }
  }

  async updatePrivacySettings(settings: Partial<UserPrivacySettings>): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.put('/customer/settings/privacy', settings);
      return {
        success: true,
        data: response.data.data,
        message: 'Privacy settings updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update privacy settings',
        errors: error.response?.data?.errors,
      };
    }
  }

  async getAccountSettings(): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.get('/customer/settings/account');
      return {
        success: true,
        data: response.data.data,
        message: 'Account settings retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get account settings',
        errors: error.response?.data?.errors,
      };
    }
  }

  async updateAccountSettings(settings: Partial<UserAccountSettings>): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.put('/customer/settings/account', settings);
      return {
        success: true,
        data: response.data.data,
        message: 'Account settings updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update account settings',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Security
  async changePassword(securityData: UserSecurityRequest): Promise<SallaApiResponse> {
    try {
      await sallaApi.post('/customer/security/change-password', securityData);
      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
        errors: error.response?.data?.errors,
      };
    }
  }

  async getSecurityLog(page = 1, limit = 10): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.get('/customer/security/log', {
        params: { page, limit },
      });

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: 'Security log retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get security log',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Account deletion
  async requestAccountDeletion(): Promise<SallaApiResponse> {
    try {
      await sallaApi.post('/customer/account/delete-request');
      return {
        success: true,
        message: 'Account deletion requested successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to request account deletion',
        errors: error.response?.data?.errors,
      };
    }
  }

  async cancelAccountDeletion(): Promise<SallaApiResponse> {
    try {
      await sallaApi.delete('/customer/account/delete-request');
      return {
        success: true,
        message: 'Account deletion cancelled successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel account deletion',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Data export
  async requestDataExport(): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.post('/customer/data/export');
      return {
        success: true,
        data: response.data.data,
        message: 'Data export requested successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to request data export',
        errors: error.response?.data?.errors,
      };
    }
  }

  async getDataExportStatus(exportId: string): Promise<SallaApiResponse> {
    try {
      const response = await sallaApi.get(`/customer/data/export/${exportId}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Export status retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get export status',
        errors: error.response?.data?.errors,
      };
    }
  }
}

// Export singleton instance
export const sallaUserService = new SallaUserService();