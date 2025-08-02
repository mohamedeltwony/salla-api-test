// Salla API Search Service

import { sallaApi } from './client';
import { SallaApiResponse, SallaPagination } from './types';

// Search Interfaces
export interface SallaSearchQuery {
  query: string;
  filters?: SallaSearchFilters;
  sort?: SallaSearchSort;
  pagination?: {
    page?: number;
    per_page?: number;
  };
}

export interface SallaSearchFilters {
  category_id?: string;
  brand_id?: string;
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
  on_sale?: boolean;
  rating_min?: number;
  tags?: string[];
  attributes?: Record<string, any>;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
}

export interface SallaSearchSort {
  field: 'relevance' | 'price' | 'name' | 'created_at' | 'rating' | 'popularity' | 'sales';
  direction: 'asc' | 'desc';
}

export interface SallaSearchResult {
  id: string;
  type: 'product' | 'category' | 'brand' | 'page' | 'blog_post';
  title: string;
  description?: string;
  url: string;
  image?: string;
  price?: {
    amount: number;
    currency: string;
    sale_price?: number;
  };
  rating?: {
    average: number;
    count: number;
  };
  availability?: {
    in_stock: boolean;
    quantity?: number;
  };
  category?: {
    id: string;
    name: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  tags?: string[];
  attributes?: Record<string, any>;
  relevance_score?: number;
  created_at: string;
  updated_at: string;
}

export interface SallaSearchResponse {
  results: SallaSearchResult[];
  total_results: number;
  search_time: number;
  suggestions?: string[];
  facets?: SallaSearchFacets;
  pagination: SallaPagination;
}

export interface SallaSearchFacets {
  categories?: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  brands?: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  price_ranges?: Array<{
    min: number;
    max: number;
    count: number;
  }>;
  ratings?: Array<{
    rating: number;
    count: number;
  }>;
  attributes?: Record<string, Array<{
    value: string;
    count: number;
  }>>;
}

export interface SallaSearchSuggestion {
  query: string;
  type: 'product' | 'category' | 'brand' | 'general';
  popularity: number;
}

export interface SallaSearchHistory {
  id: string;
  user_id?: string;
  query: string;
  results_count: number;
  clicked_result_id?: string;
  search_time: number;
  created_at: string;
}

export interface SallaPopularSearch {
  query: string;
  search_count: number;
  result_count: number;
  conversion_rate: number;
  period: string;
}

export interface SallaSearchAnalytics {
  total_searches: number;
  unique_searches: number;
  average_results_per_search: number;
  zero_result_searches: number;
  top_queries: SallaPopularSearch[];
  search_trends: Array<{
    date: string;
    search_count: number;
    unique_queries: number;
  }>;
  conversion_metrics: {
    search_to_view: number;
    search_to_cart: number;
    search_to_purchase: number;
  };
}

export interface SallaAutoCompleteResponse {
  suggestions: Array<{
    text: string;
    type: 'query' | 'product' | 'category' | 'brand';
    highlight?: string;
    metadata?: Record<string, any>;
  }>;
  products?: Array<{
    id: string;
    name: string;
    image?: string;
    price: number;
    currency: string;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    product_count: number;
  }>;
}

// Search Service Class
class SallaSearchService {
  // General Search
  async search(searchQuery: SallaSearchQuery): Promise<SallaApiResponse<SallaSearchResponse>> {
    const params = new URLSearchParams();
    
    params.append('q', searchQuery.query);
    
    if (searchQuery.filters) {
      Object.entries(searchQuery.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else if (typeof value === 'object' && key === 'location') {
            Object.entries(value).forEach(([locKey, locValue]) => {
              params.append(`location[${locKey}]`, locValue.toString());
            });
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    if (searchQuery.sort) {
      params.append('sort', searchQuery.sort.field);
      params.append('order', searchQuery.sort.direction);
    }
    
    if (searchQuery.pagination) {
      if (searchQuery.pagination.page) {
        params.append('page', searchQuery.pagination.page.toString());
      }
      if (searchQuery.pagination.per_page) {
        params.append('per_page', searchQuery.pagination.per_page.toString());
      }
    }
    
    return sallaApi.get(`/search?${params.toString()}`);
  }

  // Product Search
  async searchProducts(
    query: string,
    filters?: SallaSearchFilters,
    sort?: SallaSearchSort,
    page = 1,
    perPage = 20
  ): Promise<SallaApiResponse<SallaSearchResponse>> {
    return this.search({
      query,
      filters: { ...filters, type: 'product' },
      sort,
      pagination: { page, per_page: perPage }
    });
  }

  // Category Search
  async searchCategories(
    query: string,
    page = 1,
    perPage = 20
  ): Promise<SallaApiResponse<SallaSearchResponse>> {
    return this.search({
      query,
      filters: { type: 'category' },
      pagination: { page, per_page: perPage }
    });
  }

  // Brand Search
  async searchBrands(
    query: string,
    page = 1,
    perPage = 20
  ): Promise<SallaApiResponse<SallaSearchResponse>> {
    return this.search({
      query,
      filters: { type: 'brand' },
      pagination: { page, per_page: perPage }
    });
  }

  // Auto-complete
  async autoComplete(
    query: string,
    limit = 10
  ): Promise<SallaApiResponse<SallaAutoCompleteResponse>> {
    return sallaApi.get('/search/autocomplete', {
      params: { q: query, limit }
    });
  }

  // Search Suggestions
  async getSearchSuggestions(
    query: string,
    limit = 5
  ): Promise<SallaApiResponse<SallaSearchSuggestion[]>> {
    return sallaApi.get('/search/suggestions', {
      params: { q: query, limit }
    });
  }

  // Popular Searches
  async getPopularSearches(
    period: 'day' | 'week' | 'month' | 'year' = 'week',
    limit = 10
  ): Promise<SallaApiResponse<SallaPopularSearch[]>> {
    return sallaApi.get('/search/popular', {
      params: { period, limit }
    });
  }

  // Search History
  async getSearchHistory(
    userId?: string,
    page = 1,
    perPage = 20
  ): Promise<SallaApiResponse<{ data: SallaSearchHistory[]; pagination: SallaPagination }>> {
    const params: any = { page, per_page: perPage };
    if (userId) {
      params.user_id = userId;
    }
    
    return sallaApi.get('/search/history', { params });
  }

  // Clear Search History
  async clearSearchHistory(userId?: string): Promise<SallaApiResponse<{ success: boolean }>> {
    const data: any = {};
    if (userId) {
      data.user_id = userId;
    }
    
    return sallaApi.delete('/search/history', { data });
  }

  // Save Search
  async saveSearch(
    query: string,
    resultsCount: number,
    clickedResultId?: string
  ): Promise<SallaApiResponse<SallaSearchHistory>> {
    return sallaApi.post('/search/history', {
      query,
      results_count: resultsCount,
      clicked_result_id: clickedResultId
    });
  }

  // Search Analytics
  async getSearchAnalytics(
    dateRange?: {
      start_date: string;
      end_date: string;
    }
  ): Promise<SallaApiResponse<SallaSearchAnalytics>> {
    return sallaApi.get('/search/analytics', {
      params: dateRange
    });
  }

  // Advanced Search
  async advancedSearch(params: {
    query?: string;
    category_ids?: string[];
    brand_ids?: string[];
    price_range?: { min: number; max: number };
    attributes?: Record<string, any>;
    in_stock?: boolean;
    on_sale?: boolean;
    rating_min?: number;
    tags?: string[];
    sort?: SallaSearchSort;
    page?: number;
    per_page?: number;
  }): Promise<SallaApiResponse<SallaSearchResponse>> {
    return sallaApi.post('/search/advanced', params);
  }

  // Visual Search (if supported)
  async visualSearch(
    imageFile: File | string,
    filters?: SallaSearchFilters
  ): Promise<SallaApiResponse<SallaSearchResponse>> {
    const formData = new FormData();
    
    if (typeof imageFile === 'string') {
      formData.append('image_url', imageFile);
    } else {
      formData.append('image', imageFile);
    }
    
    if (filters) {
      formData.append('filters', JSON.stringify(filters));
    }
    
    return sallaApi.post('/search/visual', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Voice Search (if supported)
  async voiceSearch(
    audioFile: File,
    filters?: SallaSearchFilters
  ): Promise<SallaApiResponse<SallaSearchResponse>> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    if (filters) {
      formData.append('filters', JSON.stringify(filters));
    }
    
    return sallaApi.post('/search/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Search Filters
  async getAvailableFilters(
    query?: string
  ): Promise<SallaApiResponse<SallaSearchFacets>> {
    return sallaApi.get('/search/filters', {
      params: query ? { q: query } : {}
    });
  }

  // Trending Searches
  async getTrendingSearches(
    period: 'hour' | 'day' | 'week' = 'day',
    limit = 10
  ): Promise<SallaApiResponse<Array<{ query: string; trend_score: number }>>> {
    return sallaApi.get('/search/trending', {
      params: { period, limit }
    });
  }

  // Search Performance
  async getSearchPerformance(
    query: string,
    dateRange?: {
      start_date: string;
      end_date: string;
    }
  ): Promise<SallaApiResponse<{
    query: string;
    search_count: number;
    click_through_rate: number;
    conversion_rate: number;
    average_position: number;
    zero_results_rate: number;
  }>> {
    return sallaApi.get('/search/performance', {
      params: {
        q: query,
        ...dateRange
      }
    });
  }

  // Similar Products
  async getSimilarProducts(
    productId: string,
    limit = 10
  ): Promise<SallaApiResponse<SallaSearchResult[]>> {
    return sallaApi.get(`/search/similar/${productId}`, {
      params: { limit }
    });
  }

  // Search by Barcode
  async searchByBarcode(
    barcode: string
  ): Promise<SallaApiResponse<SallaSearchResult[]>> {
    return sallaApi.get('/search/barcode', {
      params: { barcode }
    });
  }

  // Search Export
  async exportSearchResults(
    searchQuery: SallaSearchQuery,
    format: 'csv' | 'excel' | 'json' = 'csv'
  ): Promise<SallaApiResponse<{ download_url: string; expires_at: string }>> {
    return sallaApi.post('/search/export', {
      ...searchQuery,
      format
    });
  }

  // Saved Searches
  async getSavedSearches(
    userId?: string
  ): Promise<SallaApiResponse<Array<{
    id: string;
    name: string;
    query: SallaSearchQuery;
    created_at: string;
    last_used_at?: string;
  }>>> {
    return sallaApi.get('/search/saved', {
      params: userId ? { user_id: userId } : {}
    });
  }

  async saveSearchQuery(
    name: string,
    searchQuery: SallaSearchQuery,
    userId?: string
  ): Promise<SallaApiResponse<{ id: string; success: boolean }>> {
    return sallaApi.post('/search/saved', {
      name,
      query: searchQuery,
      user_id: userId
    });
  }

  async deleteSavedSearch(
    searchId: string
  ): Promise<SallaApiResponse<{ success: boolean }>> {
    return sallaApi.delete(`/search/saved/${searchId}`);
  }

  // Search Alerts
  async createSearchAlert(
    query: string,
    filters?: SallaSearchFilters,
    alertSettings?: {
      email?: boolean;
      push?: boolean;
      frequency?: 'immediate' | 'daily' | 'weekly';
    }
  ): Promise<SallaApiResponse<{ id: string; success: boolean }>> {
    return sallaApi.post('/search/alerts', {
      query,
      filters,
      settings: alertSettings
    });
  }

  async getSearchAlerts(
    userId?: string
  ): Promise<SallaApiResponse<Array<{
    id: string;
    query: string;
    filters?: SallaSearchFilters;
    settings: any;
    active: boolean;
    created_at: string;
  }>>> {
    return sallaApi.get('/search/alerts', {
      params: userId ? { user_id: userId } : {}
    });
  }

  async updateSearchAlert(
    alertId: string,
    updates: {
      query?: string;
      filters?: SallaSearchFilters;
      settings?: any;
      active?: boolean;
    }
  ): Promise<SallaApiResponse<{ success: boolean }>> {
    return sallaApi.put(`/search/alerts/${alertId}`, updates);
  }

  async deleteSearchAlert(
    alertId: string
  ): Promise<SallaApiResponse<{ success: boolean }>> {
    return sallaApi.delete(`/search/alerts/${alertId}`);
  }
}

// Export service instance
export const sallaSearchService = new SallaSearchService();
export default sallaSearchService;