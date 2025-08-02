// React hooks for Salla User Management

import { useState, useEffect, useCallback } from 'react';
import {
  sallaUserService,
  UserProfileRequest,
  UserAddressRequest,
  UserPreferencesRequest,
  UserSecurityRequest,
  UserNotificationSettings,
  UserPrivacySettings,
  UserAccountSettings,
} from '../services/salla/users';
import { SallaUser, SallaAddress, SallaWishlistItem } from '../services/salla/types';
import { transformUserToBazaarFormat } from '../services/salla/utils';

// User profile hook
export const useSallaUserProfile = () => {
  const [user, setUser] = useState<SallaUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.getUserProfile();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError(response.message || 'Failed to fetch profile');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: UserProfileRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.updateUserProfile(profileData);
      if (response.success && response.data) {
        setUser(response.data);
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to update profile');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while updating profile';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (avatarFile: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.uploadAvatar(avatarFile);
      if (response.success && response.data) {
        setUser(response.data);
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to upload avatar');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while uploading avatar';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAvatar = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.deleteAvatar();
      if (response.success) {
        // Refresh profile to get updated data
        await fetchProfile();
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to delete avatar');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while deleting avatar';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    user,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    // Transform to Bazaar format for compatibility
    bazaarUser: user ? transformUserToBazaarFormat(user) : null,
  };
};

// User addresses hook
export const useSallaUserAddresses = () => {
  const [addresses, setAddresses] = useState<SallaAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchAddresses = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.getUserAddresses(page, limit);
      if (response.success && response.data) {
        setAddresses(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch addresses');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAddress = useCallback(async (addressData: UserAddressRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.createAddress(addressData);
      if (response.success && response.data) {
        setAddresses(prev => [...prev, response.data!]);
        return { success: true, message: response.message, data: response.data };
      } else {
        setError(response.message || 'Failed to create address');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while creating address';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAddress = useCallback(async (addressId: string, addressData: Partial<UserAddressRequest>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.updateAddress(addressId, addressData);
      if (response.success && response.data) {
        setAddresses(prev => 
          prev.map(addr => addr.id === addressId ? response.data! : addr)
        );
        return { success: true, message: response.message, data: response.data };
      } else {
        setError(response.message || 'Failed to update address');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while updating address';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAddress = useCallback(async (addressId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.deleteAddress(addressId);
      if (response.success) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to delete address');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while deleting address';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const setDefaultAddress = useCallback(async (addressId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.setDefaultAddress(addressId);
      if (response.success && response.data) {
        // Update all addresses to reflect the new default
        setAddresses(prev => 
          prev.map(addr => ({
            ...addr,
            is_default: addr.id === addressId
          }))
        );
        return { success: true, message: response.message, data: response.data };
      } else {
        setError(response.message || 'Failed to set default address');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while setting default address';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    pagination,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};

// User wishlist hook
export const useSallaUserWishlist = () => {
  const [wishlist, setWishlist] = useState<SallaWishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchWishlist = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.getUserWishlist(page, limit);
      if (response.success && response.data) {
        setWishlist(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch wishlist');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching wishlist');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.addToWishlist(productId);
      if (response.success) {
        // Refresh wishlist to get updated data
        await fetchWishlist();
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to add to wishlist');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while adding to wishlist';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.removeFromWishlist(productId);
      if (response.success) {
        setWishlist(prev => prev.filter(item => item.product.id !== productId));
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to remove from wishlist');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while removing from wishlist';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.clearWishlist();
      if (response.success) {
        setWishlist([]);
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to clear wishlist');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while clearing wishlist';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.product.id === productId);
  }, [wishlist]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    loading,
    error,
    pagination,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
  };
};

// User orders hook
export const useSallaUserOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchOrders = useCallback(async (page = 1, limit = 10, status?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.getUserOrders(page, limit, status);
      if (response.success && response.data) {
        setOrders(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.getUserOrder(orderId);
      if (response.success && response.data) {
        return { success: true, data: response.data, message: response.message };
      } else {
        setError(response.message || 'Failed to fetch order');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while fetching order';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    getOrder,
  };
};

// User notifications hook
export const useSallaUserNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (page = 1, limit = 10, unreadOnly = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.getUserNotifications(page, limit, unreadOnly);
      if (response.success && response.data) {
        setNotifications(response.data);
        setPagination(response.pagination);
        // Count unread notifications
        const unread = response.data.filter((notif: any) => !notif.read_at).length;
        setUnreadCount(unread);
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await sallaUserService.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read_at: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'An error occurred while marking notification as read' };
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await sallaUserService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'An error occurred while marking all notifications as read' };
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    pagination,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};

// User settings hook
export const useSallaUserSettings = () => {
  const [preferences, setPreferences] = useState<any>(null);
  const [notificationSettings, setNotificationSettings] = useState<UserNotificationSettings | null>(null);
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings | null>(null);
  const [accountSettings, setAccountSettings] = useState<UserAccountSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [prefsRes, notifRes, privacyRes, accountRes] = await Promise.all([
        sallaUserService.getUserPreferences(),
        sallaUserService.getNotificationSettings(),
        sallaUserService.getPrivacySettings(),
        sallaUserService.getAccountSettings(),
      ]);

      if (prefsRes.success) setPreferences(prefsRes.data);
      if (notifRes.success) setNotificationSettings(notifRes.data);
      if (privacyRes.success) setPrivacySettings(privacyRes.data);
      if (accountRes.success) setAccountSettings(accountRes.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences: UserPreferencesRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.updateUserPreferences(newPreferences);
      if (response.success && response.data) {
        setPreferences(response.data);
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to update preferences');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while updating preferences';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNotificationSettings = useCallback(async (settings: Partial<UserNotificationSettings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.updateNotificationSettings(settings);
      if (response.success && response.data) {
        setNotificationSettings(response.data);
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to update notification settings');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while updating notification settings';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePrivacySettings = useCallback(async (settings: Partial<UserPrivacySettings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.updatePrivacySettings(settings);
      if (response.success && response.data) {
        setPrivacySettings(response.data);
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to update privacy settings');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while updating privacy settings';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAccountSettings = useCallback(async (settings: Partial<UserAccountSettings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.updateAccountSettings(settings);
      if (response.success && response.data) {
        setAccountSettings(response.data);
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to update account settings');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while updating account settings';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (securityData: UserSecurityRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaUserService.changePassword(securityData);
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Failed to change password');
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while changing password';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  return {
    preferences,
    notificationSettings,
    privacySettings,
    accountSettings,
    loading,
    error,
    fetchAllSettings,
    updatePreferences,
    updateNotificationSettings,
    updatePrivacySettings,
    updateAccountSettings,
    changePassword,
  };
};