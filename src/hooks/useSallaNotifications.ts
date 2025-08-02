// React Hooks for Salla Notifications and Webhooks

import { useState, useEffect, useCallback } from 'react';
import {
  SallaNotification,
  SallaNotificationTemplate,
  SallaNotificationSettings,
  SallaWebhook,
  SallaWebhookEvent,
  SallaPushToken,
  CreateNotificationRequest,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  NotificationSearchParams,
  WebhookSearchParams,
  sallaNotificationService,
} from '../services/salla/notifications';
import { SallaPagination } from '../services/salla/types';

// Notifications Hook
export const useSallaNotifications = (params?: NotificationSearchParams) => {
  const [notifications, setNotifications] = useState<SallaNotification[]>([]);
  const [pagination, setPagination] = useState<SallaPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (searchParams?: NotificationSearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.getNotifications(searchParams || params);
      if (response.success) {
        setNotifications(response.data || []);
        setPagination(response.pagination || null);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createNotification = useCallback(async (notificationData: CreateNotificationRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.createNotification(notificationData);
      if (response.success) {
        await fetchNotifications();
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create notification');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await sallaNotificationService.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async (userId?: string) => {
    try {
      const response = await sallaNotificationService.markAllAsRead(userId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
      return null;
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await sallaNotificationService.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    pagination,
    loading,
    error,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
};

// Single Notification Hook
export const useSallaNotification = (notificationId: string | null) => {
  const [notification, setNotification] = useState<SallaNotification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotification = useCallback(async () => {
    if (!notificationId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.getNotification(notificationId);
      if (response.success) {
        setNotification(response.data || null);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notification');
    } finally {
      setLoading(false);
    }
  }, [notificationId]);

  useEffect(() => {
    fetchNotification();
  }, [fetchNotification]);

  return {
    notification,
    loading,
    error,
    refresh: fetchNotification,
  };
};

// Notification Templates Hook
export const useSallaNotificationTemplates = () => {
  const [templates, setTemplates] = useState<SallaNotificationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.getNotificationTemplates();
      if (response.success) {
        setTemplates(response.data || []);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notification templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (
    templateData: Omit<SallaNotificationTemplate, 'id' | 'created_at' | 'updated_at'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.createNotificationTemplate(templateData);
      if (response.success) {
        await fetchTemplates();
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create notification template');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const updateTemplate = useCallback(async (
    templateId: string,
    templateData: Partial<Omit<SallaNotificationTemplate, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.updateNotificationTemplate(templateId, templateData);
      if (response.success) {
        await fetchTemplates();
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update notification template');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await sallaNotificationService.deleteNotificationTemplate(templateId);
      if (response.success) {
        setTemplates(prev => prev.filter(template => template.id !== templateId));
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification template');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refresh: fetchTemplates,
  };
};

// Notification Settings Hook
export const useSallaNotificationSettings = (userId: string | null) => {
  const [settings, setSettings] = useState<SallaNotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.getNotificationSettings(userId);
      if (response.success) {
        setSettings(response.data || null);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notification settings');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateSettings = useCallback(async (
    settingsData: Partial<Omit<SallaNotificationSettings, 'user_id'>>
  ) => {
    if (!userId) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.updateNotificationSettings(userId, settingsData);
      if (response.success) {
        setSettings(response.data || null);
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update notification settings');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    refresh: fetchSettings,
  };
};

// Push Token Management Hook
export const useSallaPushTokens = (userId: string | null) => {
  const [tokens, setTokens] = useState<SallaPushToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerToken = useCallback(async (
    deviceId: string,
    token: string,
    platform: 'ios' | 'android' | 'web'
  ) => {
    if (!userId) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.registerPushToken(userId, deviceId, token, platform);
      if (response.success) {
        setTokens(prev => [...prev, response.data!]);
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register push token');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateToken = useCallback(async (
    tokenId: string,
    token: string,
    active = true
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.updatePushToken(tokenId, token, active);
      if (response.success) {
        setTokens(prev => 
          prev.map(t => t.id === tokenId ? response.data! : t)
        );
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update push token');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteToken = useCallback(async (tokenId: string) => {
    try {
      const response = await sallaNotificationService.deletePushToken(tokenId);
      if (response.success) {
        setTokens(prev => prev.filter(token => token.id !== tokenId));
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete push token');
      return false;
    }
  }, []);

  return {
    tokens,
    loading,
    error,
    registerToken,
    updateToken,
    deleteToken,
  };
};

// Webhooks Hook
export const useSallaWebhooks = (params?: WebhookSearchParams) => {
  const [webhooks, setWebhooks] = useState<SallaWebhook[]>([]);
  const [pagination, setPagination] = useState<SallaPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async (searchParams?: WebhookSearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.getWebhooks(searchParams || params);
      if (response.success) {
        setWebhooks(response.data || []);
        setPagination(response.pagination || null);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch webhooks');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createWebhook = useCallback(async (webhookData: CreateWebhookRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.createWebhook(webhookData);
      if (response.success) {
        await fetchWebhooks();
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create webhook');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchWebhooks]);

  const updateWebhook = useCallback(async (
    webhookId: string,
    webhookData: UpdateWebhookRequest
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.updateWebhook(webhookId, webhookData);
      if (response.success) {
        await fetchWebhooks();
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update webhook');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchWebhooks]);

  const deleteWebhook = useCallback(async (webhookId: string) => {
    try {
      const response = await sallaNotificationService.deleteWebhook(webhookId);
      if (response.success) {
        setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete webhook');
      return false;
    }
  }, []);

  const testWebhook = useCallback(async (webhookId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.testWebhook(webhookId);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to test webhook');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  return {
    webhooks,
    pagination,
    loading,
    error,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    refresh: fetchWebhooks,
  };
};

// Webhook Events Hook
export const useSallaWebhookEvents = (webhookId: string | null) => {
  const [events, setEvents] = useState<SallaWebhookEvent[]>([]);
  const [pagination, setPagination] = useState<SallaPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (
    status?: string,
    page = 1,
    limit = 20
  ) => {
    if (!webhookId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.getWebhookEvents(webhookId, status, page, limit);
      if (response.success) {
        setEvents(response.data || []);
        setPagination(response.pagination || null);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch webhook events');
    } finally {
      setLoading(false);
    }
  }, [webhookId]);

  const retryEvent = useCallback(async (eventId: string) => {
    try {
      const response = await sallaNotificationService.retryWebhookEvent(eventId);
      if (response.success) {
        await fetchEvents();
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retry webhook event');
      return null;
    }
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    pagination,
    loading,
    error,
    fetchEvents,
    retryEvent,
    refresh: fetchEvents,
  };
};

// Send Notifications Hook
export const useSallaSendNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendPushNotification = useCallback(async (
    userIds: string[],
    title: string,
    message: string,
    data?: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.sendPushNotification(userIds, title, message, data);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send push notification');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmailNotification = useCallback(async (
    userIds: string[],
    subject: string,
    content: string,
    templateId?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.sendEmailNotification(userIds, subject, content, templateId);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send email notification');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendSMSNotification = useCallback(async (
    phoneNumbers: string[],
    message: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sallaNotificationService.sendSMSNotification(phoneNumbers, message);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS notification');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    sendPushNotification,
    sendEmailNotification,
    sendSMSNotification,
  };
};