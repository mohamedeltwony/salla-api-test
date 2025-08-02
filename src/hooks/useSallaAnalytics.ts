// React Hooks for Salla Analytics and Reporting

import { useState, useEffect, useCallback } from 'react';
import {
  SallaAnalyticsOverview,
  SallaSalesAnalytics,
  SallaProductAnalytics,
  SallaCustomerAnalytics,
  SallaTrafficAnalytics,
  SallaInventoryAnalytics,
  SallaFinancialReport,
  SallaMarketingAnalytics,
  SallaCustomReport,
  AnalyticsDateRange,
  AnalyticsFilters,
  ReportSearchParams,
  sallaAnalyticsService,
} from '../services/salla/analytics';

// Base hook interface
interface BaseAnalyticsHook<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Overview Analytics Hook
export const useSallaOverviewAnalytics = (dateRange?: AnalyticsDateRange) => {
  const [data, setData] = useState<SallaAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getOverview(dateRange);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overview analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    data,
    loading,
    error,
    refetch: fetchOverview,
  };
};

// Sales Analytics Hook
export const useSallaSalesAnalytics = (
  dateRange?: AnalyticsDateRange,
  filters?: AnalyticsFilters
) => {
  const [data, setData] = useState<SallaSalesAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getSalesAnalytics(dateRange, filters);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange, filters]);

  const getSalesByPeriod = useCallback(async (
    period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getSalesByPeriod(period, dateRange);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales by period');
      return null;
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchSalesAnalytics();
  }, [fetchSalesAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchSalesAnalytics,
    getSalesByPeriod,
  };
};

// Product Analytics Hook
export const useSallaProductAnalytics = (
  productId?: string,
  dateRange?: AnalyticsDateRange
) => {
  const [data, setData] = useState<SallaProductAnalytics | null>(null);
  const [topSellingProducts, setTopSellingProducts] = useState<any[] | null>(null);
  const [productPerformance, setProductPerformance] = useState<SallaProductAnalytics[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductAnalytics = useCallback(async (id?: string) => {
    if (!id && !productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getProductAnalytics(
        id || productId!,
        dateRange
      );
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product analytics');
    } finally {
      setLoading(false);
    }
  }, [productId, dateRange]);

  const fetchTopSellingProducts = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getTopSellingProducts(dateRange, limit);
      setTopSellingProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top selling products');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const fetchProductPerformance = useCallback(async (
    filters?: AnalyticsFilters,
    page = 1,
    limit = 20
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getProductPerformance(filters, page, limit);
      setProductPerformance(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product performance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (productId) {
      fetchProductAnalytics();
    }
  }, [fetchProductAnalytics]);

  return {
    data,
    topSellingProducts,
    productPerformance,
    loading,
    error,
    refetch: fetchProductAnalytics,
    fetchTopSellingProducts,
    fetchProductPerformance,
  };
};

// Customer Analytics Hook
export const useSallaCustomerAnalytics = (
  dateRange?: AnalyticsDateRange,
  filters?: AnalyticsFilters
) => {
  const [data, setData] = useState<SallaCustomerAnalytics | null>(null);
  const [segments, setSegments] = useState<any[] | null>(null);
  const [lifetimeValue, setLifetimeValue] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getCustomerAnalytics(dateRange, filters);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange, filters]);

  const fetchCustomerSegments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getCustomerSegments(dateRange);
      setSegments(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer segments');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const fetchCustomerLifetimeValue = useCallback(async (customerId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getCustomerLifetimeValue(
        customerId,
        dateRange
      );
      setLifetimeValue(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer lifetime value');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchCustomerAnalytics();
  }, [fetchCustomerAnalytics]);

  return {
    data,
    segments,
    lifetimeValue,
    loading,
    error,
    refetch: fetchCustomerAnalytics,
    fetchCustomerSegments,
    fetchCustomerLifetimeValue,
  };
};

// Traffic Analytics Hook
export const useSallaTrafficAnalytics = (dateRange?: AnalyticsDateRange) => {
  const [data, setData] = useState<SallaTrafficAnalytics | null>(null);
  const [trafficSources, setTrafficSources] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrafficAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getTrafficAnalytics(dateRange);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch traffic analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const fetchTrafficSources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getTrafficSources(dateRange);
      setTrafficSources(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch traffic sources');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchTrafficAnalytics();
  }, [fetchTrafficAnalytics]);

  return {
    data,
    trafficSources,
    loading,
    error,
    refetch: fetchTrafficAnalytics,
    fetchTrafficSources,
  };
};

// Inventory Analytics Hook
export const useSallaInventoryAnalytics = (filters?: AnalyticsFilters) => {
  const [data, setData] = useState<SallaInventoryAnalytics | null>(null);
  const [turnover, setTurnover] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventoryAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getInventoryAnalytics(filters);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory analytics');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchInventoryTurnover = useCallback(async (
    productIds?: string[],
    dateRange?: AnalyticsDateRange
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getInventoryTurnover(
        productIds,
        dateRange
      );
      setTurnover(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory turnover');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryAnalytics();
  }, [fetchInventoryAnalytics]);

  return {
    data,
    turnover,
    loading,
    error,
    refetch: fetchInventoryAnalytics,
    fetchInventoryTurnover,
  };
};

// Financial Reports Hook
export const useSallaFinancialReports = () => {
  const [financialReport, setFinancialReport] = useState<SallaFinancialReport | null>(null);
  const [profitLoss, setProfitLoss] = useState<any | null>(null);
  const [cashFlow, setCashFlow] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialReport = useCallback(async (
    dateRange: AnalyticsDateRange,
    filters?: AnalyticsFilters
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getFinancialReport(dateRange, filters);
      setFinancialReport(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch financial report');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfitLossStatement = useCallback(async (dateRange: AnalyticsDateRange) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getProfitLossStatement(dateRange);
      setProfitLoss(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profit & loss statement');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCashFlow = useCallback(async (
    dateRange: AnalyticsDateRange,
    period: 'day' | 'week' | 'month' = 'day'
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getCashFlow(dateRange, period);
      setCashFlow(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cash flow');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    financialReport,
    profitLoss,
    cashFlow,
    loading,
    error,
    fetchFinancialReport,
    fetchProfitLossStatement,
    fetchCashFlow,
  };
};

// Marketing Analytics Hook
export const useSallaMarketingAnalytics = (dateRange?: AnalyticsDateRange) => {
  const [data, setData] = useState<SallaMarketingAnalytics | null>(null);
  const [campaignPerformance, setCampaignPerformance] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketingAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getMarketingAnalytics(dateRange);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch marketing analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const fetchCampaignPerformance = useCallback(async (
    campaignId?: string,
    campaignDateRange?: AnalyticsDateRange
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getCampaignPerformance(
        campaignId,
        campaignDateRange || dateRange
      );
      setCampaignPerformance(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign performance');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchMarketingAnalytics();
  }, [fetchMarketingAnalytics]);

  return {
    data,
    campaignPerformance,
    loading,
    error,
    refetch: fetchMarketingAnalytics,
    fetchCampaignPerformance,
  };
};

// Custom Reports Hook
export const useSallaCustomReports = () => {
  const [reports, setReports] = useState<SallaCustomReport[] | null>(null);
  const [currentReport, setCurrentReport] = useState<SallaCustomReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (params?: ReportSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getCustomReports(params);
      setReports(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch custom reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReport = useCallback(async (reportId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getCustomReport(reportId);
      setCurrentReport(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch custom report');
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (
    reportData: Omit<SallaCustomReport, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.createCustomReport(reportData);
      setCurrentReport(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom report');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReport = useCallback(async (
    reportId: string,
    reportData: Partial<Omit<SallaCustomReport, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.updateCustomReport(reportId, reportData);
      setCurrentReport(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update custom report');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      setLoading(true);
      setError(null);
      await sallaAnalyticsService.deleteCustomReport(reportId);
      setReports(prev => prev ? prev.filter(r => r.id !== reportId) : null);
      if (currentReport?.id === reportId) {
        setCurrentReport(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete custom report');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentReport]);

  const generateReport = useCallback(async (
    reportId: string,
    format: 'json' | 'csv' | 'pdf' | 'excel' = 'json'
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.generateReport(reportId, format);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleReport = useCallback(async (
    reportId: string,
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      time: string;
      recipients: string[];
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      await sallaAnalyticsService.scheduleReport(reportId, schedule);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule report');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reports,
    currentReport,
    loading,
    error,
    fetchReports,
    fetchReport,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    scheduleReport,
  };
};

// Real-time Analytics Hook
export const useSallaRealTimeAnalytics = (refreshInterval = 30000) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRealTimeStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.getRealTimeStats();
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch real-time analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealTimeStats();
    
    const interval = setInterval(fetchRealTimeStats, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchRealTimeStats, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchRealTimeStats,
  };
};

// Export Data Hook
export const useSallaExportData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async (
    type: 'sales' | 'products' | 'customers' | 'orders',
    format: 'csv' | 'excel' | 'json',
    filters?: AnalyticsFilters
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.exportData(type, format, filters);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    exportData,
  };
};

// Performance Comparison Hook
export const useSallaPerformanceComparison = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const comparePerformance = useCallback(async (
    metric: 'sales' | 'orders' | 'customers' | 'revenue',
    currentPeriod: AnalyticsDateRange,
    comparisonPeriod: AnalyticsDateRange
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sallaAnalyticsService.comparePerformance(
        metric,
        currentPeriod,
        comparisonPeriod
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare performance');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    comparePerformance,
  };
};