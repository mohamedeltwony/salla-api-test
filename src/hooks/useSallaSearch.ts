// React Hooks for Salla Search Functionality

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SallaSearchQuery,
  SallaSearchFilters,
  SallaSearchSort,
  SallaSearchResult,
  SallaSearchResponse,
  SallaSearchSuggestion,
  SallaSearchHistory,
  SallaPopularSearch,
  SallaSearchAnalytics,
  SallaAutoCompleteResponse,
  sallaSearchService,
} from '../services/salla/search';

// Base search hook interface
interface BaseSearchHook<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Main Search Hook
export const useSallaSearch = () => {
  const [searchResults, setSearchResults] = useState<SallaSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const search = useCallback(async (searchQuery: SallaSearchQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.search(searchQuery);
      setSearchResults(response.data);
      
      // Save to search history
      if (searchQuery.query && !searchHistory.includes(searchQuery.query)) {
        setSearchHistory(prev => [searchQuery.query, ...prev.slice(0, 9)]); // Keep last 10 searches
      }
      
      // Save search to backend
      await sallaSearchService.saveSearch(
        searchQuery.query,
        response.data.total_results
      );
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [searchHistory]);

  const searchProducts = useCallback(async (
    query: string,
    filters?: SallaSearchFilters,
    sort?: SallaSearchSort,
    page = 1,
    perPage = 20
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.searchProducts(
        query,
        filters,
        sort,
        page,
        perPage
      );
      setSearchResults(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product search failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCategories = useCallback(async (
    query: string,
    page = 1,
    perPage = 20
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.searchCategories(query, page, perPage);
      setSearchResults(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Category search failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchBrands = useCallback(async (
    query: string,
    page = 1,
    perPage = 20
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.searchBrands(query, page, perPage);
      setSearchResults(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Brand search failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const advancedSearch = useCallback(async (params: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.advancedSearch(params);
      setSearchResults(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Advanced search failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults(null);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchHistory,
    search,
    searchProducts,
    searchCategories,
    searchBrands,
    advancedSearch,
    clearResults,
    clearHistory,
  };
};

// Auto-complete Hook
export const useSallaAutoComplete = (debounceMs = 300) => {
  const [suggestions, setSuggestions] = useState<SallaAutoCompleteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const getAutoComplete = useCallback(async (
    query: string,
    limit = 10
  ) => {
    if (!query.trim()) {
      setSuggestions(null);
      return;
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await sallaSearchService.autoComplete(query, limit);
        setSuggestions(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auto-complete failed');
      } finally {
        setLoading(false);
      }
    }, debounceMs);
  }, [debounceMs]);

  const clearSuggestions = useCallback(() => {
    setSuggestions(null);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    error,
    getAutoComplete,
    clearSuggestions,
  };
};

// Search Suggestions Hook
export const useSallaSearchSuggestions = () => {
  const [suggestions, setSuggestions] = useState<SallaSearchSuggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (
    query: string,
    limit = 5
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.getSearchSuggestions(query, limit);
      setSuggestions(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    getSuggestions,
  };
};

// Popular Searches Hook
export const useSallaPopularSearches = () => {
  const [popularSearches, setPopularSearches] = useState<SallaPopularSearch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularSearches = useCallback(async (
    period: 'day' | 'week' | 'month' | 'year' = 'week',
    limit = 10
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.getPopularSearches(period, limit);
      setPopularSearches(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch popular searches');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopularSearches();
  }, [fetchPopularSearches]);

  return {
    popularSearches,
    loading,
    error,
    refetch: fetchPopularSearches,
  };
};

// Search History Hook
export const useSallaSearchHistory = (userId?: string) => {
  const [searchHistory, setSearchHistory] = useState<SallaSearchHistory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchSearchHistory = useCallback(async (
    page = 1,
    perPage = 20
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.getSearchHistory(userId, page, perPage);
      setSearchHistory(response.data.data);
      setPagination(response.data.pagination);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch search history');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const clearHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await sallaSearchService.clearSearchHistory(userId);
      setSearchHistory([]);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear search history');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSearchHistory();
  }, [fetchSearchHistory]);

  return {
    searchHistory,
    pagination,
    loading,
    error,
    refetch: fetchSearchHistory,
    clearHistory,
  };
};

// Search Analytics Hook
export const useSallaSearchAnalytics = () => {
  const [analytics, setAnalytics] = useState<SallaSearchAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (
    dateRange?: {
      start_date: string;
      end_date: string;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.getSearchAnalytics(dateRange);
      setAnalytics(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch search analytics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSearchPerformance = useCallback(async (
    query: string,
    dateRange?: {
      start_date: string;
      end_date: string;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.getSearchPerformance(query, dateRange);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch search performance');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    getSearchPerformance,
  };
};

// Visual Search Hook
export const useSallaVisualSearch = () => {
  const [results, setResults] = useState<SallaSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visualSearch = useCallback(async (
    imageFile: File | string,
    filters?: SallaSearchFilters
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.visualSearch(imageFile, filters);
      setResults(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Visual search failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    visualSearch,
  };
};

// Voice Search Hook
export const useSallaVoiceSearch = () => {
  const [results, setResults] = useState<SallaSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(async (
    filters?: SallaSearchFilters
  ): Promise<SallaSearchResponse | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioFile = new File([audioBlob], 'voice-search.wav', { type: 'audio/wav' });
          
          const response = await sallaSearchService.voiceSearch(audioFile, filters);
          setResults(response.data);
          
          resolve(response.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Voice search failed');
          resolve(null);
        } finally {
          setLoading(false);
          setIsRecording(false);
        }
      };
      
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    results,
    loading,
    error,
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};

// Saved Searches Hook
export const useSallaSavedSearches = (userId?: string) => {
  const [savedSearches, setSavedSearches] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedSearches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.getSavedSearches(userId);
      setSavedSearches(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved searches');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveSearch = useCallback(async (
    name: string,
    searchQuery: SallaSearchQuery
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.saveSearchQuery(name, searchQuery, userId);
      
      // Refresh saved searches
      await fetchSavedSearches();
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save search');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchSavedSearches]);

  const deleteSearch = useCallback(async (searchId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await sallaSearchService.deleteSavedSearch(searchId);
      
      // Remove from local state
      setSavedSearches(prev => 
        prev ? prev.filter(search => search.id !== searchId) : null
      );
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete saved search');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  return {
    savedSearches,
    loading,
    error,
    refetch: fetchSavedSearches,
    saveSearch,
    deleteSearch,
  };
};

// Search Alerts Hook
export const useSallaSearchAlerts = (userId?: string) => {
  const [alerts, setAlerts] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.getSearchAlerts(userId);
      setAlerts(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch search alerts');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createAlert = useCallback(async (
    query: string,
    filters?: SallaSearchFilters,
    alertSettings?: any
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.createSearchAlert(
        query,
        filters,
        alertSettings
      );
      
      // Refresh alerts
      await fetchAlerts();
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create search alert');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAlerts]);

  const updateAlert = useCallback(async (
    alertId: string,
    updates: any
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      await sallaSearchService.updateSearchAlert(alertId, updates);
      
      // Refresh alerts
      await fetchAlerts();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update search alert');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAlerts]);

  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await sallaSearchService.deleteSearchAlert(alertId);
      
      // Remove from local state
      setAlerts(prev => 
        prev ? prev.filter(alert => alert.id !== alertId) : null
      );
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete search alert');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
  };
};

// Similar Products Hook
export const useSallaSimilarProducts = () => {
  const [similarProducts, setSimilarProducts] = useState<SallaSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilarProducts = useCallback(async (
    productId: string,
    limit = 10
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.getSimilarProducts(productId, limit);
      setSimilarProducts(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch similar products');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    similarProducts,
    loading,
    error,
    fetchSimilarProducts,
  };
};

// Trending Searches Hook
export const useSallaTrendingSearches = () => {
  const [trendingSearches, setTrendingSearches] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingSearches = useCallback(async (
    period: 'hour' | 'day' | 'week' = 'day',
    limit = 10
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sallaSearchService.getTrendingSearches(period, limit);
      setTrendingSearches(response.data);
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trending searches');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingSearches();
  }, [fetchTrendingSearches]);

  return {
    trendingSearches,
    loading,
    error,
    refetch: fetchTrendingSearches,
  };
};