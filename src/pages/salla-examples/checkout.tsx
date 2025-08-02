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
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Lock as LockIcon,
  CreditCard as CreditCardIcon,
  LocalShipping as ShippingIcon,
  Person as PersonIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon
} from '@mui/icons-material';
import { useSallaCart } from '../../hooks/useSallaCart';
import { useSallaOrders } from '../../hooks/useSallaOrders';
import { useSallaAuth } from '../../hooks/useSallaAuth';
import { useSallaUser } from '../../hooks/useSallaUser';
import { FlexBox } from '../../components/flex-box';
import { H1, H2, H3, H6 } from '../../components/Typography';
import { formatPrice } from '../../services/salla/utils';
import {
  SallaShippingMethod,
  SallaPaymentMethod,
  SallaAddress,
  SallaCheckoutSession
} from '../../services/salla/types';

interface CheckoutFormData {
  // Customer Information
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  
  // Shipping Address
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Billing Address
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Options
  sameAsBilling: boolean;
  saveAddress: boolean;
  subscribeNewsletter: boolean;
  
  // Selected IDs
  selectedShippingMethod: string;
  selectedPaymentMethod: string;
  
  // Notes
  orderNotes: string;
}

const steps = ['Customer Info', 'Shipping', 'Payment', 'Review'];

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'SA'
    },
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'SA'
    },
    sameAsBilling: true,
    saveAddress: false,
    subscribeNewsletter: false,
    selectedShippingMethod: '',
    selectedPaymentMethod: '',
    orderNotes: ''
  });
  
  const [shippingMethods, setShippingMethods] = useState<SallaShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<SallaPaymentMethod[]>([]);
  const [checkoutSession, setCheckoutSession] = useState<SallaCheckoutSession | null>(null);

  // Hooks
  const { cart, loading: cartLoading } = useSallaCart();
  const { user, isAuthenticated } = useSallaAuth();
  const { addresses, fetchAddresses } = useSallaUser();
  const {
    createOrder,
    getShippingMethods,
    getPaymentMethods,
    createCheckoutSession,
    loading: orderLoading,
    error: orderError
  } = useSallaOrders();

  // Initialize data
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
      // Pre-fill user data
      if (user) {
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          phone: user.phone || ''
        }));
      }
    }
    
    // Fetch shipping and payment methods
    loadShippingMethods();
    loadPaymentMethods();
  }, [isAuthenticated, user]);

  // Load shipping methods
  const loadShippingMethods = async () => {
    try {
      const methods = await getShippingMethods();
      setShippingMethods(methods);
      if (methods.length > 0) {
        setFormData(prev => ({
          ...prev,
          selectedShippingMethod: methods[0].id
        }));
      }
    } catch (error) {
      console.error('Error loading shipping methods:', error);
    }
  };

  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0) {
        setFormData(prev => ({
          ...prev,
          selectedPaymentMethod: methods[0].id
        }));
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof CheckoutFormData],
            [keys[1]]: value
          }
        };
      }
    });
  };

  // Handle address selection
  const handleAddressSelect = (address: SallaAddress, type: 'shipping' | 'billing') => {
    const addressData = {
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country
    };
    
    if (type === 'shipping') {
      setFormData(prev => ({
        ...prev,
        shippingAddress: addressData,
        ...(prev.sameAsBilling && { billingAddress: addressData })
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        billingAddress: addressData
      }));
    }
  };

  // Handle step navigation
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  // Validate current step
  const isStepValid = () => {
    switch (activeStep) {
      case 0: // Customer Info
        return formData.email && formData.firstName && formData.lastName;
      case 1: // Shipping
        return formData.shippingAddress.street && formData.shippingAddress.city && formData.selectedShippingMethod;
      case 2: // Payment
        return formData.selectedPaymentMethod;
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!cart) return;

    try {
      const orderData = {
        cart_id: cart.id,
        customer: {
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone
        },
        shipping_address: formData.shippingAddress,
        billing_address: formData.sameAsBilling ? formData.shippingAddress : formData.billingAddress,
        shipping_method_id: formData.selectedShippingMethod,
        payment_method_id: formData.selectedPaymentMethod,
        notes: formData.orderNotes,
        save_address: formData.saveAddress,
        subscribe_newsletter: formData.subscribeNewsletter
      };

      const order = await createOrder(orderData);
      
      // Redirect to order confirmation
      router.push(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  // Redirect if no cart
  if (!cart || cart.items.length === 0) {
    router.push('/cart');
    return null;
  }

  // Loading state
  if (cartLoading) {
    return (
      <Container sx={{ py: 6 }}>
        <FlexBox justifyContent="center">
          <CircularProgress size={60} />
        </FlexBox>
      </Container>
    );
  }

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card>
            <CardContent>
              <FlexBox alignItems="center" gap={1} mb={3}>
                <PersonIcon color="primary" />
                <H3>Customer Information</H3>
              </FlexBox>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.subscribeNewsletter}
                        onChange={(e) => handleFieldChange('subscribeNewsletter', e.target.checked)}
                      />
                    }
                    label="Subscribe to newsletter for updates and offers"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Box>
            {/* Shipping Address */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <FlexBox alignItems="center" gap={1} mb={3}>
                  <ShippingIcon color="primary" />
                  <H3>Shipping Address</H3>
                </FlexBox>
                
                {/* Saved Addresses */}
                {isAuthenticated && addresses.length > 0 && (
                  <Accordion sx={{ mb: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Choose from saved addresses</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {addresses.map((address) => (
                        <Card
                          key={address.id}
                          variant="outlined"
                          sx={{ mb: 2, cursor: 'pointer' }}
                          onClick={() => handleAddressSelect(address, 'shipping')}
                        >
                          <CardContent>
                            <Typography variant="body2">
                              {address.street}, {address.city}, {address.state} {address.postal_code}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                )}
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={formData.shippingAddress.street}
                      onChange={(e) => handleFieldChange('shippingAddress.street', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.shippingAddress.city}
                      onChange={(e) => handleFieldChange('shippingAddress.city', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      value={formData.shippingAddress.state}
                      onChange={(e) => handleFieldChange('shippingAddress.state', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      value={formData.shippingAddress.postalCode}
                      onChange={(e) => handleFieldChange('shippingAddress.postalCode', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={formData.shippingAddress.country}
                      onChange={(e) => handleFieldChange('shippingAddress.country', e.target.value)}
                    />
                  </Grid>
                  {isAuthenticated && (
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.saveAddress}
                            onChange={(e) => handleFieldChange('saveAddress', e.target.checked)}
                          />
                        }
                        label="Save this address for future orders"
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Shipping Methods */}
            <Card>
              <CardContent>
                <H6 mb={2}>Shipping Method</H6>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={formData.selectedShippingMethod}
                    onChange={(e) => handleFieldChange('selectedShippingMethod', e.target.value)}
                  >
                    {shippingMethods.map((method) => (
                      <FormControlLabel
                        key={method.id}
                        value={method.id}
                        control={<Radio />}
                        label={
                          <FlexBox justifyContent="space-between" width="100%">
                            <Box>
                              <Typography variant="body1">{method.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {method.description}
                              </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="bold">
                              {formatPrice(method.price)}
                            </Typography>
                          </FlexBox>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <FlexBox alignItems="center" gap={1} mb={3}>
                <CreditCardIcon color="primary" />
                <H3>Payment Method</H3>
              </FlexBox>
              
              <FormControl component="fieldset">
                <RadioGroup
                  value={formData.selectedPaymentMethod}
                  onChange={(e) => handleFieldChange('selectedPaymentMethod', e.target.value)}
                >
                  {paymentMethods.map((method) => (
                    <FormControlLabel
                      key={method.id}
                      value={method.id}
                      control={<Radio />}
                      label={
                        <FlexBox alignItems="center" gap={2}>
                          <Box
                            component="img"
                            src={method.logo || '/payment-placeholder.png'}
                            alt={method.name}
                            sx={{ width: 40, height: 24, objectFit: 'contain' }}
                          />
                          <Box>
                            <Typography variant="body1">{method.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {method.description}
                            </Typography>
                          </Box>
                        </FlexBox>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              <Box mt={3}>
                <TextField
                  fullWidth
                  label="Order Notes (Optional)"
                  multiline
                  rows={3}
                  value={formData.orderNotes}
                  onChange={(e) => handleFieldChange('orderNotes', e.target.value)}
                  placeholder="Any special instructions for your order..."
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardContent>
              <H3 mb={3}>Order Review</H3>
              
              {/* Order Summary */}
              <Box mb={3}>
                <H6 mb={2}>Order Items</H6>
                {cart.items.map((item) => (
                  <FlexBox key={item.id} justifyContent="space-between" mb={1}>
                    <Typography variant="body2">
                      {item.product.name} × {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      {formatPrice(item.total)}
                    </Typography>
                  </FlexBox>
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Customer Info */}
              <Box mb={3}>
                <H6 mb={2}>Customer Information</H6>
                <Typography variant="body2">
                  {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="body2">{formData.email}</Typography>
                {formData.phone && (
                  <Typography variant="body2">{formData.phone}</Typography>
                )}
              </Box>
              
              {/* Shipping Info */}
              <Box mb={3}>
                <H6 mb={2}>Shipping Address</H6>
                <Typography variant="body2">
                  {formData.shippingAddress.street}
                </Typography>
                <Typography variant="body2">
                  {formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.postalCode}
                </Typography>
                <Typography variant="body2">
                  {formData.shippingAddress.country}
                </Typography>
              </Box>
              
              {/* Payment Info */}
              <Box mb={3}>
                <H6 mb={2}>Payment Method</H6>
                <Typography variant="body2">
                  {paymentMethods.find(m => m.id === formData.selectedPaymentMethod)?.name}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Total */}
              <FlexBox justifyContent="space-between" mb={2}>
                <H2>Total:</H2>
                <H2 color="primary.main">{formatPrice(cart.total)}</H2>
              </FlexBox>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <FlexBox alignItems="center" gap={2} mb={4}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push('/cart')}
        >
          Back to Cart
        </Button>
        <H1>Checkout</H1>
        <FlexBox alignItems="center" gap={1} ml="auto">
          <LockIcon fontSize="small" color="success" />
          <Typography variant="body2" color="success.main">
            Secure Checkout
          </Typography>
        </FlexBox>
      </FlexBox>

      {/* Error Alert */}
      {orderError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {orderError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item md={8} xs={12}>
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation */}
          <FlexBox justifyContent="space-between" mt={3}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmitOrder}
                disabled={orderLoading || !isStepValid()}
                startIcon={orderLoading ? <CircularProgress size={20} /> : <LockIcon />}
              >
                {orderLoading ? 'Processing...' : 'Place Order'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid()}
                endIcon={<ForwardIcon />}
              >
                Next
              </Button>
            )}
          </FlexBox>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item md={4} xs={12}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <H3 mb={3}>Order Summary</H3>
              
              {/* Items */}
              {cart.items.map((item) => (
                <FlexBox key={item.id} gap={2} mb={2}>
                  <Box
                    component="img"
                    src={item.product.image || '/placeholder-product.jpg'}
                    alt={item.product.name}
                    sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                  />
                  <Box flex={1}>
                    <Typography variant="body2" noWrap>
                      {item.product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {formatPrice(item.total)}
                  </Typography>
                </FlexBox>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              {/* Totals */}
              <FlexBox justifyContent="space-between" mb={1}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">{formatPrice(cart.subtotal)}</Typography>
              </FlexBox>
              
              {cart.discount > 0 && (
                <FlexBox justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="success.main">Discount:</Typography>
                  <Typography variant="body2" color="success.main">
                    -{formatPrice(cart.discount)}
                  </Typography>
                </FlexBox>
              )}
              
              <FlexBox justifyContent="space-between" mb={1}>
                <Typography variant="body2">Shipping:</Typography>
                <Typography variant="body2">
                  {formData.selectedShippingMethod
                    ? formatPrice(shippingMethods.find(m => m.id === formData.selectedShippingMethod)?.price || 0)
                    : 'TBD'
                  }
                </Typography>
              </FlexBox>
              
              <FlexBox justifyContent="space-between" mb={1}>
                <Typography variant="body2">Tax:</Typography>
                <Typography variant="body2">{formatPrice(cart.tax)}</Typography>
              </FlexBox>
              
              <Divider sx={{ my: 2 }} />
              
              <FlexBox justifyContent="space-between">
                <H6>Total:</H6>
                <H6 color="primary.main">{formatPrice(cart.total)}</H6>
              </FlexBox>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;