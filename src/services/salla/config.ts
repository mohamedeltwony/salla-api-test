// Salla API Configuration

export const SALLA_CONFIG = {
  baseURL: process.env.SALLA_API_BASE_URL || 'https://api.salla.dev/admin/v2',
  clientId: process.env.SALLA_CLIENT_ID || '',
  clientSecret: process.env.SALLA_CLIENT_SECRET || '',
  accessToken: process.env.SALLA_ACCESS_TOKEN || '',
  webhookSecret: process.env.SALLA_WEBHOOK_SECRET || '',
  version: 'v2',
  timeout: 10000,
};

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    token: '/oauth2/token',
    refresh: '/oauth2/token/refresh',
  },
  
  // Products
  products: {
    list: '/products',
    details: (id: string) => `/products/${id}`,
    search: '/products/search',
    categories: '/categories',
  },
  
  // Categories
  categories: {
    list: '/categories',
    details: (id: string) => `/categories/${id}`,
    products: (id: string) => `/categories/${id}/products`,
  },
  
  // Cart
  cart: {
    get: '/cart',
    add: '/cart/products',
    update: (id: string) => `/cart/products/${id}`,
    remove: (id: string) => `/cart/products/${id}`,
    clear: '/cart/clear',
  },
  
  // Orders
  orders: {
    list: '/orders',
    details: (id: string) => `/orders/${id}`,
    create: '/orders',
    update: (id: string) => `/orders/${id}`,
    cancel: (id: string) => `/orders/${id}/cancel`,
  },
  
  // Users
  users: {
    profile: '/user/profile',
    addresses: '/user/addresses',
    orders: '/user/orders',
    wishlist: '/user/wishlist',
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;