// Salla Webhook Setup Utility
// Helper functions for configuring and managing Salla webhooks

import { sallaNotificationService } from './services';
import { CreateWebhookRequest, SallaWebhook } from './notifications';

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  name?: string;
  description?: string;
}

export interface WebhookSetupResult {
  success: boolean;
  webhook?: SallaWebhook;
  error?: string;
  message: string;
}

/**
 * Available Salla webhook events
 */
export const SALLA_WEBHOOK_EVENTS = {
  // App events
  APP_INSTALLED: 'app.installed',
  APP_UNINSTALLED: 'app.uninstalled',
  APP_UPDATED: 'app.updated',
  
  // Order events
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_REFUNDED: 'order.refunded',
  
  // Product events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  PRODUCT_QUANTITY_LOW: 'product.quantity.low',
  
  // Customer events
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_DELETED: 'customer.deleted',
  
  // Category events
  CATEGORY_CREATED: 'category.created',
  CATEGORY_UPDATED: 'category.updated',
  CATEGORY_DELETED: 'category.deleted',
  
  // Coupon events
  COUPON_CREATED: 'coupon.created',
  COUPON_UPDATED: 'coupon.updated',
  COUPON_DELETED: 'coupon.deleted',
  
  // Store events
  STORE_BRANCH_CREATED: 'store.branch.created',
  STORE_BRANCH_UPDATED: 'store.branch.updated',
  STORE_BRANCH_DELETED: 'store.branch.deleted',
} as const;

/**
 * Predefined webhook configurations for common use cases
 */
export const WEBHOOK_PRESETS = {
  APP_INSTALLATION: {
    name: 'App Installation Webhook',
    description: 'Receives authentication tokens when app is installed',
    events: [SALLA_WEBHOOK_EVENTS.APP_INSTALLED, SALLA_WEBHOOK_EVENTS.APP_UNINSTALLED],
  },
  
  ORDER_MANAGEMENT: {
    name: 'Order Management Webhook',
    description: 'Receives all order-related events',
    events: [
      SALLA_WEBHOOK_EVENTS.ORDER_CREATED,
      SALLA_WEBHOOK_EVENTS.ORDER_UPDATED,
      SALLA_WEBHOOK_EVENTS.ORDER_CANCELLED,
      SALLA_WEBHOOK_EVENTS.ORDER_SHIPPED,
      SALLA_WEBHOOK_EVENTS.ORDER_DELIVERED,
      SALLA_WEBHOOK_EVENTS.ORDER_REFUNDED,
    ],
  },
  
  INVENTORY_MANAGEMENT: {
    name: 'Inventory Management Webhook',
    description: 'Receives product and inventory events',
    events: [
      SALLA_WEBHOOK_EVENTS.PRODUCT_CREATED,
      SALLA_WEBHOOK_EVENTS.PRODUCT_UPDATED,
      SALLA_WEBHOOK_EVENTS.PRODUCT_DELETED,
      SALLA_WEBHOOK_EVENTS.PRODUCT_QUANTITY_LOW,
    ],
  },
  
  CUSTOMER_MANAGEMENT: {
    name: 'Customer Management Webhook',
    description: 'Receives customer-related events',
    events: [
      SALLA_WEBHOOK_EVENTS.CUSTOMER_CREATED,
      SALLA_WEBHOOK_EVENTS.CUSTOMER_UPDATED,
      SALLA_WEBHOOK_EVENTS.CUSTOMER_DELETED,
    ],
  },
  
  FULL_STORE_SYNC: {
    name: 'Full Store Synchronization',
    description: 'Receives all available events for complete store sync',
    events: Object.values(SALLA_WEBHOOK_EVENTS),
  },
} as const;

/**
 * Setup a webhook for app installation events
 */
export async function setupAppInstallationWebhook(
  baseUrl: string,
  secret?: string
): Promise<WebhookSetupResult> {
  try {
    const webhookUrl = `${baseUrl.replace(/\/$/, '')}/api/webhooks/salla/app-install`;
    
    const config: WebhookConfig = {
      url: webhookUrl,
      events: WEBHOOK_PRESETS.APP_INSTALLATION.events,
      secret: secret || process.env.SALLA_WEBHOOK_SECRET,
      name: WEBHOOK_PRESETS.APP_INSTALLATION.name,
      description: WEBHOOK_PRESETS.APP_INSTALLATION.description,
    };
    
    const result = await setupWebhook(config);
    
    if (result.success) {
      return {
        success: true,
        webhook: result.webhook,
        message: `App installation webhook successfully configured at: ${webhookUrl}`,
      };
    } else {
      return result;
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to setup app installation webhook',
    };
  }
}

/**
 * Setup a webhook with custom configuration
 */
export async function setupWebhook(config: WebhookConfig): Promise<WebhookSetupResult> {
  try {
    // Validate configuration
    if (!config.url) {
      return {
        success: false,
        error: 'Webhook URL is required',
        message: 'Invalid webhook configuration',
      };
    }
    
    if (!config.events || config.events.length === 0) {
      return {
        success: false,
        error: 'At least one event must be specified',
        message: 'Invalid webhook configuration',
      };
    }
    
    // Prepare webhook request
    const webhookRequest: CreateWebhookRequest = {
      url: config.url,
      events: config.events,
      secret: config.secret,
      name: config.name,
      description: config.description,
    };
    
    // Create webhook via Salla API
    const response = await sallaNotificationService.createWebhook(webhookRequest);
    if (!response.success) {
      throw new Error(response.message);
    }
    const webhook = response.data;
    
    return {
      success: true,
      webhook,
      message: `Webhook successfully created with ID: ${webhook.id}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create webhook',
    };
  }
}

/**
 * Get all configured webhooks
 */
export async function getWebhooks(): Promise<SallaWebhook[]> {
  try {
    const response = await sallaNotificationService.getWebhooks();
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch webhooks:', error);
    return [];
  }
}

/**
 * Delete a webhook by ID
 */
export async function deleteWebhook(webhookId: string): Promise<WebhookSetupResult> {
  try {
    const response = await sallaNotificationService.deleteWebhook(webhookId);
    
    return {
      success: response.success,
      message: response.message || `Webhook ${webhookId} successfully deleted`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `Failed to delete webhook ${webhookId}`,
    };
  }
}

/**
 * Test a webhook by sending a test event
 */
export async function testWebhook(webhookId: string): Promise<WebhookSetupResult> {
  try {
    const response = await sallaNotificationService.testWebhook(webhookId);
    
    return {
      success: response.success,
      message: response.message || `Test event sent to webhook ${webhookId}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `Failed to test webhook ${webhookId}`,
    };
  }
}

/**
 * Generate webhook URL for a specific endpoint
 */
export function generateWebhookUrl(baseUrl: string, endpoint: string): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${cleanBaseUrl}/api/webhooks/salla/${cleanEndpoint}`;
}

/**
 * Validate webhook URL format
 */
export function validateWebhookUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsedUrl = new URL(url);
    
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        valid: false,
        error: 'Webhook URL must use HTTP or HTTPS protocol',
      };
    }
    
    if (parsedUrl.protocol === 'http:' && parsedUrl.hostname !== 'localhost') {
      return {
        valid: false,
        error: 'HTTP URLs are only allowed for localhost development',
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Get webhook setup instructions
 */
export function getWebhookSetupInstructions(baseUrl: string): {
  appInstallUrl: string;
  steps: string[];
  notes: string[];
} {
  const appInstallUrl = generateWebhookUrl(baseUrl, 'app-install');
  
  return {
    appInstallUrl,
    steps: [
      '1. Go to Salla Developer Portal (https://developer.salla.sa/)',
      '2. Navigate to your app settings',
      '3. Find the "Webhooks" or "Events" section',
      `4. Add webhook URL: ${appInstallUrl}`,
      '5. Select "app.installed" and "app.uninstalled" events',
      '6. Save the webhook configuration',
      '7. Install your app to a test store to verify the webhook',
    ],
    notes: [
      'Make sure your webhook URL is publicly accessible',
      'Use HTTPS in production environments',
      'The webhook secret should match your SALLA_WEBHOOK_SECRET environment variable',
      'Test the webhook after setup to ensure it\'s working correctly',
    ],
  };
}