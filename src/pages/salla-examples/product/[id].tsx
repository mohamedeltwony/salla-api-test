import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Chip,
  Rating,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useSallaProducts } from '../../../hooks/useSallaProducts';
import { useSallaCart } from '../../../hooks/useSallaCart';
import { useSallaUser } from '../../../hooks/useSallaUser';
import { ProductImageGallery } from '../../../components/products/ProductImageGallery';
import { FlexBox } from '../../../components/flex-box';
import { H1, H2, H3, H6 } from '../../../components/Typography';
import { SallaProduct } from '../../../services/salla/types';
import { transformSallaProduct, formatPrice } from '../../../services/salla/utils';

interface ProductDetailPageProps {
  productId: string;
  initialProduct?: SallaProduct;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  initialProduct
}) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Hooks
  const {
    product,
    loading: productLoading,
    error: productError,
    fetchProduct
  } = useSallaProducts();

  const {
    addToCart,
    loading: cartLoading,
    error: cartError
  } = useSallaCart();

  const {
    addToWishlist,
    removeFromWishlist,
    checkWishlistItem,
    loading: wishlistLoading
  } = useSallaUserWishlist();

  // Get current product data
  const currentProduct = product || initialProduct;
  const bazaarProduct = currentProduct ? transformSallaProduct(currentProduct) : null;

  // Initialize product data
  useEffect(() => {
    if (productId && !initialProduct) {
      fetchProduct(productId);
    }
  }, [productId]);

  // Check if product is in wishlist
  useEffect(() => {
    if (currentProduct?.id) {
      checkWishlistItem(currentProduct.id).then(setIsWishlisted);
    }
  }, [currentProduct?.id]);

  // Handle quantity change
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (currentProduct?.quantity || 999)) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!currentProduct) return;

    try {
      await addToCart({
        product_id: currentProduct.id,
        quantity,
        variant_id: selectedVariant || undefined,
        options: {} // Add any selected options here
      });
      
      // Show success message or redirect
      router.push('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!currentProduct) return;

    try {
      if (isWishlisted) {
        await removeFromWishlist(currentProduct.id);
        setIsWishlisted(false);
      } else {
        await addToWishlist(currentProduct.id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share && currentProduct) {
      try {
        await navigator.share({
          title: currentProduct.name,
          text: currentProduct.description,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  // Loading state
  if (productLoading) {
    return (
      <Container sx={{ py: 6 }}>
        <FlexBox justifyContent="center">
          <CircularProgress size={60} />
        </FlexBox>
      </Container>
    );
  }

  // Error state
  if (productError || !currentProduct) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">
          {productError || 'Product not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item md={6} xs={12}>
          <ProductImageGallery
            images={currentProduct.images || []}
            title={currentProduct.name}
          />
        </Grid>

        {/* Product Info */}
        <Grid item md={6} xs={12}>
          <Box>
            {/* Breadcrumb */}
            <Typography variant="body2" color="text.secondary" mb={2}>
              Home / {currentProduct.category?.name} / {currentProduct.name}
            </Typography>

            {/* Product Title */}
            <H1 mb={2}>{currentProduct.name}</H1>

            {/* Rating and Reviews */}
            <FlexBox alignItems="center" gap={2} mb={2}>
              <Rating value={currentProduct.rating || 0} readOnly precision={0.5} />
              <Typography variant="body2" color="text.secondary">
                ({currentProduct.reviews_count || 0} reviews)
              </Typography>
            </FlexBox>

            {/* Price */}
            <FlexBox alignItems="center" gap={2} mb={3}>
              <H2 color="primary.main">
                {formatPrice(currentProduct.sale_price || currentProduct.price)}
              </H2>
              {currentProduct.sale_price && currentProduct.sale_price < currentProduct.price && (
                <>
                  <Typography
                    variant="h4"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {formatPrice(currentProduct.price)}
                  </Typography>
                  <Chip
                    label={`${Math.round(((currentProduct.price - currentProduct.sale_price) / currentProduct.price) * 100)}% OFF`}
                    color="error"
                    size="small"
                  />
                </>
              )}
            </FlexBox>

            {/* Stock Status */}
            <Box mb={3}>
              {currentProduct.quantity > 0 ? (
                <Chip
                  label={`${currentProduct.quantity} in stock`}
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  label="Out of stock"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Product Variants */}
            {currentProduct.variants && currentProduct.variants.length > 0 && (
              <Box mb={3}>
                <H6 mb={1}>Variants:</H6>
                <FlexBox gap={1} flexWrap="wrap">
                  {currentProduct.variants.map((variant) => (
                    <Chip
                      key={variant.id}
                      label={`${variant.name} - ${formatPrice(variant.price)}`}
                      onClick={() => setSelectedVariant(variant.id)}
                      color={selectedVariant === variant.id ? 'primary' : 'default'}
                      variant={selectedVariant === variant.id ? 'filled' : 'outlined'}
                      clickable
                    />
                  ))}
                </FlexBox>
              </Box>
            )}

            {/* Quantity Selector */}
            <Box mb={3}>
              <H6 mb={1}>Quantity:</H6>
              <FlexBox alignItems="center" gap={2}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <RemoveIcon />
                </Button>
                <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (currentProduct.quantity || 999)}
                >
                  <AddIcon />
                </Button>
              </FlexBox>
            </Box>

            {/* Action Buttons */}
            <FlexBox gap={2} mb={3}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CartIcon />}
                onClick={handleAddToCart}
                disabled={currentProduct.quantity === 0 || cartLoading}
                sx={{ flex: 1 }}
              >
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleShare}
              >
                <ShareIcon />
              </Button>
            </FlexBox>

            {/* Cart Error */}
            {cartError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {cartError}
              </Alert>
            )}

            {/* Product Tags */}
            {currentProduct.tags && currentProduct.tags.length > 0 && (
              <Box>
                <H6 mb={1}>Tags:</H6>
                <FlexBox gap={1} flexWrap="wrap">
                  {currentProduct.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </FlexBox>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box mt={6}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="product details tabs"
        >
          <Tab label="Description" />
          <Tab label="Specifications" />
          <Tab label="Reviews" />
          <Tab label="Shipping" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {currentProduct.description || 'No description available.'}
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {currentProduct.metadata && Object.keys(currentProduct.metadata).length > 0 ? (
            <Grid container spacing={2}>
              {Object.entries(currentProduct.metadata).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="body1">
                        {String(value)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No specifications available.
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="body1" color="text.secondary">
            Reviews functionality will be implemented in the next phase.
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Typography variant="body1" color="text.secondary">
            Shipping information will be implemented in the next phase.
          </Typography>
        </TabPanel>
      </Box>

      {/* Related Products */}
      <Box mt={6}>
        <H3 mb={3}>Related Products</H3>
        <Typography variant="body1" color="text.secondary">
          Related products functionality will be implemented in the next phase.
        </Typography>
      </Box>
    </Container>
  );
};

// Server-side rendering for SEO
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const productId = Array.isArray(id) ? id[0] : id;

  try {
    // You can fetch initial product data here if needed
    // const sallaApi = new SallaApiClient();
    // const productResponse = await sallaApi.getProduct(productId);

    return {
      props: {
        productId,
        // initialProduct: productResponse.data || null
      }
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      props: {
        productId,
        initialProduct: null
      }
    };
  }
};

export default ProductDetailPage;