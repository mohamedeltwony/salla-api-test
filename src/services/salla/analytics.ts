// Salla Analytics and Reporting API Service

import { SallaApiClient } from './client';
import { SallaApiResponse, SallaPagination } from './types';

// Analytics Interfaces
export interface SallaAnalyticsOverview {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  average_order_value: number;
  conversion_rate: number;
  revenue_growth: number;
  order_growth: number;
  customer_growth: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface SallaSalesAnalytics {
  period: string;
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  refunds: number;
  net_sales: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  sales_by_day: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  sales_by_hour: Array<{
    hour: number;
    sales: number;
    orders: number;
  }>;
  top_selling_products: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
}

export interface SallaProductAnalytics {
  product_id: string;
  product_name: string;
  total_views: number;
  total_sales: number;
  quantity_sold: number;
  revenue: number;
  conversion_rate: number;
  average_rating: number;
  reviews_count: number;
  inventory_level: number;
  reorder_point: number;
  views_by_day: Array<{
    date: string;
    views: number;
  }>;
  sales_by_day: Array<{
    date: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface SallaCustomerAnalytics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_lifetime_value: number;
  average_order_frequency: number;
  churn_rate: number;
  acquisition_channels: Array<{
    channel: string;
    customers: number;
    percentage: number;
  }>;
  customer_segments: Array<{
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  geographic_distribution: Array<{
    country: string;
    city: string;
    customers: number;
    revenue: number;
  }>;
}

export interface SallaTrafficAnalytics {
  total_sessions: number;
  unique_visitors: number;
  page_views: number;
  bounce_rate: number;
  average_session_duration: number;
  traffic_sources: Array<{
    source: string;
    sessions: number;
    percentage: number;
  }>;
  device_breakdown: Array<{
    device_type: string;
    sessions: number;
    percentage: number;
  }>;
  browser_breakdown: Array<{
    browser: string;
    sessions: number;
    percentage: number;
  }>;
  popular_pages: Array<{
    page: string;
    views: number;
    unique_views: number;
  }>;
}

export interface SallaInventoryAnalytics {
  total_products: number;
  in_stock_products: number;
  out_of_stock_products: number;
  low_stock_products: number;
  total_inventory_value: number;
  inventory_turnover: number;
  slow_moving_products: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    days_in_stock: number;
  }>;
  fast_moving_products: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    turnover_rate: number;
  }>;
  stock_alerts: Array<{
    product_id: string;
    product_name: string;
    current_stock: number;
    reorder_point: number;
    status: 'low' | 'out_of_stock';
  }>;
}

export interface SallaFinancialReport {
  period: {
    start_date: string;
    end_date: string;
  };
  revenue: {
    gross_revenue: number;
    net_revenue: number;
    refunds: number;
    taxes: number;
    shipping: number;
    discounts: number;
  };
  costs: {
    cost_of_goods_sold: number;
    shipping_costs: number;
    payment_fees: number;
    platform_fees: number;
    marketing_costs: number;
  };
  profit: {
    gross_profit: number;
    net_profit: number;
    profit_margin: number;
  };
  cash_flow: Array<{
    date: string;
    inflow: number;
    outflow: number;
    net_flow: number;
  }>;
}

export interface SallaMarketingAnalytics {
  campaigns: Array<{
    campaign_id: string;
    campaign_name: string;
    type: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    cost: number;
    roi: number;
    ctr: number;
    conversion_rate: number;
  }>;
  email_marketing: {
    emails_sent: number;
    emails_opened: number;
    emails_clicked: number;
    unsubscribes: number;
    open_rate: number;
    click_rate: number;
  };
  social_media: {
    followers: number;
    engagement_rate: number;
    reach: number;
    clicks: number;
    conversions: number;
  };
  referrals: Array<{
    source: string;
    visits: number;
    conversions: number;
    revenue: number;
  }>;
}

export interface SallaCustomReport {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'products' | 'customers' | 'inventory' | 'financial' | 'marketing';
  filters: Record<string, any>;
  metrics: string[];
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    recipients: string[];
  };
  created_at: string;
  updated_at: string;
}

// Search and Filter Interfaces
export interface AnalyticsDateRange {
  start_date: string;
  end_date: string;
}

export interface AnalyticsFilters {
  date_range?: AnalyticsDateRange;
  product_ids?: string[];
  category_ids?: string[];
  customer_segments?: string[];
  countries?: string[];
  cities?: string[];
  channels?: string[];
  payment_methods?: string[];
}

export interface ReportSearchParams {
  type?: string;
  status?: string;
  created_after?: string;
  created_before?: string;
  page?: number;
  limit?: number;
}

// Analytics API Service Class
export class SallaAnalyticsService {
  constructor(private apiClient: SallaApiClient) {}

  // Overview Analytics
  async getOverview(
    dateRange?: AnalyticsDateRange
  ): Promise<SallaApiResponse<SallaAnalyticsOverview>> {
    const params = dateRange ? {
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    } : {};

    return this.apiClient.get('/analytics/overview', { params });
  }

  // Sales Analytics
  async getSalesAnalytics(
    dateRange?: AnalyticsDateRange,
    filters?: AnalyticsFilters
  ): Promise<SallaApiResponse<SallaSalesAnalytics>> {
    const params = {
      ...dateRange,
      ...filters,
    };

    return this.apiClient.get('/analytics/sales', { params });
  }

  async getSalesByPeriod(
    period: 'day' | 'week' | 'month' | 'quarter' | 'year',
    dateRange?: AnalyticsDateRange
  ): Promise<SallaApiResponse<Array<{ period: string; sales: number; orders: number }>>> {
    const params = {
      period,
      ...dateRange,
    };

    return this.apiClient.get('/analytics/sales/by-period', { params });
  }

  // Product Analytics
  async getProductAnalytics(
    productId: string,
    dateRange?: AnalyticsDateRange
  ): Promise<SallaApiResponse<SallaProductAnalytics>> {
    const params = dateRange || {};
    return this.apiClient.get(`/analytics/products/${productId}`, { params });
  }

  async getTopSellingProducts(
    dateRange?: AnalyticsDateRange,
    limit = 10
  ): Promise<SallaApiResponse<Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>>> {
    const params = {
      limit,
      ...dateRange,
    };

    return this.apiClient.get('/analytics/products/top-selling', { params });
  }

  async getProductPerformance(
    filters?: AnalyticsFilters,
    page = 1,
    limit = 20
  ): Promise<SallaApiResponse<SallaProductAnalytics[]>> {
    const params = {
      page,
      limit,
      ...filters,
    };

    return this.apiClient.get('/analytics/products/performance', { params });
  }

  // Customer Analytics
  async getCustomerAnalytics(
    dateRange?: AnalyticsDateRange,
    filters?: AnalyticsFilters
  ): Promise<SallaApiResponse<SallaCustomerAnalytics>> {
    const params = {
      ...dateRange,
      ...filters,
    };

    return this.apiClient.get('/analytics/customers', { params });
  }

  async getCustomerSegments(
    dateRange?: AnalyticsDateRange
  ): Promise<SallaApiResponse<Array<{
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
  }>>> {
    const params = dateRange || {};
    return this.apiClient.get('/analytics/customers/segments', { params });
  }

  async getCustomerLifetimeValue(
    customerId?: string,
    dateRange?: AnalyticsDateRange
  ): Promise<SallaApiResponse<{
    customer_id?: string;
    lifetime_value: number;
    total_orders: number;
    average_order_value: number;
    first_order_date: string;
    last_order_date: string;
  }>> {
    const params = {
      customer_id: customerId,
      ...dateRange,
    };

    return this.apiClient.get('/analytics/customers/lifetime-value', { params });
  }

  // Traffic Analytics
  async getTrafficAnalytics(
    dateRange?: AnalyticsDateRange
  ): Promise<SallaApiResponse<SallaTrafficAnalytics>> {
    const params = dateRange || {};
    return this.apiClient.get('/analytics/traffic', { params });
  }

  async getTrafficSources(
    dateRange?: AnalyticsDateRange
  ): Promise<SallaApiResponse<Array<{
    source: string;
    sessions: number;
    conversions: number;
    revenue: number;
  }>>> {
    const params = dateRange || {};
    return this.apiClient.get('/analytics/traffic/sources', { params });
  }

  // Inventory Analytics
  async getInventoryAnalytics(
    filters?: AnalyticsFilters
  ): Promise<SallaApiResponse<SallaInventoryAnalytics>> {
    const params = filters || {};
    return this.apiClient.get('/analytics/inventory', { params });
  }

  async getInventoryTurnover(
    productIds?: string[],
    dateRange?: AnalyticsDateRange
  ): Promise<SallaApiResponse<Array<{
    product_id: string;
    product_name: string;
    turnover_rate: number;
    days_to_sell: number;
  }>>> {
    const params = {
      product_ids: productIds,
      ...dateRange,
    };

    return this.apiClient.get('/analytics/inventory/turnover', { params });
  }

  // Financial Reports
  async getFinancialReport(
    dateRange: AnalyticsDateRange,
    filters?: AnalyticsFilters
  ): Promise<SallaApiResponse<SallaFinancialReport>> {
    const params = {
      ...dateRange,
      ...filters,
    };

    return this.apiClient.get('/analytics/financial', { params });
  }

  async getProfitLossStatement(
    dateRange: AnalyticsDateRange
  ): Promise<SallaApiResponse<{
    revenue: number;
    cost_of_goods_sold: number;
    gross_profit: number;
    operating_expenses: number;
    net_profit: number;
    profit_margin: number;
  }>> {
    return this.apiClient.get('/analytics/financial/profit-loss', {
      params: dateRange,
    });
  }

  async getCashFlow(
    dateRange: AnalyticsDateRange,
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<SallaApiResponse<Array<{
    date: string;
    inflow: number;
    outflow: number;
    net_flow: number;
  }>>> {
    const params = {
      ...dateRange,
      period,
    };

    return this.apiClient.get('/analytics/financial/cash-flow', { params });
  }

  // Marketing Analytics
  async getMarketingAnalytics(
    dateRange?: AnalyticsDateRange
  ): Promise<SallaApiResponse<SallaMarketingAnalytics>> {
    const params = dateRange || {};
    return this.apiClient.get('/analytics/marketing', { params });
  }

  async getCampaignPerformance(
    campaignId?: string,
    dateRange?: AnalyticsDateRange
  ): Promise<SallaApiResponse<{
    campaign_id: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    cost: number;
    roi: number;
  }>> {
    const params = {
      campaign_id: campaignId,
      ...dateRange,
    };

    return this.apiClient.get('/analytics/marketing/campaigns', { params });
  }

  // Custom Reports
  async getCustomReports(
    params?: ReportSearchParams
  ): Promise<SallaApiResponse<SallaCustomReport[]>> {
    return this.apiClient.get('/analytics/reports', { params });
  }

  async getCustomReport(
    reportId: string
  ): Promise<SallaApiResponse<SallaCustomReport>> {
    return this.apiClient.get(`/analytics/reports/${reportId}`);
  }

  async createCustomReport(
    reportData: Omit<SallaCustomReport, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SallaApiResponse<SallaCustomReport>> {
    return this.apiClient.post('/analytics/reports', reportData);
  }

  async updateCustomReport(
    reportId: string,
    reportData: Partial<Omit<SallaCustomReport, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<SallaApiResponse<SallaCustomReport>> {
    return this.apiClient.put(`/analytics/reports/${reportId}`, reportData);
  }

  async deleteCustomReport(
    reportId: string
  ): Promise<SallaApiResponse<void>> {
    return this.apiClient.delete(`/analytics/reports/${reportId}`);
  }

  async generateReport(
    reportId: string,
    format: 'json' | 'csv' | 'pdf' | 'excel' = 'json'
  ): Promise<SallaApiResponse<any>> {
    return this.apiClient.get(`/analytics/reports/${reportId}/generate`, {
      params: { format },
    });
  }

  async scheduleReport(
    reportId: string,
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      time: string;
      recipients: string[];
    }
  ): Promise<SallaApiResponse<void>> {
    return this.apiClient.post(`/analytics/reports/${reportId}/schedule`, schedule);
  }

  // Export Data
  async exportData(
    type: 'sales' | 'products' | 'customers' | 'orders',
    format: 'csv' | 'excel' | 'json',
    filters?: AnalyticsFilters
  ): Promise<SallaApiResponse<{ download_url: string; expires_at: string }>> {
    const params = {
      type,
      format,
      ...filters,
    };

    return this.apiClient.post('/analytics/export', params);
  }

  // Real-time Analytics
  async getRealTimeStats(): Promise<SallaApiResponse<{
    active_visitors: number;
    current_sales: number;
    orders_today: number;
    revenue_today: number;
    top_products_today: Array<{
      product_id: string;
      product_name: string;
      sales: number;
    }>;
  }>> {
    return this.apiClient.get('/analytics/real-time');
  }

  // Comparison Analytics
  async comparePerformance(
    metric: 'sales' | 'orders' | 'customers' | 'revenue',
    currentPeriod: AnalyticsDateRange,
    comparisonPeriod: AnalyticsDateRange
  ): Promise<SallaApiResponse<{
    current: number;
    comparison: number;
    change: number;
    change_percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    return this.apiClient.post('/analytics/compare', {
      metric,
      current_period: currentPeriod,
      comparison_period: comparisonPeriod,
    });
  }
}

// Create service instance
export const sallaAnalyticsService = new SallaAnalyticsService(
  new SallaApiClient()
);