import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as CartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  LocalShipping as ShippingIcon,
  Star as StarIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useSallaAnalytics } from '../../../hooks/useSallaAnalytics';
import { useSallaOrders } from '../../../hooks/useSallaOrders';
import { useSallaInventory } from '../../../hooks/useSallaInventory';
import { useSallaNotifications } from '../../../hooks/useSallaNotifications';
import { FlexBox } from '../../../components/flex-box';
import { H1, H2, H3, H4, H6 } from '../../../components/Typography';
import { formatPrice, formatDate, formatNumber } from '../../../services/salla/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color = 'primary' }) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardContent>
        <FlexBox justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" color={`${color}.main`} mb={1}>
              {typeof value === 'number' ? formatNumber(value) : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {change !== undefined && (
              <FlexBox alignItems="center" gap={0.5} mt={1}>
                {isPositive ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : isNegative ? (
                  <TrendingDownIcon color="error" fontSize="small" />
                ) : null}
                <Typography
                  variant="caption"
                  color={isPositive ? 'success.main' : isNegative ? 'error.main' : 'text.secondary'}
                >
                  {change > 0 ? '+' : ''}{change}% from last month
                </Typography>
              </FlexBox>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              color: `${color}.main`
            }}
          >
            {icon}
          </Box>
        </FlexBox>
      </CardContent>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Hooks
  const {
    overview,
    salesAnalytics,
    productAnalytics,
    customerAnalytics,
    loading: analyticsLoading,
    error: analyticsError,
    refreshOverview,
    exportData
  } = useSallaAnalytics();

  const {
    orders,
    loading: ordersLoading,
    getOrders,
    updateOrderStatus
  } = useSallaOrders();

  const {
    inventory,
    lowStockAlerts,
    loading: inventoryLoading,
    getInventory,
    getLowStockAlerts
  } = useSallaInventory();

  const {
    notifications,
    loading: notificationsLoading,
    getNotifications
  } = useSallaNotifications();

  // Sample data for charts
  const salesData = [
    { name: 'Jan', sales: 4000, orders: 240 },
    { name: 'Feb', sales: 3000, orders: 198 },
    { name: 'Mar', sales: 2000, orders: 180 },
    { name: 'Apr', sales: 2780, orders: 208 },
    { name: 'May', sales: 1890, orders: 181 },
    { name: 'Jun', sales: 2390, orders: 250 },
    { name: 'Jul', sales: 3490, orders: 320 }
  ];

  const categoryData = [
    { name: 'Electronics', value: 400, color: '#8884d8' },
    { name: 'Clothing', value: 300, color: '#82ca9d' },
    { name: 'Books', value: 200, color: '#ffc658' },
    { name: 'Home & Garden', value: 150, color: '#ff7300' },
    { name: 'Sports', value: 100, color: '#00ff00' }
  ];

  const trafficData = [
    { name: 'Mon', visitors: 1200, pageViews: 3400 },
    { name: 'Tue', visitors: 1100, pageViews: 3200 },
    { name: 'Wed', visitors: 1300, pageViews: 3800 },
    { name: 'Thu', visitors: 1400, pageViews: 4100 },
    { name: 'Fri', visitors: 1600, pageViews: 4500 },
    { name: 'Sat', visitors: 1800, pageViews: 5200 },
    { name: 'Sun', visitors: 1500, pageViews: 4300 }
  ];

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshOverview(),
        getOrders({ limit: 10 }),
        getInventory({ limit: 10 }),
        getLowStockAlerts(),
        getNotifications({ limit: 5 })
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle export
  const handleExport = async (type: string) => {
    try {
      await exportData(type, { dateRange });
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Get order status color
  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get stock level color
  const getStockLevelColor = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return 'error';
    if (quantity <= minQuantity) return 'warning';
    return 'success';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <FlexBox justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <H1 mb={1}>Admin Dashboard</H1>
          <Typography variant="body1" color="text.secondary">
            Monitor your store performance and manage operations
          </Typography>
        </Box>
        
        <FlexBox gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 3 months</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('overview')}
          >
            Export
          </Button>
        </FlexBox>
      </FlexBox>

      {/* Loading State */}
      {(analyticsLoading || refreshing) && (
        <LinearProgress sx={{ mb: 3 }} />
      )}

      {/* Error State */}
      {analyticsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {analyticsError}
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item lg={3} md={6} xs={12}>
          <StatCard
            title="Total Revenue"
            value={formatPrice(overview?.totalRevenue || 0)}
            change={overview?.revenueChange || 0}
            icon={<MoneyIcon />}
            color="success"
          />
        </Grid>
        
        <Grid item lg={3} md={6} xs={12}>
          <StatCard
            title="Total Orders"
            value={overview?.totalOrders || 0}
            change={overview?.ordersChange || 0}
            icon={<CartIcon />}
            color="primary"
          />
        </Grid>
        
        <Grid item lg={3} md={6} xs={12}>
          <StatCard
            title="Total Customers"
            value={overview?.totalCustomers || 0}
            change={overview?.customersChange || 0}
            icon={<PeopleIcon />}
            color="info"
          />
        </Grid>
        
        <Grid item lg={3} md={6} xs={12}>
          <StatCard
            title="Products in Stock"
            value={overview?.productsInStock || 0}
            change={overview?.stockChange || 0}
            icon={<InventoryIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={4}>
        {/* Sales Chart */}
        <Grid item lg={8} xs={12}>
          <Card>
            <CardHeader
              title="Sales Overview"
              subheader="Revenue and orders over time"
              action={
                <IconButton onClick={() => handleExport('sales')}>
                  <DownloadIcon />
                </IconButton>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Sales ($)"
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Category Distribution */}
        <Grid item lg={4} xs={12}>
          <Card>
            <CardHeader
              title="Sales by Category"
              subheader="Product category breakdown"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Traffic Chart */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Website Traffic"
              subheader="Visitors and page views"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="visitors" fill="#8884d8" name="Visitors" />
                  <Bar dataKey="pageViews" fill="#82ca9d" name="Page Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Tables Row */}
      <Grid container spacing={3} mb={4}>
        {/* Recent Orders */}
        <Grid item lg={8} xs={12}>
          <Card>
            <CardHeader
              title="Recent Orders"
              subheader="Latest customer orders"
              action={
                <Button size="small" onClick={() => handleExport('orders')}>
                  View All
                </Button>
              }
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders?.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            #{order.order_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <FlexBox alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {order.customer?.first_name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {order.customer?.first_name} {order.customer?.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.customer?.email}
                              </Typography>
                            </Box>
                          </FlexBox>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {formatPrice(order.total)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status.toUpperCase()}
                            size="small"
                            color={getOrderStatusColor(order.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(order.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <FlexBox gap={0.5}>
                            <Tooltip title="View Order">
                              <IconButton size="small">
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Order">
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </FlexBox>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Low Stock Alerts */}
        <Grid item lg={4} xs={12}>
          <Card>
            <CardHeader
              title="Low Stock Alerts"
              subheader="Products running low"
              avatar={
                <Badge badgeContent={lowStockAlerts?.length || 0} color="error">
                  <WarningIcon color="warning" />
                </Badge>
              }
            />
            <CardContent sx={{ p: 0 }}>
              <List>
                {lowStockAlerts?.slice(0, 5).map((alert, index) => (
                  <React.Fragment key={alert.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          src={alert.product?.image}
                          alt={alert.product?.name}
                          sx={{ width: 40, height: 40 }}
                        >
                          <InventoryIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap>
                            {alert.product?.name}
                          </Typography>
                        }
                        secondary={
                          <FlexBox alignItems="center" gap={1}>
                            <Chip
                              label={`${alert.quantity} left`}
                              size="small"
                              color={getStockLevelColor(alert.quantity, alert.min_quantity) as any}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Min: {alert.min_quantity}
                            </Typography>
                          </FlexBox>
                        }
                      />
                    </ListItem>
                    {index < Math.min(lowStockAlerts.length, 5) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              {(!lowStockAlerts || lowStockAlerts.length === 0) && (
                <Box p={3} textAlign="center">
                  <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    All products are well stocked!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications and Quick Actions */}
      <Grid container spacing={3}>
        {/* Recent Notifications */}
        <Grid item lg={6} xs={12}>
          <Card>
            <CardHeader
              title="Recent Notifications"
              subheader="System and user notifications"
              avatar={
                <Badge badgeContent={notifications?.filter(n => !n.read_at).length || 0} color="error">
                  <NotificationsIcon color="primary" />
                </Badge>
              }
            />
            <CardContent sx={{ p: 0 }}>
              <List>
                {notifications?.slice(0, 4).map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.read_at ? 'transparent' : 'action.hover'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <NotificationsIcon color="primary" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" mb={0.5}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(notification.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < Math.min(notifications?.length || 0, 4) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              {(!notifications || notifications.length === 0) && (
                <Box p={3} textAlign="center">
                  <NotificationsIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No recent notifications
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item lg={6} xs={12}>
          <Card>
            <CardHeader
              title="Quick Actions"
              subheader="Common administrative tasks"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CartIcon />}
                    sx={{ py: 2 }}
                  >
                    New Order
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<InventoryIcon />}
                    sx={{ py: 2 }}
                  >
                    Add Product
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    sx={{ py: 2 }}
                  >
                    Manage Users
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ShippingIcon />}
                    sx={{ py: 2 }}
                  >
                    Shipping
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport('full')}
                  >
                    Export Data
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    Sync Data
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;