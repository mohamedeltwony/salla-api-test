import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
  ShoppingBag as ShoppingIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useSallaOrders } from '../../../hooks/useSallaOrders';
import { useSallaAuth } from '../../../hooks/useSallaAuth';
import { FlexBox } from '../../../components/flex-box';
import { H1, H2, H3, H6 } from '../../../components/Typography';
import { formatPrice, formatDate } from '../../../services/salla/utils';
import { SallaOrder, SallaOrderStatus } from '../../../services/salla/types';

const OrderConfirmationPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<SallaOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);

  // Hooks
  const { getOrder, trackOrder, downloadInvoice, resendOrderEmail } = useSallaOrders();
  const { isAuthenticated } = useSallaAuth();

  // Fetch order details
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchOrderDetails(id);
    }
  }, [id]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      const orderData = await getOrder(orderId);
      setOrder(orderData);
      
      // Fetch tracking info if order is shipped
      if (orderData.status === 'shipped' || orderData.status === 'delivered') {
        const tracking = await trackOrder(orderId);
        setTrackingInfo(tracking);
      }
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle download invoice
  const handleDownloadInvoice = async () => {
    if (!order) return;
    
    try {
      await downloadInvoice(order.id);
    } catch (err) {
      console.error('Error downloading invoice:', err);
    }
  };

  // Handle resend email
  const handleResendEmail = async () => {
    if (!order) return;
    
    try {
      await resendOrderEmail(order.id);
      // Show success message
    } catch (err) {
      console.error('Error resending email:', err);
    }
  };

  // Get status color
  const getStatusColor = (status: SallaOrderStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'processing':
        return 'primary';
      case 'shipped':
        return 'secondary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'refunded':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: SallaOrderStatus) => {
    switch (status) {
      case 'pending':
        return <PaymentIcon />;
      case 'confirmed':
        return <CheckIcon />;
      case 'processing':
        return <ReceiptIcon />;
      case 'shipped':
        return <ShippingIcon />;
      case 'delivered':
        return <CheckIcon />;
      default:
        return <ReceiptIcon />;
    }
  };

  // Render order timeline
  const renderOrderTimeline = () => {
    if (!order?.timeline) return null;

    return (
      <Timeline>
        {order.timeline.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color={getStatusColor(event.status as SallaOrderStatus)}>
                {getStatusIcon(event.status as SallaOrderStatus)}
              </TimelineDot>
              {index < order.timeline!.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h6" component="span">
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(event.created_at)}
              </Typography>
              {event.description && (
                <Typography variant="body2">
                  {event.description}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Container sx={{ py: 6 }}>
        <FlexBox justifyContent="center">
          <CircularProgress size={60} />
        </FlexBox>
      </Container>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Order not found'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push('/')}
          startIcon={<HomeIcon />}
        >
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Success Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'success.light',
          color: 'success.contrastText',
          p: 4,
          borderRadius: 2,
          textAlign: 'center',
          mb: 4
        }}
      >
        <CheckIcon sx={{ fontSize: 64, mb: 2 }} />
        <H1 color="inherit">Order Confirmed!</H1>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Thank you for your order. We'll send you a confirmation email shortly.
        </Typography>
        <Typography variant="body1">
          Order Number: <strong>#{order.order_number}</strong>
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item md={8} xs={12}>
          {/* Order Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <FlexBox justifyContent="space-between" alignItems="center" mb={3}>
                <H3>Order Status</H3>
                <Chip
                  label={order.status.toUpperCase()}
                  color={getStatusColor(order.status)}
                  icon={getStatusIcon(order.status)}
                />
              </FlexBox>
              
              {/* Order Timeline */}
              {renderOrderTimeline()}
              
              {/* Tracking Information */}
              {trackingInfo && (
                <Box mt={3}>
                  <H6 mb={2}>Tracking Information</H6>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Tracking Number:</strong> {trackingInfo.tracking_number}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Carrier:</strong> {trackingInfo.carrier}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Estimated Delivery:</strong> {formatDate(trackingInfo.estimated_delivery)}
                    </Typography>
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <H3 mb={3}>Order Items</H3>
              <List>
                {order.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={item.product.image || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          sx={{ width: 80, height: 80 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <FlexBox justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="h6">
                                {item.product.name}
                              </Typography>
                              {item.variant && (
                                <Typography variant="body2" color="text.secondary">
                                  {item.variant.name}: {item.variant.value}
                                </Typography>
                              )}
                              <Typography variant="body2" color="text.secondary">
                                Quantity: {item.quantity}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="h6">
                                {formatPrice(item.total)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatPrice(item.price)} each
                              </Typography>
                            </Box>
                          </FlexBox>
                        }
                        secondary={
                          <Box mt={2}>
                            <Button
                              size="small"
                              startIcon={<StarIcon />}
                              onClick={() => router.push(`/product/${item.product.id}?review=true`)}
                            >
                              Write a Review
                            </Button>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < order.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Shipping & Billing */}
          <Grid container spacing={3}>
            <Grid item sm={6} xs={12}>
              <Card>
                <CardContent>
                  <H6 mb={2}>Shipping Address</H6>
                  <Typography variant="body2">
                    {order.shipping_address.street}
                  </Typography>
                  <Typography variant="body2">
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </Typography>
                  <Typography variant="body2">
                    {order.shipping_address.country}
                  </Typography>
                  
                  {order.shipping_method && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Shipping Method:</strong> {order.shipping_method.name}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item sm={6} xs={12}>
              <Card>
                <CardContent>
                  <H6 mb={2}>Billing Address</H6>
                  <Typography variant="body2">
                    {order.billing_address.street}
                  </Typography>
                  <Typography variant="body2">
                    {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                  </Typography>
                  <Typography variant="body2">
                    {order.billing_address.country}
                  </Typography>
                  
                  {order.payment_method && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Payment Method:</strong> {order.payment_method.name}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar */}
        <Grid item md={4} xs={12}>
          {/* Order Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <H3 mb={3}>Order Summary</H3>
              
              <FlexBox justifyContent="space-between" mb={1}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">{formatPrice(order.subtotal)}</Typography>
              </FlexBox>
              
              {order.discount > 0 && (
                <FlexBox justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="success.main">Discount:</Typography>
                  <Typography variant="body2" color="success.main">
                    -{formatPrice(order.discount)}
                  </Typography>
                </FlexBox>
              )}
              
              <FlexBox justifyContent="space-between" mb={1}>
                <Typography variant="body2">Shipping:</Typography>
                <Typography variant="body2">{formatPrice(order.shipping_cost)}</Typography>
              </FlexBox>
              
              <FlexBox justifyContent="space-between" mb={1}>
                <Typography variant="body2">Tax:</Typography>
                <Typography variant="body2">{formatPrice(order.tax)}</Typography>
              </FlexBox>
              
              <Divider sx={{ my: 2 }} />
              
              <FlexBox justifyContent="space-between">
                <H6>Total:</H6>
                <H6 color="primary.main">{formatPrice(order.total)}</H6>
              </FlexBox>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <H6 mb={2}>Order Actions</H6>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadInvoice}
                >
                  Download Invoice
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={handleResendEmail}
                >
                  Resend Email
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                >
                  Print Order
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <H6 mb={2}>What's Next?</H6>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ShoppingIcon />}
                  onClick={() => router.push('/products')}
                >
                  Continue Shopping
                </Button>
                
                {isAuthenticated && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    onClick={() => router.push('/account/orders')}
                  >
                    View All Orders
                  </Button>
                )}
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={() => router.push('/')}
                >
                  Go to Home
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderConfirmationPage;