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
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Paper,
  LinearProgress,
  IconButton,
  Badge,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Person as PersonIcon,
  ShoppingBag as OrdersIcon,
  LocationOn as AddressIcon,
  Favorite as WishlistIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  Receipt as ReceiptIcon,
  CreditCard as PaymentIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';
import { useSallaAuth } from '../../../hooks/useSallaAuth';
import { useSallaUser } from '../../../hooks/useSallaUser';
import { useSallaOrders } from '../../../hooks/useSallaOrders';
import { FlexBox } from '../../../components/flex-box';
import { H1, H2, H3, H4, H6 } from '../../../components/Typography';
import { formatPrice, formatDate } from '../../../services/salla/utils';
import { SallaUser, SallaOrder, SallaAddress } from '../../../services/salla/types';

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
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AccountDashboard: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  const [addressForm, setAddressForm] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  });

  // Hooks
  const { user, logout, isAuthenticated } = useSallaAuth();
  const {
    profile,
    addresses,
    wishlist,
    orders: userOrders,
    notifications,
    loading: userLoading,
    error: userError,
    updateProfile,
    updateAvatar,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    removeFromWishlist,
    markNotificationAsRead
  } = useSallaUser();
  const { getOrders } = useSallaOrders();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Initialize profile form
  useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      await updateProfile(profileForm);
      setEditProfileOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await updateAvatar(file);
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    }
  };

  // Handle add address
  const handleAddAddress = async () => {
    try {
      await addAddress(addressForm);
      setAddAddressOpen(false);
      setAddressForm({
        type: 'home',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false
      });
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Calculate user stats
  const userStats = {
    totalOrders: userOrders?.length || 0,
    totalSpent: userOrders?.reduce((sum, order) => sum + order.total, 0) || 0,
    wishlistItems: wishlist?.length || 0,
    unreadNotifications: notifications?.filter(n => !n.read_at).length || 0
  };

  // Loading state
  if (userLoading) {
    return (
      <Container sx={{ py: 6 }}>
        <FlexBox justifyContent="center">
          <CircularProgress size={60} />
        </FlexBox>
      </Container>
    );
  }

  // Error state
  if (userError) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {userError}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Box position="relative">
              <Avatar
                src={profile?.avatar || '/placeholder-avatar.jpg'}
                alt={profile?.first_name}
                sx={{ width: 100, height: 100 }}
              />
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
                size="small"
              >
                <CameraIcon fontSize="small" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs>
            <H2 mb={1}>
              {profile?.first_name} {profile?.last_name}
            </H2>
            <Typography variant="body1" color="text.secondary" mb={2}>
              {profile?.email}
            </Typography>
            
            {/* User Stats */}
            <Grid container spacing={3}>
              <Grid item>
                <FlexBox alignItems="center" gap={1}>
                  <OrdersIcon color="primary" />
                  <Box>
                    <Typography variant="h6">{userStats.totalOrders}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Orders
                    </Typography>
                  </Box>
                </FlexBox>
              </Grid>
              
              <Grid item>
                <FlexBox alignItems="center" gap={1}>
                  <TrendingIcon color="success" />
                  <Box>
                    <Typography variant="h6">{formatPrice(userStats.totalSpent)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Spent
                    </Typography>
                  </Box>
                </FlexBox>
              </Grid>
              
              <Grid item>
                <FlexBox alignItems="center" gap={1}>
                  <WishlistIcon color="error" />
                  <Box>
                    <Typography variant="h6">{userStats.wishlistItems}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Wishlist
                    </Typography>
                  </Box>
                </FlexBox>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditProfileOpen(true)}
            >
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation Tabs */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<OrdersIcon />} label="Orders" />
          <Tab icon={<AddressIcon />} label="Addresses" />
          <Tab icon={<WishlistIcon />} label="Wishlist" />
          <Tab
            icon={
              <Badge badgeContent={userStats.unreadNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            }
            label="Notifications"
          />
          <Tab icon={<SettingsIcon />} label="Settings" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      
      {/* Orders Tab */}
      <TabPanel value={activeTab} index={0}>
        <Card>
          <CardContent>
            <FlexBox justifyContent="space-between" alignItems="center" mb={3}>
              <H3>Recent Orders</H3>
              <Button
                variant="outlined"
                onClick={() => router.push('/account/orders')}
              >
                View All Orders
              </Button>
            </FlexBox>
            
            {userOrders && userOrders.length > 0 ? (
              <List>
                {userOrders.slice(0, 5).map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItemButton
                      onClick={() => router.push(`/order-confirmation/${order.id}`)}
                    >
                      <ListItemIcon>
                        <ReceiptIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <FlexBox justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                              Order #{order.order_number}
                            </Typography>
                            <Chip
                              label={order.status.toUpperCase()}
                              size="small"
                              color={order.status === 'delivered' ? 'success' : 'primary'}
                            />
                          </FlexBox>
                        }
                        secondary={
                          <FlexBox justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(order.created_at)} • {order.items.length} items
                            </Typography>
                            <Typography variant="h6" color="primary.main">
                              {formatPrice(order.total)}
                            </Typography>
                          </FlexBox>
                        }
                      />
                    </ListItemButton>
                    {index < Math.min(userOrders.length, 5) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                You haven't placed any orders yet.
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Addresses Tab */}
      <TabPanel value={activeTab} index={1}>
        <Card>
          <CardContent>
            <FlexBox justifyContent="space-between" alignItems="center" mb={3}>
              <H3>Saved Addresses</H3>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddAddressOpen(true)}
              >
                Add Address
              </Button>
            </FlexBox>
            
            {addresses && addresses.length > 0 ? (
              <Grid container spacing={3}>
                {addresses.map((address) => (
                  <Grid item md={6} xs={12} key={address.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <FlexBox justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box>
                            <Typography variant="h6" mb={1}>
                              {address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                              {address.is_default && (
                                <Chip label="Default" size="small" sx={{ ml: 1 }} />
                              )}
                            </Typography>
                            <Typography variant="body2">
                              {address.street}
                            </Typography>
                            <Typography variant="body2">
                              {address.city}, {address.state} {address.postal_code}
                            </Typography>
                            <Typography variant="body2">
                              {address.country}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => {
                              // Handle edit address
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </FlexBox>
                        
                        <FlexBox gap={1}>
                          {!address.is_default && (
                            <Button
                              size="small"
                              onClick={() => setDefaultAddress(address.id)}
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button
                            size="small"
                            color="error"
                            onClick={() => deleteAddress(address.id)}
                          >
                            Delete
                          </Button>
                        </FlexBox>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                No saved addresses found. Add your first address to get started.
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Wishlist Tab */}
      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <H3 mb={3}>My Wishlist</H3>
            
            {wishlist && wishlist.length > 0 ? (
              <Grid container spacing={3}>
                {wishlist.map((item) => (
                  <Grid item md={4} sm={6} xs={12} key={item.id}>
                    <Card variant="outlined">
                      <Box
                        component="img"
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover'
                        }}
                      />
                      <CardContent>
                        <Typography variant="h6" mb={1} noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="h6" color="primary.main" mb={2}>
                          {formatPrice(item.price)}
                        </Typography>
                        
                        <FlexBox gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => router.push(`/product/${item.id}`)}
                          >
                            View Product
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            Remove
                          </Button>
                        </FlexBox>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                Your wishlist is empty. Start adding products you love!
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={activeTab} index={3}>
        <Card>
          <CardContent>
            <H3 mb={3}>Notifications</H3>
            
            {notifications && notifications.length > 0 ? (
              <List>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.read_at ? 'transparent' : 'action.hover',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" mb={1}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(notification.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                      {!notification.read_at && (
                        <Button
                          size="small"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No notifications found.
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <Card>
              <CardContent>
                <H4 mb={3}>Account Settings</H4>
                
                <List>
                  <ListItemButton>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Personal Information"
                      secondary="Update your personal details"
                    />
                  </ListItemButton>
                  
                  <ListItemButton>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Security"
                      secondary="Change password and security settings"
                    />
                  </ListItemButton>
                  
                  <ListItemButton>
                    <ListItemIcon>
                      <PaymentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Payment Methods"
                      secondary="Manage your payment options"
                    />
                  </ListItemButton>
                  
                  <ListItemButton>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Notification Preferences"
                      secondary="Control how you receive notifications"
                    />
                  </ListItemButton>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item md={6} xs={12}>
            <Card>
              <CardContent>
                <H4 mb={3}>Support & Help</H4>
                
                <List>
                  <ListItemButton>
                    <ListItemIcon>
                      <HelpIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Help Center"
                      secondary="Find answers to common questions"
                    />
                  </ListItemButton>
                  
                  <ListItemButton>
                    <ListItemIcon>
                      <ReceiptIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Order History"
                      secondary="View all your past orders"
                    />
                  </ListItemButton>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Logout"
                      secondary="Sign out of your account"
                      sx={{ color: 'error.main' }}
                    />
                  </ListItemButton>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                label="First Name"
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Address Dialog */}
      <Dialog open={addAddressOpen} onClose={() => setAddAddressOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Address Type"
                value={addressForm.type}
                onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value as 'home' | 'work' | 'other' })}
                SelectProps={{ native: true }}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={addressForm.street}
                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                label="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                label="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                label="Postal Code"
                value={addressForm.postal_code}
                onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                fullWidth
                label="Country"
                value={addressForm.country}
                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddAddressOpen(false)}>Cancel</Button>
          <Button onClick={handleAddAddress} variant="contained">
            Add Address
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AccountDashboard;