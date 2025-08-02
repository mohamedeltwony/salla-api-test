// Salla API Utility Functions

import {
  SallaProduct,
  SallaCategory,
  SallaCart,
  SallaCartItem,
  SallaOrder,
  SallaCustomer,
  SallaImage,
  SallaPrice,
} from './types';

// Import existing Bazaar types
import { Product } from '../../models/Product.model';
import { Category } from '../../models/Category.model';
import { Order } from '../../models/Order.model';
import { User } from '../../models/User.model';

/**
 * Transform Salla Product to Bazaar Product format
 */
export function transformSallaProductToBazaar(sallaProduct: SallaProduct): Product {
  return {
    id: sallaProduct.id,
    title: sallaProduct.name,
    price: sallaProduct.price.amount,
    sale_price: sallaProduct.price.sale_price || undefined,
    discount: sallaProduct.price.sale_price 
      ? Math.round(((sallaProduct.price.amount - sallaProduct.price.sale_price) / sallaProduct.price.amount) * 100)
      : 0,
    thumbnail: sallaProduct.images.find(img => img.is_main)?.url || sallaProduct.images[0]?.url || '',
    images: sallaProduct.images.map(img => img.url),
    categories: sallaProduct.categories.map(cat => cat.name),
    colors: [], // Will be populated from variants if available
    sizes: [], // Will be populated from variants if available
    brand: sallaProduct.brand?.name || '',
    rating: sallaProduct.rating.average,
    reviews: sallaProduct.rating.count,
    availability: sallaProduct.is_available,
    stock: sallaProduct.stock_quantity,
    sku: sallaProduct.sku,
    tags: sallaProduct.tags,
    description: sallaProduct.description,
    slug: generateSlug(sallaProduct.name),
    shop: {
      name: 'Salla Store',
      slug: 'salla-store',
      phone: '',
      email: '',
      address: '',
      rating: 5,
      cover: '',
    },
  };
}

/**
 * Transform Salla Category to Bazaar Category format
 */
export function transformSallaCategoryToBazaar(sallaCategory: SallaCategory): Category {
  return {
    id: sallaCategory.id,
    name: sallaCategory.name,
    slug: generateSlug(sallaCategory.name),
    image: sallaCategory.image?.url || '',
    icon: '', // Will need to be mapped based on category
    children: sallaCategory.children?.map(child => transformSallaCategoryToBazaar(child)) || [],
    parent: sallaCategory.parent_id || null,
    featured: false, // Will need business logic to determine
    menuComponent: 'MegaMenu1', // Default component
    menuData: {
      categories: sallaCategory.children?.map(child => ({
        title: child.name,
        href: `/products?category=${child.id}`,
        menuComponent: 'MegaMenu1',
        menuData: {
          categories: [],
          rightImage: {
            imgUrl: child.image?.url || '',
            href: `/products?category=${child.id}`,
          },
        },
      })) || [],
      rightImage: {
        imgUrl: sallaCategory.image?.url || '',
        href: `/products?category=${sallaCategory.id}`,
      },
    },
  };
}

/**
 * Transform Salla Cart to Bazaar Cart format
 */
export function transformSallaCartToBazaar(sallaCart: SallaCart) {
  return {
    cartList: sallaCart.items.map(item => ({
      id: item.id,
      name: item.product.name,
      price: item.price.amount,
      imgUrl: item.product.images.find(img => img.is_main)?.url || item.product.images[0]?.url || '',
      qty: item.quantity,
      slug: generateSlug(item.product.name),
    })),
    total: sallaCart.totals.total.amount,
    subtotal: sallaCart.totals.subtotal.amount,
    tax: sallaCart.totals.tax.amount,
    shipping: sallaCart.totals.shipping.amount,
    discount: sallaCart.totals.discount.amount,
  };
}

/**
 * Transform Salla Order to Bazaar Order format
 */
export function transformSallaOrderToBazaar(sallaOrder: SallaOrder): Order {
  return {
    id: sallaOrder.id,
    orderNo: sallaOrder.order_number,
    status: sallaOrder.status.name,
    purchaseDate: sallaOrder.created_at,
    price: sallaOrder.totals.total.amount,
    items: sallaOrder.items.map(item => ({
      id: item.id,
      name: item.product.name,
      price: item.price.amount,
      quantity: item.quantity,
      image: item.product.images.find(img => img.is_main)?.url || item.product.images[0]?.url || '',
    })),
    shippingAddress: {
      name: `${sallaOrder.shipping_address.first_name} ${sallaOrder.shipping_address.last_name}`,
      phone: sallaOrder.shipping_address.phone || '',
      email: sallaOrder.customer.email,
      address: `${sallaOrder.shipping_address.address_line_1}, ${sallaOrder.shipping_address.city}, ${sallaOrder.shipping_address.state} ${sallaOrder.shipping_address.postal_code}`,
      country: sallaOrder.shipping_address.country,
    },
    paymentMethod: sallaOrder.payment_method,
    shippingMethod: sallaOrder.shipping_method,
  };
}

/**
 * Transform Salla Customer to Bazaar User format
 */
export function transformSallaCustomerToBazaar(sallaCustomer: SallaCustomer): User {
  return {
    id: sallaCustomer.id,
    name: {
      firstName: sallaCustomer.first_name,
      lastName: sallaCustomer.last_name,
    },
    email: sallaCustomer.email,
    phone: sallaCustomer.phone || '',
    avatar: sallaCustomer.avatar || '',
    dateOfBirth: sallaCustomer.date_of_birth || '',
    gender: sallaCustomer.gender || '',
    addresses: sallaCustomer.addresses.map(address => ({
      id: address.id,
      title: address.type,
      name: `${address.first_name} ${address.last_name}`,
      phone: address.phone || '',
      address1: address.address_line_1,
      address2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      zip: address.postal_code,
      country: address.country,
      isDefault: address.is_default,
    })),
  };
}

/**
 * Generate URL-friendly slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Format price with currency
 */
export function formatPrice(price: SallaPrice): string {
  return price.formatted || `${price.amount} ${price.currency}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
  if (!salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Get main product image
 */
export function getMainProductImage(images: SallaImage[]): string {
  const mainImage = images.find(img => img.is_main);
  return mainImage?.url || images[0]?.url || '';
}

/**
 * Check if product is on sale
 */
export function isProductOnSale(price: SallaPrice): boolean {
  return !!(price.sale_price && price.sale_price < price.amount);
}

/**
 * Get product availability status
 */
export function getProductAvailabilityStatus(product: SallaProduct): {
  available: boolean;
  status: 'in_stock' | 'out_of_stock' | 'low_stock';
  message: string;
} {
  if (!product.is_available || product.stock_quantity <= 0) {
    return {
      available: false,
      status: 'out_of_stock',
      message: 'Out of Stock',
    };
  }
  
  if (product.stock_quantity <= 5) {
    return {
      available: true,
      status: 'low_stock',
      message: `Only ${product.stock_quantity} left in stock`,
    };
  }
  
  return {
    available: true,
    status: 'in_stock',
    message: 'In Stock',
  };
}

/**
 * Validate Salla API response
 */
export function validateSallaResponse<T>(response: any): response is { success: boolean; data: T } {
  return response && typeof response.success === 'boolean' && response.data !== undefined;
}

/**
 * Handle Salla API errors
 */
export function handleSallaError(error: any): string {
  if (error.message) {
    return error.message;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Build search query parameters
 */
export function buildSearchParams(filters: {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  const params: Record<string, any> = {};
  
  if (filters.query) params.query = filters.query;
  if (filters.category) params.category_id = filters.category;
  if (filters.minPrice) params.min_price = filters.minPrice;
  if (filters.maxPrice) params.max_price = filters.maxPrice;
  if (filters.sortBy) params.sort_by = filters.sortBy;
  if (filters.sortOrder) params.sort_order = filters.sortOrder;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.per_page = filters.limit;
  
  return params;
}