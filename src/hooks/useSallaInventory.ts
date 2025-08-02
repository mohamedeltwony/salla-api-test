// React hooks for Salla Inventory Management

import { useState, useEffect, useCallback } from 'react';
import {
  SallaInventoryItem,
  SallaInventoryLocation,
  SallaInventoryMovement,
  SallaLowStockAlert,
  SallaInventoryTransfer,
  SallaInventoryReport,
  InventoryUpdateRequest,
  InventoryBulkUpdateRequest,
  SallaStockAdjustment,
  InventorySearchParams,
  sallaInventoryService,
} from '../services/salla/inventory';
import { SallaPagination } from '../services/salla/types';

// Hook for managing inventory items
export const useSallaInventory = (initialParams?: InventorySearchParams) => {
  const [inventoryItems, setInventoryItems] = useState<SallaInventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<SallaPagination | null>(null);
  const [searchParams, setSearchParams] = useState<InventorySearchParams>(initialParams || {});

  const fetchInventoryItems = useCallback(async (params?: InventorySearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const finalParams = params || searchParams;
      const response = await sallaInventoryService.getInventoryItems(finalParams);
      
      if (response.success && response.data) {
        setInventoryItems(response.data);
        setPagination(response.pagination || null);
      } else {
        setError(response.message || 'Failed to fetch inventory items');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching inventory items');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const updateInventoryItem = useCallback(async (updateData: InventoryUpdateRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.updateInventoryItem(updateData);
      
      if (response.success && response.data) {
        // Update the item in the local state
        setInventoryItems(prev => 
          prev.map(item => 
            item.product_id === updateData.product_id && 
            item.variant_id === updateData.variant_id
              ? response.data!
              : item
          )
        );
        return response.data;
      } else {
        setError(response.message || 'Failed to update inventory item');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating inventory item');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateInventory = useCallback(async (bulkData: InventoryBulkUpdateRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.bulkUpdateInventory(bulkData);
      
      if (response.success) {
        // Refresh the inventory items after bulk update
        await fetchInventoryItems();
        return response.data;
      } else {
        setError(response.message || 'Failed to bulk update inventory');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during bulk update');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchInventoryItems]);

  const adjustStock = useCallback(async (adjustmentData: SallaStockAdjustment) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.adjustStock(adjustmentData);
      
      if (response.success && response.data) {
        // Update the item in the local state
        setInventoryItems(prev => 
          prev.map(item => 
            item.product_id === adjustmentData.product_id && 
            item.variant_id === adjustmentData.variant_id
              ? response.data!
              : item
          )
        );
        return response.data;
      } else {
        setError(response.message || 'Failed to adjust stock');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while adjusting stock');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchInventory = useCallback((params: InventorySearchParams) => {
    setSearchParams(params);
    fetchInventoryItems(params);
  }, [fetchInventoryItems]);

  const loadMore = useCallback(() => {
    if (pagination?.has_next_page) {
      const nextPageParams = {
        ...searchParams,
        page: (pagination.current_page || 1) + 1,
      };
      fetchInventoryItems(nextPageParams);
    }
  }, [pagination, searchParams, fetchInventoryItems]);

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  return {
    inventoryItems,
    loading,
    error,
    pagination,
    searchParams,
    fetchInventoryItems,
    updateInventoryItem,
    bulkUpdateInventory,
    adjustStock,
    searchInventory,
    loadMore,
    refetch: () => fetchInventoryItems(),
  };
};

// Hook for managing a single inventory item
export const useSallaInventoryItem = (productId: string, variantId?: string, locationId?: string) => {
  const [inventoryItem, setInventoryItem] = useState<SallaInventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventoryItem = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.getInventoryItem(productId, variantId, locationId);
      
      if (response.success && response.data) {
        setInventoryItem(response.data);
      } else {
        setError(response.message || 'Failed to fetch inventory item');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching inventory item');
    } finally {
      setLoading(false);
    }
  }, [productId, variantId, locationId]);

  const updateItem = useCallback(async (updateData: Omit<InventoryUpdateRequest, 'product_id' | 'variant_id'>) => {
    if (!productId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.updateInventoryItem({
        product_id: productId,
        variant_id: variantId,
        ...updateData,
      });
      
      if (response.success && response.data) {
        setInventoryItem(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to update inventory item');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating inventory item');
      return null;
    } finally {
      setLoading(false);
    }
  }, [productId, variantId]);

  useEffect(() => {
    fetchInventoryItem();
  }, [fetchInventoryItem]);

  return {
    inventoryItem,
    loading,
    error,
    fetchInventoryItem,
    updateItem,
    refetch: fetchInventoryItem,
  };
};

// Hook for managing inventory movements
export const useSallaInventoryMovements = (
  productId?: string,
  variantId?: string,
  locationId?: string,
  type?: string
) => {
  const [movements, setMovements] = useState<SallaInventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<SallaPagination | null>(null);

  const fetchMovements = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.getInventoryMovements(
        productId,
        variantId,
        locationId,
        type,
        page,
        limit
      );
      
      if (response.success && response.data) {
        if (page === 1) {
          setMovements(response.data);
        } else {
          setMovements(prev => [...prev, ...response.data!]);
        }
        setPagination(response.pagination || null);
      } else {
        setError(response.message || 'Failed to fetch inventory movements');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching inventory movements');
    } finally {
      setLoading(false);
    }
  }, [productId, variantId, locationId, type]);

  const loadMore = useCallback(() => {
    if (pagination?.has_next_page) {
      fetchMovements((pagination.current_page || 1) + 1);
    }
  }, [pagination, fetchMovements]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    loading,
    error,
    pagination,
    fetchMovements,
    loadMore,
    refetch: () => fetchMovements(1),
  };
};

// Hook for managing low stock alerts
export const useSallaLowStockAlerts = (
  status?: 'active' | 'resolved' | 'ignored',
  locationId?: string
) => {
  const [alerts, setAlerts] = useState<SallaLowStockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<SallaPagination | null>(null);

  const fetchAlerts = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.getLowStockAlerts(status, locationId, page, limit);
      
      if (response.success && response.data) {
        if (page === 1) {
          setAlerts(response.data);
        } else {
          setAlerts(prev => [...prev, ...response.data!]);
        }
        setPagination(response.pagination || null);
      } else {
        setError(response.message || 'Failed to fetch low stock alerts');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching low stock alerts');
    } finally {
      setLoading(false);
    }
  }, [status, locationId]);

  const updateAlertStatus = useCallback(async (alertId: string, newStatus: 'resolved' | 'ignored') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.updateLowStockAlert(alertId, newStatus);
      
      if (response.success && response.data) {
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId ? response.data! : alert
          )
        );
        return response.data;
      } else {
        setError(response.message || 'Failed to update alert status');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating alert status');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (pagination?.has_next_page) {
      fetchAlerts((pagination.current_page || 1) + 1);
    }
  }, [pagination, fetchAlerts]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    pagination,
    fetchAlerts,
    updateAlertStatus,
    loadMore,
    refetch: () => fetchAlerts(1),
  };
};

// Hook for managing inventory locations
export const useSallaInventoryLocations = () => {
  const [locations, setLocations] = useState<SallaInventoryLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.getInventoryLocations();
      
      if (response.success && response.data) {
        setLocations(response.data);
      } else {
        setError(response.message || 'Failed to fetch inventory locations');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching inventory locations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLocation = useCallback(async (locationData: Omit<SallaInventoryLocation, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.createInventoryLocation(locationData);
      
      if (response.success && response.data) {
        setLocations(prev => [...prev, response.data!]);
        return response.data;
      } else {
        setError(response.message || 'Failed to create inventory location');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating inventory location');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async (
    locationId: string,
    locationData: Partial<Omit<SallaInventoryLocation, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.updateInventoryLocation(locationId, locationData);
      
      if (response.success && response.data) {
        setLocations(prev => 
          prev.map(location => 
            location.id === locationId ? response.data! : location
          )
        );
        return response.data;
      } else {
        setError(response.message || 'Failed to update inventory location');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating inventory location');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLocation = useCallback(async (locationId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.deleteInventoryLocation(locationId);
      
      if (response.success) {
        setLocations(prev => prev.filter(location => location.id !== locationId));
        return true;
      } else {
        setError(response.message || 'Failed to delete inventory location');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting inventory location');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return {
    locations,
    loading,
    error,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    refetch: fetchLocations,
  };
};

// Hook for managing inventory transfers
export const useSallaInventoryTransfers = (
  status?: 'pending' | 'in_transit' | 'completed' | 'cancelled',
  fromLocationId?: string,
  toLocationId?: string
) => {
  const [transfers, setTransfers] = useState<SallaInventoryTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<SallaPagination | null>(null);

  const fetchTransfers = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.getInventoryTransfers(
        status,
        fromLocationId,
        toLocationId,
        page,
        limit
      );
      
      if (response.success && response.data) {
        if (page === 1) {
          setTransfers(response.data);
        } else {
          setTransfers(prev => [...prev, ...response.data!]);
        }
        setPagination(response.pagination || null);
      } else {
        setError(response.message || 'Failed to fetch inventory transfers');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching inventory transfers');
    } finally {
      setLoading(false);
    }
  }, [status, fromLocationId, toLocationId]);

  const createTransfer = useCallback(async (transferData: Omit<SallaInventoryTransfer, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.transferInventory(transferData);
      
      if (response.success && response.data) {
        setTransfers(prev => [response.data!, ...prev]);
        return response.data;
      } else {
        setError(response.message || 'Failed to create inventory transfer');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating inventory transfer');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransferStatus = useCallback(async (
    transferId: string,
    newStatus: 'in_transit' | 'completed' | 'cancelled',
    notes?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.updateInventoryTransfer(transferId, newStatus, notes);
      
      if (response.success && response.data) {
        setTransfers(prev => 
          prev.map(transfer => 
            transfer.id === transferId ? response.data! : transfer
          )
        );
        return response.data;
      } else {
        setError(response.message || 'Failed to update transfer status');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating transfer status');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (pagination?.has_next_page) {
      fetchTransfers((pagination.current_page || 1) + 1);
    }
  }, [pagination, fetchTransfers]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return {
    transfers,
    loading,
    error,
    pagination,
    fetchTransfers,
    createTransfer,
    updateTransferStatus,
    loadMore,
    refetch: () => fetchTransfers(1),
  };
};

// Hook for inventory reporting
export const useSallaInventoryReport = () => {
  const [report, setReport] = useState<SallaInventoryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (
    locationId?: string,
    dateFrom?: string,
    dateTo?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.getInventoryReport(locationId, dateFrom, dateTo);
      
      if (response.success && response.data) {
        setReport(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to generate inventory report');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating inventory report');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (
    format: 'csv' | 'xlsx' = 'csv',
    locationId?: string,
    includeMovements = false
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.exportInventoryData(format, locationId, includeMovements);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Failed to export inventory data');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while exporting inventory data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const importData = useCallback(async (
    file: File,
    locationId?: string,
    updateExisting = true
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sallaInventoryService.importInventoryData(file, locationId, updateExisting);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Failed to import inventory data');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while importing inventory data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    report,
    loading,
    error,
    generateReport,
    exportData,
    importData,
    refetch: () => generateReport(),
  };
};