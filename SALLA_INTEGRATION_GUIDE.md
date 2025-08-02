# Salla API Integration Guide for Bazaar Template

This guide provides comprehensive instructions for integrating Salla API services into the existing Bazaar Next.js template.

## Table of Contents

1. [Setup and Configuration](#setup-and-configuration)
2. [Core Services Overview](#core-services-overview)
3. [Integration Steps](#integration-steps)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Setup and Configuration

### 1. Environment Variables

Ensure your `.env.local` file contains all required Salla API credentials:

```env
# Salla API Configuration
SALLA_API_BASE_URL=https://api.salla.dev/admin/v2
SALLA_CLIENT_ID=your_client_id
SALLA_CLIENT_SECRET=your_client_secret
SALLA_ACCESS_TOKEN=your_access_token
SALLA_WEBHOOK_SECRET=your_webhook_secret

# Application Settings
NEXT_PUBLIC_APP_NAME=Bazaar Store
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Dependencies

The integration uses existing dependencies in the Bazaar template. Ensure these are installed:

```bash
npm install axios react react-dom next
```

## Core Services Overview

### Available Services

1. **Authentication Service** (`src/services/salla/auth.ts`)
   - User login, registration, logout
   - Token management
   - Password reset and email verification
   - Two-factor authentication

2. **Product Service** (`src/services/salla/client.ts`)
   - Product CRUD operations
   - Product search and filtering
   - Category management
   - Brand management

3. **Cart Service** (`src/services/salla/client.ts`)
   - Shopping cart management
   - Add/remove items
   - Apply coupons and discounts

4. **Order Service** (`src/services/salla/orders.ts`)
   - Order creation and management
   - Checkout process
   - Payment integration
   - Order tracking

5. **User Service** (`src/services/salla/users.ts`)
   - User profile management
   - Address management
   - Wishlist functionality
   - User preferences

6. **Search Service** (`src/services/salla/search.ts`)
   - Advanced search functionality
   - Auto-complete
   - Search analytics
   - Visual and voice search

7. **Inventory Service** (`src/services/salla/inventory.ts`)
   - Stock management
   - Inventory tracking
   - Low stock alerts

8. **Notifications Service** (`src/services/salla/notifications.ts`)
   - Push notifications
   - Email notifications
   - Webhook management

9. **Analytics Service** (`src/services/salla/analytics.ts`)
   - Sales analytics
   - Customer analytics
   - Performance metrics

## Integration Steps

### Step 1: Wrap Your App with Salla Context

Update your `pages/_app.tsx` or main app component:

```tsx
import { SallaProvider } from '../src/contexts/SallaContext';
import { AppProvider } from '../src/contexts/AppContext';

function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <SallaProvider>
        <Component {...pageProps} />
      </SallaProvider>
    </AppProvider>
  );
}

export default MyApp;
```

### Step 2: Replace Product Data Sources

Update your product pages to use Salla data:

```tsx
// Before (using static data)
import { products } from '../data/products';

// After (using Salla API)
import { useSallaProducts } from '../hooks/useSallaProducts';

function ProductsPage() {
  const { products, loading, error, fetchProducts } = useSallaProducts();
  
  useEffect(() => {
    fetchProducts({ page: 1, per_page: 20 });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Step 3: Integrate Shopping Cart

Update cart functionality to use Salla cart:

```tsx
import { useSallaCart } from '../hooks/useSallaCart';

function CartPage() {
  const {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useSallaCart();
  
  const handleAddToCart = async (productId: string, quantity: number) => {
    await addToCart(productId, quantity);
  };
  
  return (
    <div>
      {cart?.items?.map(item => (
        <CartItem 
          key={item.id} 
          item={item}
          onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
          onRemove={() => removeFromCart(item.id)}
        />
      ))}
    </div>
  );
}
```

### Step 4: Implement Authentication

Replace authentication with Salla auth:

```tsx
import { useSallaAuth } from '../hooks/useSallaAuth';

function LoginPage() {
  const { login, loading, error, user } = useSallaAuth();
  
  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      handleLogin(
        formData.get('email') as string,
        formData.get('password') as string
      );
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### Step 5: Add Search Functionality

Implement advanced search:

```tsx
import { useSallaSearch, useSallaAutoComplete } from '../hooks/useSallaSearch';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const { searchProducts, searchResults, loading } = useSallaSearch();
  const { suggestions, getAutoComplete } = useSallaAutoComplete();
  
  const handleSearch = async () => {
    await searchProducts(query, {
      category_id: selectedCategory,
      price_min: minPrice,
      price_max: maxPrice
    });
  };
  
  const handleInputChange = (value: string) => {
    setQuery(value);
    getAutoComplete(value);
  };
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Search products..."
      />
      {suggestions && (
        <div className="suggestions">
          {suggestions.products?.map(product => (
            <div key={product.id}>{product.name}</div>
          ))}
        </div>
      )}
      <button onClick={handleSearch}>Search</button>
      
      {searchResults && (
        <div className="results">
          {searchResults.results?.map(result => (
            <ProductCard key={result.id} product={result} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 6: Implement Order Management

Add checkout and order tracking:

```tsx
import { useSallaCheckout, useSallaOrders } from '../hooks/useSallaOrders';

function CheckoutPage() {
  const {
    createCheckoutSession,
    processPayment,
    loading,
    error
  } = useSallaCheckout();
  
  const handleCheckout = async (orderData: any) => {
    const session = await createCheckoutSession(orderData);
    if (session) {
      const payment = await processPayment(session.id, {
        payment_method: 'credit_card',
        payment_details: {
          // Payment details
        }
      });
      
      if (payment.success) {
        router.push(`/orders/${payment.order_id}`);
      }
    }
  };
  
  return (
    <div>
      {/* Checkout form */}
      <button onClick={() => handleCheckout(orderData)} disabled={loading}>
        {loading ? 'Processing...' : 'Complete Order'}
      </button>
    </div>
  );
}
```

## Usage Examples

### Product Listing with Filters

```tsx
function ProductListingPage() {
  const { products, loading, fetchProducts } = useSallaProducts();
  const { categories } = useSallaCategories();
  const [filters, setFilters] = useState({
    category_id: '',
    price_min: 0,
    price_max: 1000,
    brand_id: ''
  });
  
  useEffect(() => {
    fetchProducts({
      page: 1,
      per_page: 20,
      filters
    });
  }, [filters]);
  
  return (
    <div className="product-listing">
      <div className="filters">
        <select 
          value={filters.category_id}
          onChange={(e) => setFilters({...filters, category_id: e.target.value})}
        >
          <option value="">All Categories</option>
          {categories?.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        
        <input 
          type="range"
          min="0"
          max="1000"
          value={filters.price_max}
          onChange={(e) => setFilters({...filters, price_max: parseInt(e.target.value)})}
        />
      </div>
      
      <div className="products-grid">
        {products?.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### User Dashboard

```tsx
function UserDashboard() {
  const { user } = useSallaAuth();
  const { orders } = useSallaUserOrders(user?.id);
  const { wishlist } = useSallaUserWishlist(user?.id);
  const { addresses } = useSallaUserAddresses(user?.id);
  
  return (
    <div className="dashboard">
      <div className="user-info">
        <h2>Welcome, {user?.name}</h2>
        <p>Email: {user?.email}</p>
      </div>
      
      <div className="dashboard-sections">
        <section>
          <h3>Recent Orders</h3>
          {orders?.slice(0, 5).map(order => (
            <OrderSummary key={order.id} order={order} />
          ))}
        </section>
        
        <section>
          <h3>Wishlist</h3>
          {wishlist?.items?.map(item => (
            <WishlistItem key={item.id} item={item} />
          ))}
        </section>
        
        <section>
          <h3>Addresses</h3>
          {addresses?.map(address => (
            <AddressCard key={address.id} address={address} />
          ))}
        </section>
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```tsx
function ProductPage({ productId }) {
  const { product, loading, error, fetchProduct } = useSallaProduct();
  
  useEffect(() => {
    fetchProduct(productId);
  }, [productId]);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <NotFound />;
  
  return <ProductDetails product={product} />;
}
```

### 2. Loading States

Provide clear loading indicators:

```tsx
function CartButton({ productId, quantity }) {
  const { addToCart, loading } = useSallaCart();
  
  return (
    <button 
      onClick={() => addToCart(productId, quantity)}
      disabled={loading}
      className={loading ? 'loading' : ''}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          Adding...
        </>
      ) : (
        'Add to Cart'
      )}
    </button>
  );
}
```

### 3. Data Caching

Use React Query or SWR for better caching:

```tsx
import { useQuery } from 'react-query';
import { sallaApi } from '../services/salla';

function useProducts(filters) {
  return useQuery(
    ['products', filters],
    () => sallaApi.getProducts(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}
```

### 4. Type Safety

Always use TypeScript interfaces:

```tsx
import { SallaProduct, SallaCart } from '../services/salla/types';

interface ProductCardProps {
  product: SallaProduct;
  onAddToCart?: (productId: string, quantity: number) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Component implementation
}
```

### 5. Environment-Specific Configuration

Use different configurations for different environments:

```tsx
const config = {
  development: {
    apiUrl: 'https://api.salla.dev/admin/v2',
    debug: true
  },
  production: {
    apiUrl: 'https://api.salla.com/admin/v2',
    debug: false
  }
};

export const sallaConfig = config[process.env.NODE_ENV] || config.development;
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API credentials in `.env.local`
   - Check token expiration
   - Ensure proper OAuth flow

2. **CORS Issues**
   - Configure Salla app settings
   - Add your domain to allowed origins

3. **Rate Limiting**
   - Implement request throttling
   - Use caching to reduce API calls

4. **Data Transformation Errors**
   - Check utility functions in `src/services/salla/utils.ts`
   - Verify data structure compatibility

### Debug Mode

Enable debug mode for detailed logging:

```tsx
// In your environment variables
NEXT_PUBLIC_SALLA_DEBUG=true

// In your code
if (process.env.NEXT_PUBLIC_SALLA_DEBUG) {
  console.log('Salla API Request:', requestData);
  console.log('Salla API Response:', responseData);
}
```

### Testing

Test your integration:

```tsx
// Test API connection
import { sallaApi } from '../services/salla';

async function testConnection() {
  try {
    const response = await sallaApi.getProducts({ page: 1, per_page: 1 });
    console.log('Connection successful:', response);
  } catch (error) {
    console.error('Connection failed:', error);
  }
}
```

## Migration Checklist

- [ ] Environment variables configured
- [ ] Salla context provider added to app
- [ ] Product pages updated to use Salla data
- [ ] Cart functionality migrated
- [ ] Authentication system replaced
- [ ] Search functionality implemented
- [ ] Order management added
- [ ] User dashboard updated
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Testing completed
- [ ] Production deployment configured

## Support

For additional support:

1. Check Salla API documentation: https://docs.salla.dev/
2. Review the integration plan: `SALLA_INTEGRATION_PLAN.md`
3. Examine the service implementations in `src/services/salla/`
4. Test with the provided hooks in `src/hooks/`

This integration provides a complete e-commerce solution using Salla API while maintaining the existing Bazaar template's design and user experience.