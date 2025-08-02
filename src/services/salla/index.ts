// Salla API Service - Main Export

export { SallaApiClient, sallaApi } from './client';
export { SALLA_CONFIG, API_ENDPOINTS, HTTP_STATUS } from './config';
export * from './types';
export * from './utils';

// Re-export commonly used functions for convenience
export {
  transformSallaProductToBazaar,
  transformSallaCategoryToBazaar,
  transformSallaCartToBazaar,
  transformSallaOrderToBazaar,
  transformSallaCustomerToBazaar,
  generateSlug,
  formatPrice,
  calculateDiscountPercentage,
  getMainProductImage,
  isProductOnSale,
  getProductAvailabilityStatus,
  validateSallaResponse,
  handleSallaError,
  buildSearchParams,
} from './utils';