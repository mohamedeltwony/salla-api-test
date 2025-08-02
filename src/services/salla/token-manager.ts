// Salla Token Manager Service
// Manages authentication tokens received from app installation webhooks
// Uses localStorage for browser-compatible token storage

// Interface for stored merchant token data
export interface MerchantTokenData {
  merchantId: string;
  merchantName: string;
  merchantDomain: string;
  merchantEmail: string;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  currency: string;
  timezone: string;
  installedAt: string;
  updatedAt: string;
}

// Interface for token validation result
export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  timeUntilExpiry?: number; // milliseconds
}

export class SallaTokenManager {
  private storageKey = 'salla-merchant-tokens';

  constructor() {
    // Browser-compatible token storage using localStorage
  }

  // Save tokens to localStorage
  private saveTokens(tokens: MerchantTokenData[]): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(tokens));
      }
    } catch (error) {
      console.error('Failed to save tokens to localStorage:', error);
      throw new Error('Failed to save tokens to localStorage');
    }
  }

  // Store merchant token data
  async storeToken(tokenData: Omit<MerchantTokenData, 'updatedAt'>): Promise<void> {
    try {
      const dataWithTimestamp: MerchantTokenData = {
        ...tokenData,
        updatedAt: new Date().toISOString()
      };

      const existingTokens = await this.getAllTokens();
      const tokenIndex = existingTokens.findIndex(
        token => token.merchantId === tokenData.merchantId
      );
      
      if (tokenIndex >= 0) {
        existingTokens[tokenIndex] = dataWithTimestamp;
      } else {
        existingTokens.push(dataWithTimestamp);
      }
      
      this.saveTokens(existingTokens);
      console.log(`✅ Token stored for merchant: ${tokenData.merchantId}`);
    } catch (error) {
      console.error(`❌ Failed to store token for merchant ${tokenData.merchantId}:`, error);
      throw error;
    }
  }

  // Retrieve merchant token data
  async getToken(merchantId: string): Promise<MerchantTokenData | null> {
    try {
      const tokens = await this.getAllTokens();
      return tokens.find(token => token.merchantId === merchantId) || null;
    } catch (error) {
      console.error(`❌ Failed to retrieve token for merchant ${merchantId}:`, error);
      return null;
    }
  }

  // Get all stored merchant tokens
  async getAllTokens(): Promise<MerchantTokenData[]> {
    try {
      if (typeof window === 'undefined') {
        // Server-side rendering - return empty array
        return [];
      }
      
      const storedTokens = localStorage.getItem(this.storageKey);
      return storedTokens ? JSON.parse(storedTokens) : [];
    } catch (error) {
      console.error('❌ Failed to read tokens from localStorage:', error);
      return [];
    }
  }

  // Validate token (check if exists and not expired)
  async validateToken(merchantId: string): Promise<TokenValidationResult> {
    try {
      const tokenData = await this.getToken(merchantId);
      
      if (!tokenData) {
        return {
          isValid: false,
          isExpired: false
        };
      }

      // Calculate expiration time
      const installedAt = new Date(tokenData.installedAt);
      const expiresAt = new Date(installedAt.getTime() + (tokenData.expiresIn * 1000));
      const now = new Date();
      const isExpired = now > expiresAt;
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();

      return {
        isValid: !isExpired,
        isExpired,
        expiresAt,
        timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : 0
      };
    } catch (error) {
      console.error(`❌ Failed to validate token for merchant ${merchantId}:`, error);
      return {
        isValid: false,
        isExpired: false
      };
    }
  }

  // Update access token (for token refresh)
  async updateAccessToken(
    merchantId: string, 
    newAccessToken: string, 
    newExpiresIn?: number
  ): Promise<void> {
    try {
      const existingData = await this.getToken(merchantId);
      
      if (!existingData) {
        throw new Error(`No token data found for merchant ${merchantId}`);
      }

      const updatedData: MerchantTokenData = {
        ...existingData,
        accessToken: newAccessToken,
        expiresIn: newExpiresIn || existingData.expiresIn,
        updatedAt: new Date().toISOString()
      };

      await this.storeToken(updatedData);
      console.log(`✅ Access token updated for merchant: ${merchantId}`);
    } catch (error) {
      console.error(`❌ Failed to update access token for merchant ${merchantId}:`, error);
      throw error;
    }
  }

  // Remove merchant token
  async removeToken(merchantId: string): Promise<void> {
    try {
      const tokens = await this.getAllTokens();
      const filteredTokens = tokens.filter(token => token.merchantId !== merchantId);
      
      if (filteredTokens.length === tokens.length) {
        console.log(`ℹ️ No token found for merchant: ${merchantId}`);
        return;
      }
      
      this.saveTokens(filteredTokens);
      console.log(`✅ Token removed for merchant: ${merchantId}`);
    } catch (error) {
      console.error(`❌ Failed to remove token for merchant ${merchantId}:`, error);
      throw error;
    }
  }

  // Get active (non-expired) tokens
  async getActiveTokens(): Promise<MerchantTokenData[]> {
    try {
      const allTokens = await this.getAllTokens();
      const activeTokens: MerchantTokenData[] = [];
      
      for (const token of allTokens) {
        const validation = await this.validateToken(token.merchantId);
        if (validation.isValid) {
          activeTokens.push(token);
        }
      }
      
      return activeTokens;
    } catch (error) {
      console.error('❌ Failed to get active tokens:', error);
      throw error;
    }
  }

  // Get token summary for dashboard/monitoring
  async getTokenSummary(): Promise<{
    total: number;
    active: number;
    expired: number;
    merchants: Array<{
      merchantId: string;
      merchantName: string;
      isActive: boolean;
      expiresAt?: Date;
      timeUntilExpiry?: string;
    }>;
  }> {
    try {
      const allTokens = await this.getAllTokens();
      const summary = {
        total: allTokens.length,
        active: 0,
        expired: 0,
        merchants: [] as any[]
      };

      for (const token of allTokens) {
        const validation = await this.validateToken(token.merchantId);
        
        if (validation.isValid) {
          summary.active++;
        } else if (validation.isExpired) {
          summary.expired++;
        }

        // Format time until expiry
        let timeUntilExpiry: string | undefined;
        if (validation.timeUntilExpiry && validation.timeUntilExpiry > 0) {
          const hours = Math.floor(validation.timeUntilExpiry / (1000 * 60 * 60));
          const days = Math.floor(hours / 24);
          
          if (days > 0) {
            timeUntilExpiry = `${days} days`;
          } else if (hours > 0) {
            timeUntilExpiry = `${hours} hours`;
          } else {
            timeUntilExpiry = 'Less than 1 hour';
          }
        }

        summary.merchants.push({
          merchantId: token.merchantId,
          merchantName: token.merchantName,
          isActive: validation.isValid,
          expiresAt: validation.expiresAt,
          timeUntilExpiry
        });
      }

      return summary;
    } catch (error) {
      console.error('❌ Failed to get token summary:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const sallaTokenManager = new SallaTokenManager();