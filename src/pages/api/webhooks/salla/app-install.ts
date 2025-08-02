// Webhook endpoint for Salla app installation
// This endpoint receives authentication tokens when the app is added to a store

import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// Interface for the app installation webhook payload
interface SallaAppInstallPayload {
  event: 'app.store.authorize';
  merchant: {
    id: string;
    name: string;
    email: string;
    domain: string;
    currency: string;
    timezone: string;
    status: string;
  };
  data: {
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
    refresh_token?: string;
    scope: string;
    merchant_id: string;
  };
  created_at: string;
}

// Interface for webhook response
interface WebhookResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Verify webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(cleanSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Store authentication token using the token manager
async function storeAuthToken(payload: SallaAppInstallPayload): Promise<void> {
  try {
    const { sallaTokenManager } = await import('../../../services/salla/token-manager');
    
    console.log('📦 New Salla App Installation:', {
      merchantId: payload.merchant.id,
      merchantName: payload.merchant.name,
      merchantDomain: payload.merchant.domain,
      accessToken: payload.data.access_token.substring(0, 20) + '...', // Partial token for logging
      expiresIn: payload.data.expires_in,
      scope: payload.data.scope,
      installedAt: payload.created_at
    });

    // Store token data using the token manager
    await sallaTokenManager.storeToken({
      merchantId: payload.merchant.id,
      merchantName: payload.merchant.name,
      merchantDomain: payload.merchant.domain,
      merchantEmail: payload.merchant.email,
      accessToken: payload.data.access_token,
      refreshToken: payload.data.refresh_token,
      tokenType: payload.data.token_type,
      expiresIn: payload.data.expires_in,
      scope: payload.data.scope,
      currency: payload.merchant.currency,
      timezone: payload.merchant.timezone,
      installedAt: payload.created_at
    });
    
    console.log('✅ Authentication token stored successfully for merchant:', payload.merchant.id);
    
  } catch (error) {
    console.error('❌ Failed to store auth token:', error);
    throw error;
  }
}

// Main webhook handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Only POST requests are accepted.'
    });
  }

  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.SALLA_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ SALLA_WEBHOOK_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Webhook secret not configured'
      });
    }

    // Get signature from headers
    const signature = req.headers['x-salla-signature'] as string;
    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing webhook signature'
      });
    }

    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);
    
    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Parse the payload
    const payload: SallaAppInstallPayload = req.body;
    
    // Validate payload structure
    if (!payload.event || !payload.merchant || !payload.data) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload structure'
      });
    }

    // Check if this is an app installation event
    if (payload.event !== 'app.store.authorize') {
      return res.status(400).json({
        success: false,
        message: `Unsupported event type: ${payload.event}`
      });
    }

    // Validate required fields
    if (!payload.data.access_token || !payload.merchant.id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields in payload'
      });
    }

    console.log('🎉 Received Salla app installation webhook:', {
      event: payload.event,
      merchantId: payload.merchant.id,
      merchantName: payload.merchant.name,
      timestamp: payload.created_at
    });

    // Store the authentication token
    await storeAuthToken(payload);

    // Send success response
    return res.status(200).json({
      success: true,
      message: 'App installation processed successfully',
      data: {
        merchantId: payload.merchant.id,
        merchantName: payload.merchant.name,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing webhook'
    });
  }
}

// Configure Next.js to parse raw body for signature verification
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};