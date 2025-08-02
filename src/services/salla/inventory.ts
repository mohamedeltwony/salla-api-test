// Salla API Inventory Management Service

import { SallaApiClient } from './client';
import { SallaApiResponse } from './types';

// Inventory interfaces
export interface SallaInventoryItem {
  id: string;
  product_id: string;
  variant_id?: string;
  sku: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
  track_quantity: boolean;
  allow_backorder: boolean;
  location_id?: string;
  warehouse_id?: string;
  cost_price?: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface SallaInventoryLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SallaInventoryMovement {
  id: string;
  product_id: string;
  variant_id?: string;
  location_id?: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'sale' | 'return' | 'damage';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason?: string;
  reference_id?: string;
  reference_type?: string;
  user_id?: string;
  notes?: string;
  created_at: string;
}

export interface SallaLowStockAlert {
  id: string;
  product_id: string;
  variant_id?: string;
  sku: string;
  product_name: string;
  current_quantity: number;
  threshold: number;
  location_id?: string;
  location_name?: string;
  status: 'active' | 'resolved' | 'ignored';
  created_at: string;
  updated_at: string;
}

export interface SallaStockAdjustment {
  product_id: string;
  variant_id?: string;
  location_id?: string;
  quantity: number;
  type: 'set' | 'add' | 'subtract';
  reason?: string;
  notes?: string;
}

export interface SallaInventoryTransfer {
  id?: string;
  product_id: string;
  variant_id?: string;
  from_location_id: string;
  to_location_id: string;
  quantity: number;
  status?: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SallaInventoryReport {
  total_products: number;
  total_variants: number;
  total_quantity: number;
  total_value: number;
  low_stock_items: number;
  out_of_stock_items: number;
  locations: {
    id: string;
    name: string;
    total_quantity: number;
    total_value: number;
  }[];
  top_products: {
    product_id: string;
    product_name: string;
    quantity: number;
    value: number;
  }[];
  recent_movements: SallaInventoryMovement[];
}

export interface InventoryUpdateRequest {
  product_id: string;
  variant_id?: string;
  quantity?: number;
  low_stock_threshold?: number;
  track_quantity?: boolean;
  allow_backorder?: boolean;
  location_id?: string;
  cost_price?: number;
}

export interface InventoryBulkUpdateRequest {
  updates: InventoryUpdateRequest[];
  location_id?: string;
  reason?: string;
  notes?: string;
}

export interface InventorySearchParams {
  product_id?: string;
  sku?: string;
  location_id?: string;
  low_stock?: boolean;
  out_of_stock?: boolean;
  track_quantity?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'quantity' | 'product_name' | 'sku' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

class SallaInventoryService {
  private client: SallaApiClient;

  constructor(client: SallaApiClient) {
    this.client = client;
  }

  // Get inventory items
  async getInventoryItems(params?: InventorySearchParams): Promise<SallaApiResponse<SallaInventoryItem[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await this.client.get(`/inventory?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory items retrieved successfully',
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch inventory items',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Get single inventory item
  async getInventoryItem(productId: string, variantId?: string, locationId?: string): Promise<SallaApiResponse<SallaInventoryItem>> {
    try {
      const queryParams = new URLSearchParams();
      if (variantId) queryParams.append('variant_id', variantId);
      if (locationId) queryParams.append('location_id', locationId);

      const response = await this.client.get(`/inventory/${productId}?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory item retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch inventory item',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Update inventory item
  async updateInventoryItem(updateData: InventoryUpdateRequest): Promise<SallaApiResponse<SallaInventoryItem>> {
    try {
      const { product_id, variant_id, ...data } = updateData;
      let endpoint = `/inventory/${product_id}`;
      if (variant_id) {
        endpoint += `/${variant_id}`;
      }

      const response = await this.client.put(endpoint, data);
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update inventory',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Bulk update inventory
  async bulkUpdateInventory(bulkData: InventoryBulkUpdateRequest): Promise<SallaApiResponse<{ updated: number; failed: number; errors?: any[] }>> {
    try {
      const response = await this.client.post('/inventory/bulk-update', bulkData);
      return {
        success: true,
        data: response.data.data,
        message: 'Bulk inventory update completed',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to bulk update inventory',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Adjust stock
  async adjustStock(adjustmentData: SallaStockAdjustment): Promise<SallaApiResponse<SallaInventoryItem>> {
    try {
      const response = await this.client.post('/inventory/adjust', adjustmentData);
      return {
        success: true,
        data: response.data.data,
        message: 'Stock adjusted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to adjust stock',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Get inventory movements
  async getInventoryMovements(
    productId?: string,
    variantId?: string,
    locationId?: string,
    type?: string,
    page = 1,
    limit = 20
  ): Promise<SallaApiResponse<SallaInventoryMovement[]>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (productId) queryParams.append('product_id', productId);
      if (variantId) queryParams.append('variant_id', variantId);
      if (locationId) queryParams.append('location_id', locationId);
      if (type) queryParams.append('type', type);

      const response = await this.client.get(`/inventory/movements?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory movements retrieved successfully',
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch inventory movements',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Get low stock alerts
  async getLowStockAlerts(
    status?: 'active' | 'resolved' | 'ignored',
    locationId?: string,
    page = 1,
    limit = 20
  ): Promise<SallaApiResponse<SallaLowStockAlert[]>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (status) queryParams.append('status', status);
      if (locationId) queryParams.append('location_id', locationId);

      const response = await this.client.get(`/inventory/low-stock-alerts?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Low stock alerts retrieved successfully',
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch low stock alerts',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Update low stock alert status
  async updateLowStockAlert(alertId: string, status: 'resolved' | 'ignored'): Promise<SallaApiResponse<SallaLowStockAlert>> {
    try {
      const response = await this.client.put(`/inventory/low-stock-alerts/${alertId}`, { status });
      return {
        success: true,
        data: response.data.data,
        message: 'Low stock alert updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update low stock alert',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Get inventory locations
  async getInventoryLocations(): Promise<SallaApiResponse<SallaInventoryLocation[]>> {
    try {
      const response = await this.client.get('/inventory/locations');
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory locations retrieved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch inventory locations',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Create inventory location
  async createInventoryLocation(locationData: Omit<SallaInventoryLocation, 'id' | 'created_at' | 'updated_at'>): Promise<SallaApiResponse<SallaInventoryLocation>> {
    try {
      const response = await this.client.post('/inventory/locations', locationData);
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory location created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create inventory location',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Update inventory location
  async updateInventoryLocation(
    locationId: string,
    locationData: Partial<Omit<SallaInventoryLocation, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SallaApiResponse<SallaInventoryLocation>> {
    try {
      const response = await this.client.put(`/inventory/locations/${locationId}`, locationData);
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory location updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update inventory location',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Delete inventory location
  async deleteInventoryLocation(locationId: string): Promise<SallaApiResponse<void>> {
    try {
      await this.client.delete(`/inventory/locations/${locationId}`);
      return {
        success: true,
        message: 'Inventory location deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete inventory location',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Transfer inventory
  async transferInventory(transferData: Omit<SallaInventoryTransfer, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<SallaApiResponse<SallaInventoryTransfer>> {
    try {
      const response = await this.client.post('/inventory/transfer', transferData);
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory transfer initiated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to transfer inventory',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Get inventory transfers
  async getInventoryTransfers(
    status?: 'pending' | 'in_transit' | 'completed' | 'cancelled',
    fromLocationId?: string,
    toLocationId?: string,
    page = 1,
    limit = 20
  ): Promise<SallaApiResponse<SallaInventoryTransfer[]>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (status) queryParams.append('status', status);
      if (fromLocationId) queryParams.append('from_location_id', fromLocationId);
      if (toLocationId) queryParams.append('to_location_id', toLocationId);

      const response = await this.client.get(`/inventory/transfers?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory transfers retrieved successfully',
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch inventory transfers',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Update inventory transfer status
  async updateInventoryTransfer(
    transferId: string,
    status: 'in_transit' | 'completed' | 'cancelled',
    notes?: string
  ): Promise<SallaApiResponse<SallaInventoryTransfer>> {
    try {
      const response = await this.client.put(`/inventory/transfers/${transferId}`, { status, notes });
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory transfer updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update inventory transfer',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Get inventory report
  async getInventoryReport(
    locationId?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<SallaApiResponse<SallaInventoryReport>> {
    try {
      const queryParams = new URLSearchParams();
      if (locationId) queryParams.append('location_id', locationId);
      if (dateFrom) queryParams.append('date_from', dateFrom);
      if (dateTo) queryParams.append('date_to', dateTo);

      const response = await this.client.get(`/inventory/report?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory report generated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate inventory report',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Export inventory data
  async exportInventoryData(
    format: 'csv' | 'xlsx' = 'csv',
    locationId?: string,
    includeMovements = false
  ): Promise<SallaApiResponse<{ download_url: string; expires_at: string }>> {
    try {
      const queryParams = new URLSearchParams({ format });
      if (locationId) queryParams.append('location_id', locationId);
      if (includeMovements) queryParams.append('include_movements', 'true');

      const response = await this.client.post(`/inventory/export?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory export initiated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export inventory data',
        errors: error.response?.data?.errors,
      };
    }
  }

  // Import inventory data
  async importInventoryData(
    file: File,
    locationId?: string,
    updateExisting = true
  ): Promise<SallaApiResponse<{ imported: number; updated: number; failed: number; errors?: any[] }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (locationId) formData.append('location_id', locationId);
      formData.append('update_existing', updateExisting.toString());

      const response = await this.client.post('/inventory/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data.data,
        message: 'Inventory import completed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to import inventory data',
        errors: error.response?.data?.errors,
      };
    }
  }
}

// Create and export the inventory service instance
export const sallaInventoryService = new SallaInventoryService(new SallaApiClient());
export default SallaInventoryService;