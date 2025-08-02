import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCartCheckout as CheckoutIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useSallaCart } from '../../hooks/useSallaCart';
import { useSallaOrders } from '../../hooks/useSallaOrders';
import { FlexBox } from '../../components/flex-box';
import { H1, H2, H3, H6 } from '../../components/Typography';
import { formatPrice } from '../../services/salla/utils';
import { SallaCartItem } from '../../services/salla/types';

interface CartItemComponentProps {
  item: SallaCartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  loading?: boolean;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
  loading = false
}) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 999) {
      setQuantity(newQuantity);
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleDirectQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value) || 1;
    handleQuantityChange(newQuantity);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={3} alignItems="center">
          {/* Product Image */}
          <Grid item xs={12} sm={3}>
            <Box
              component="img"
              src={item.product.image || '/placeholder-product.jpg'}
              alt={item.product.name}
              sx={{
                width: '100%',
                height: 120,
                objectFit: 'cover',
                borderRadius: 1
              }}
            />
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} sm={4}>
            <H6 mb={1}>{item.product.name}</H6>
            <Typography variant="body2" color="text.secondary" mb={1}>
              SKU: {item.product.sku}
            </Typography>
            {item.variant && (
              <Chip
                label={item.variant.name}
                size="small"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            )}
            <Typography variant="body2" color="primary.main" fontWeight="bold">
              {formatPrice(item.price)} each
            </Typography>
          </Grid>

          {/* Quantity Controls */}
          <Grid item xs={12} sm={3}>
            <FlexBox alignItems="center" gap={1}>
              <IconButton
                size="small"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || loading}
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                size="small"
                value={quantity}
                onChange={handleDirectQuantityChange}
                inputProps={{
                  min: 1,
                  max: 999,
                  style: { textAlign: 'center', width: 60 }
                }}
                disabled={loading}
              />
              <IconButton
                size="small"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={loading}
              >
                <AddIcon />
              </IconButton>
            </FlexBox>
          </Grid>

          {/* Total Price and Actions */}
          <Grid item xs={12} sm={2}>
            <FlexBox direction="column" alignItems="flex-end" gap={1}>
              <Typography variant="h6" color="primary.main">
                {formatPrice(item.total)}
              </Typography>
              <IconButton
                color="error"
                onClick={() => onRemoveItem(item.id)}
                disabled={loading}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </FlexBox>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const CartPage: React.FC = () => {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Hooks
  const {
    cart,
    loading: cartLoading,
    error: cartError,
    updateCartItem,
    removeCartItem,
    applyCoupon,
    removeCoupon,
    clearCart,
    fetchCart
  } = useSallaCart();

  const {
    createCheckoutSession,
    loading: checkoutLoading,
    error: checkoutError
  } = useSallaOrders();

  // Initialize cart data
  useEffect(() => {
    fetchCart();
  }, []);

  // Handle quantity update
  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateCartItem(itemId, { quantity });
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeCartItem(itemId);
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  };

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      await applyCoupon(couponCode);
      setAppliedCoupon(couponCode);
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      setAppliedCoupon(null);
    } catch (error) {
      console.error('Error removing coupon:', error);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    try {
      const checkoutSession = await createCheckoutSession({
        cart_id: cart.id,
        return_url: `${window.location.origin}/order-confirmation`,
        cancel_url: `${window.location.origin}/cart`
      });

      // Redirect to checkout
      if (checkoutSession.checkout_url) {
        window.location.href = checkoutSession.checkout_url;
      } else {
        router.push('/checkout');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  // Loading state
  if (cartLoading && !cart) {
    return (
      <Container sx={{ py: 6 }}>
        <FlexBox justifyContent="center">
          <CircularProgress size={60} />
        </FlexBox>
      </Container>
    );
  }

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <Container sx={{ py: 6 }}>
        <Box textAlign="center">
          <Typography variant="h4" mb={2}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Add some products to get started
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/products')}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <FlexBox alignItems="center" gap={2} mb={4}>
        <IconButton onClick={() => router.back()}>
          <BackIcon />
        </IconButton>
        <H1>Shopping Cart</H1>
        <Typography variant="body2" color="text.secondary">
          ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
        </Typography>
      </FlexBox>

      {/* Error Alert */}
      {(cartError || checkoutError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {cartError || checkoutError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item md={8} xs={12}>
          <Box mb={3}>
            <FlexBox justifyContent="space-between" alignItems="center" mb={2}>
              <H3>Cart Items</H3>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleClearCart}
                disabled={cartLoading}
              >
                Clear Cart
              </Button>
            </FlexBox>

            {cart.items.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                loading={cartLoading}
              />
            ))}
          </Box>

          {/* Coupon Section */}
          <Card>
            <CardContent>
              <H6 mb={2}>Coupon Code</H6>
              {appliedCoupon ? (
                <FlexBox alignItems="center" gap={2}>
                  <Chip
                    label={`Coupon: ${appliedCoupon}`}
                    color="success"
                    onDelete={handleRemoveCoupon}
                  />
                </FlexBox>
              ) : (
                <FlexBox gap={2}>
                  <TextField
                    size="small"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || cartLoading}
                  >
                    Apply
                  </Button>
                </FlexBox>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item md={4} xs={12}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <H3 mb={3}>Order Summary</H3>

              {/* Subtotal */}
              <FlexBox justifyContent="space-between" mb={2}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">
                  {formatPrice(cart.subtotal)}
                </Typography>
              </FlexBox>

              {/* Discount */}
              {cart.discount > 0 && (
                <FlexBox justifyContent="space-between" mb={2}>
                  <Typography variant="body1" color="success.main">
                    Discount:
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    -{formatPrice(cart.discount)}
                  </Typography>
                </FlexBox>
              )}

              {/* Tax */}
              {cart.tax > 0 && (
                <FlexBox justifyContent="space-between" mb={2}>
                  <Typography variant="body1">Tax:</Typography>
                  <Typography variant="body1">
                    {formatPrice(cart.tax)}
                  </Typography>
                </FlexBox>
              )}

              {/* Shipping */}
              {cart.shipping > 0 && (
                <FlexBox justifyContent="space-between" mb={2}>
                  <Typography variant="body1">Shipping:</Typography>
                  <Typography variant="body1">
                    {formatPrice(cart.shipping)}
                  </Typography>
                </FlexBox>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Total */}
              <FlexBox justifyContent="space-between" mb={3}>
                <H2>Total:</H2>
                <H2 color="primary.main">
                  {formatPrice(cart.total)}
                </H2>
              </FlexBox>

              {/* Checkout Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<CheckoutIcon />}
                onClick={handleCheckout}
                disabled={checkoutLoading || cart.items.length === 0}
                sx={{ mb: 2 }}
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </Button>

              {/* Continue Shopping */}
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => router.push('/products')}
              >
                Continue Shopping
              </Button>

              {/* Security Notice */}
              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
                display="block"
                mt={2}
              >
                🔒 Secure checkout powered by Salla
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recommended Products */}
      <Box mt={6}>
        <H3 mb={3}>You might also like</H3>
        <Typography variant="body1" color="text.secondary">
          Recommended products functionality will be implemented in the next phase.
        </Typography>
      </Box>
    </Container>
  );
};

export default CartPage;