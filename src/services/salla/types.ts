// Salla API TypeScript Interfaces

export interface SallaApiResponse<T = any> {
  status: number;
  success: boolean;
  data: T;
  pagination?: SallaPagination;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

export interface SallaPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Product Types
export interface SallaProduct {
  id: string;
  name: string;
  description: string;
  price: SallaPrice;
  images: SallaImage[];
  categories: SallaCategory[];
  brand?: SallaBrand;
  sku: string;
  stock_quantity: number;
  is_available: boolean;
  weight?: number;
  dimensions?: SallaDimensions;
  variants?: SallaProductVariant[];
  tags: string[];
  rating: SallaRating;
  created_at: string;
  updated_at: string;
}

export interface SallaPrice {
  amount: number;
  currency: string;
  formatted: string;
  sale_price?: number;
  sale_formatted?: string;
}

export interface SallaImage {
  id: string;
  url: string;
  alt: string;
  is_main: boolean;
  sort_order: number;
}

export interface SallaDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface SallaProductVariant {
  id: string;
  name: string;
  price: SallaPrice;
  sku: string;
  stock_quantity: number;
  attributes: SallaVariantAttribute[];
}

export interface SallaVariantAttribute {
  name: string;
  value: string;
}

export interface SallaRating {
  average: number;
  count: number;
}

// Category Types
export interface SallaCategory {
  id: string;
  name: string;
  description?: string;
  image?: SallaImage;
  parent_id?: string;
  children?: SallaCategory[];
  products_count: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Brand Types
export interface SallaBrand {
  id: string;
  name: string;
  logo?: SallaImage;
  description?: string;
  website?: string;
}

// Cart Types
export interface SallaCart {
  id: string;
  items: SallaCartItem[];
  totals: SallaCartTotals;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface SallaCartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: SallaPrice;
  total: SallaPrice;
  product: SallaProduct;
}

export interface SallaCartTotals {
  subtotal: SallaPrice;
  tax: SallaPrice;
  shipping: SallaPrice;
  discount: SallaPrice;
  total: SallaPrice;
}

// Order Types
export interface SallaOrder {
  id: string;
  order_number: string;
  status: SallaOrderStatus;
  items: SallaOrderItem[];
  totals: SallaCartTotals;
  customer: SallaCustomer;
  shipping_address: SallaAddress;
  billing_address: SallaAddress;
  payment_method: string;
  shipping_method: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SallaOrderItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: SallaPrice;
  total: SallaPrice;
  product: SallaProduct;
}

export interface SallaOrderStatus {
  key: string;
  name: string;
  color: string;
}

// User Types
export interface SallaCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  addresses: SallaAddress[];
  created_at: string;
  updated_at: string;
}

export interface SallaAddress {
  id: string;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

// Authentication Types
export interface SallaAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

// Search Types
export interface SallaSearchParams {
  query?: string;
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'name' | 'price' | 'created_at' | 'popularity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Wishlist Types
export interface SallaWishlist {
  id: string;
  items: SallaWishlistItem[];
  created_at: string;
  updated_at: string;
}

export interface SallaWishlistItem {
  id: string;
  product_id: string;
  product: SallaProduct;
  added_at: string;
}

// Error Types
export interface SallaApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}