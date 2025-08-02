// Salla API Notifications and Webhooks Service

import { SallaApiClient } from './client';
import { SallaApiResponse, SallaPagination } from './types';

// Notification Types
export interface SallaNotification {
  id: string;
  type: 'order' | 'product' | 'user' | 'payment' | 'inventory' | 'system' | 'marketing';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('push' | 'email' | 'sms' | 'in_app')[];
  user_id?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  action_url?: string;
  image_url?: string;
}

export interface SallaNotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables: string[];
  channels: ('push' | 'email' | 'sms' | 'in_app')[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SallaNotificationSettings {
  user_id: string;
  email_notifications: {
    order_updates: boolean;
    product_updates: boolean;
    marketing: boolean;
    security: boolean;
    newsletter: boolean;
  };
  push_notifications: {
    order_updates: boolean;
    product_updates: boolean;
    marketing: boolean;
    security: boolean;
    inventory_alerts: boolean;
  };
  sms_notifications: {
    order_updates: boolean;
    security: boolean;
    urgent_only: boolean;
  };
  in_app_notifications: {
    all: boolean;
    sound: boolean;
    vibration: boolean;
  };
  timezone: string;
  language: string;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface SallaWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  headers?: Record<string, string>;
  retry_attempts: number;
  timeout: number;
  last_triggered_at?: string;
  last_response_status?: number;
  created_at: string;
  updated_at: string;
}

export interface SallaWebhookEvent {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, any>;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  response_status?: number;
  response_body?: string;
  attempts: number;
  next_retry_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SallaPushToken {
  id: string;
  user_id: string;
  device_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Request/Response Types
export interface CreateNotificationRequest {
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('push' | 'email' | 'sms' | 'in_app')[];
  user_ids?: string[];
  user_segments?: string[];
  schedule_at?: string;
  expires_at?: string;
  action_url?: string;
  image_url?: string;
}

export interface CreateWebhookRequest {
  name: string;
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  retry_attempts?: number;
  timeout?: number;
}

export interface UpdateWebhookRequest {
  name?: string;
  url?: string;
  events?: string[];
  secret?: string;
  headers?: Record<string, string>;
  retry_attempts?: number;
  timeout?: number;
  active?: boolean;
}

export interface NotificationSearchParams {
  type?: string;
  read?: boolean;
  priority?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface WebhookSearchParams {
  active?: boolean;
  event_type?: string;
  url?: string;
  page?: number;
  limit?: number;
}

// Notification Service Class
export class SallaNotificationService {
  constructor(private apiClient: SallaApiClient) {}

  // Notifications Management
  async getNotifications(
    params?: NotificationSearchParams
  ): Promise<SallaApiResponse<SallaNotification[]>> {
    try {
      const response = await this.apiClient.get('/notifications', { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: 'Notifications retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notifications',
        error: error.response?.data,
      };
    }
  }

  async getNotification(notificationId: string): Promise<SallaApiResponse<SallaNotification>> {
    try {
      const response = await this.apiClient.get(`/notifications/${notificationId}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Notification retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notification',
        error: error.response?.data,
      };
    }
  }

  async createNotification(
    notificationData: CreateNotificationRequest
  ): Promise<SallaApiResponse<SallaNotification>> {
    try {
      const response = await this.apiClient.post('/notifications', notificationData);
      return {
        success: true,
        data: response.data.data,
        message: 'Notification created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create notification',
        error: error.response?.data,
      };
    }
  }

  async markAsRead(notificationId: string): Promise<SallaApiResponse<SallaNotification>> {
    try {
      const response = await this.apiClient.patch(`/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response.data.data,
        message: 'Notification marked as read',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notification as read',
        error: error.response?.data,
      };
    }
  }

  async markAllAsRead(userId?: string): Promise<SallaApiResponse<{ count: number }>> {
    try {
      const response = await this.apiClient.patch('/notifications/read-all', { user_id: userId });
      return {
        success: true,
        data: response.data.data,
        message: 'All notifications marked as read',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark all notifications as read',
        error: error.response?.data,
      };
    }
  }

  async deleteNotification(notificationId: string): Promise<SallaApiResponse<void>> {
    try {
      await this.apiClient.delete(`/notifications/${notificationId}`);
      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete notification',
        error: error.response?.data,
      };
    }
  }

  // Notification Templates
  async getNotificationTemplates(): Promise<SallaApiResponse<SallaNotificationTemplate[]>> {
    try {
      const response = await this.apiClient.get('/notifications/templates');
      return {
        success: true,
        data: response.data.data,
        message: 'Notification templates retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notification templates',
        error: error.response?.data,
      };
    }
  }

  async getNotificationTemplate(templateId: string): Promise<SallaApiResponse<SallaNotificationTemplate>> {
    try {
      const response = await this.apiClient.get(`/notifications/templates/${templateId}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Notification template retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notification template',
        error: error.response?.data,
      };
    }
  }

  async createNotificationTemplate(
    templateData: Omit<SallaNotificationTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SallaApiResponse<SallaNotificationTemplate>> {
    try {
      const response = await this.apiClient.post('/notifications/templates', templateData);
      return {
        success: true,
        data: response.data.data,
        message: 'Notification template created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create notification template',
        error: error.response?.data,
      };
    }
  }

  async updateNotificationTemplate(
    templateId: string,
    templateData: Partial<Omit<SallaNotificationTemplate, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SallaApiResponse<SallaNotificationTemplate>> {
    try {
      const response = await this.apiClient.patch(`/notifications/templates/${templateId}`, templateData);
      return {
        success: true,
        data: response.data.data,
        message: 'Notification template updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update notification template',
        error: error.response?.data,
      };
    }
  }

  async deleteNotificationTemplate(templateId: string): Promise<SallaApiResponse<void>> {
    try {
      await this.apiClient.delete(`/notifications/templates/${templateId}`);
      return {
        success: true,
        message: 'Notification template deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete notification template',
        error: error.response?.data,
      };
    }
  }

  // Notification Settings
  async getNotificationSettings(userId: string): Promise<SallaApiResponse<SallaNotificationSettings>> {
    try {
      const response = await this.apiClient.get(`/users/${userId}/notification-settings`);
      return {
        success: true,
        data: response.data.data,
        message: 'Notification settings retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notification settings',
        error: error.response?.data,
      };
    }
  }

  async updateNotificationSettings(
    userId: string,
    settings: Partial<Omit<SallaNotificationSettings, 'user_id'>>
  ): Promise<SallaApiResponse<SallaNotificationSettings>> {
    try {
      const response = await this.apiClient.patch(`/users/${userId}/notification-settings`, settings);
      return {
        success: true,
        data: response.data.data,
        message: 'Notification settings updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update notification settings',
        error: error.response?.data,
      };
    }
  }

  // Push Token Management
  async registerPushToken(
    userId: string,
    deviceId: string,
    token: string,
    platform: 'ios' | 'android' | 'web'
  ): Promise<SallaApiResponse<SallaPushToken>> {
    try {
      const response = await this.apiClient.post('/push-tokens', {
        user_id: userId,
        device_id: deviceId,
        token,
        platform,
      });
      return {
        success: true,
        data: response.data.data,
        message: 'Push token registered successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to register push token',
        error: error.response?.data,
      };
    }
  }

  async updatePushToken(
    tokenId: string,
    token: string,
    active = true
  ): Promise<SallaApiResponse<SallaPushToken>> {
    try {
      const response = await this.apiClient.patch(`/push-tokens/${tokenId}`, { token, active });
      return {
        success: true,
        data: response.data.data,
        message: 'Push token updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update push token',
        error: error.response?.data,
      };
    }
  }

  async deletePushToken(tokenId: string): Promise<SallaApiResponse<void>> {
    try {
      await this.apiClient.delete(`/push-tokens/${tokenId}`);
      return {
        success: true,
        message: 'Push token deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete push token',
        error: error.response?.data,
      };
    }
  }

  // Webhooks Management
  async getWebhooks(params?: WebhookSearchParams): Promise<SallaApiResponse<SallaWebhook[]>> {
    try {
      const response = await this.apiClient.get('/webhooks', { params });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: 'Webhooks retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch webhooks',
        error: error.response?.data,
      };
    }
  }

  async getWebhook(webhookId: string): Promise<SallaApiResponse<SallaWebhook>> {
    try {
      const response = await this.apiClient.get(`/webhooks/${webhookId}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Webhook retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch webhook',
        error: error.response?.data,
      };
    }
  }

  async createWebhook(webhookData: CreateWebhookRequest): Promise<SallaApiResponse<SallaWebhook>> {
    try {
      const response = await this.apiClient.post('/webhooks', webhookData);
      return {
        success: true,
        data: response.data.data,
        message: 'Webhook created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create webhook',
        error: error.response?.data,
      };
    }
  }

  async updateWebhook(
    webhookId: string,
    webhookData: UpdateWebhookRequest
  ): Promise<SallaApiResponse<SallaWebhook>> {
    try {
      const response = await this.apiClient.patch(`/webhooks/${webhookId}`, webhookData);
      return {
        success: true,
        data: response.data.data,
        message: 'Webhook updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update webhook',
        error: error.response?.data,
      };
    }
  }

  async deleteWebhook(webhookId: string): Promise<SallaApiResponse<void>> {
    try {
      await this.apiClient.delete(`/webhooks/${webhookId}`);
      return {
        success: true,
        message: 'Webhook deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete webhook',
        error: error.response?.data,
      };
    }
  }

  async testWebhook(webhookId: string): Promise<SallaApiResponse<{ status: string; response: any }>> {
    try {
      const response = await this.apiClient.post(`/webhooks/${webhookId}/test`);
      return {
        success: true,
        data: response.data.data,
        message: 'Webhook test completed',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to test webhook',
        error: error.response?.data,
      };
    }
  }

  // Webhook Events
  async getWebhookEvents(
    webhookId: string,
    status?: string,
    page = 1,
    limit = 20
  ): Promise<SallaApiResponse<SallaWebhookEvent[]>> {
    try {
      const response = await this.apiClient.get(`/webhooks/${webhookId}/events`, {
        params: { status, page, limit },
      });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: 'Webhook events retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch webhook events',
        error: error.response?.data,
      };
    }
  }

  async retryWebhookEvent(eventId: string): Promise<SallaApiResponse<SallaWebhookEvent>> {
    try {
      const response = await this.apiClient.post(`/webhook-events/${eventId}/retry`);
      return {
        success: true,
        data: response.data.data,
        message: 'Webhook event retry initiated',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to retry webhook event',
        error: error.response?.data,
      };
    }
  }

  // Send Notifications
  async sendPushNotification(
    userIds: string[],
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<SallaApiResponse<{ sent: number; failed: number }>> {
    try {
      const response = await this.apiClient.post('/notifications/push', {
        user_ids: userIds,
        title,
        message,
        data,
      });
      return {
        success: true,
        data: response.data.data,
        message: 'Push notification sent successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send push notification',
        error: error.response?.data,
      };
    }
  }

  async sendEmailNotification(
    userIds: string[],
    subject: string,
    content: string,
    templateId?: string
  ): Promise<SallaApiResponse<{ sent: number; failed: number }>> {
    try {
      const response = await this.apiClient.post('/notifications/email', {
        user_ids: userIds,
        subject,
        content,
        template_id: templateId,
      });
      return {
        success: true,
        data: response.data.data,
        message: 'Email notification sent successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send email notification',
        error: error.response?.data,
      };
    }
  }

  async sendSMSNotification(
    phoneNumbers: string[],
    message: string
  ): Promise<SallaApiResponse<{ sent: number; failed: number }>> {
    try {
      const response = await this.apiClient.post('/notifications/sms', {
        phone_numbers: phoneNumbers,
        message,
      });
      return {
        success: true,
        data: response.data.data,
        message: 'SMS notification sent successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send SMS notification',
        error: error.response?.data,
      };
    }
  }
}

// Export service instance
export const sallaNotificationService = new SallaNotificationService(
  new SallaApiClient()
);