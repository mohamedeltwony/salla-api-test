import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
  CircularProgress,
  Alert,
  IconButton,
  Badge,
  Autocomplete,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  Sort as SortIcon,
  ExpandMore as ExpandMoreIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as CartIcon,
  Visibility as ViewIcon,
  TuneIcon,
  HistoryIcon,
  TrendingUpIcon,
  MicIcon,
  CameraAltIcon,
  BookmarkIcon,
  BookmarkBorderIcon,
  NotificationsIcon,
  ShareIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';
import {
  useSallaSearch,
  useSallaAutoComplete,
  useSallaSearchSuggestions,
  useSallaPopularSearches,
  useSallaSearchHistory,
  useSallaVisualSearch,
  useSallaVoiceSearch,
  useSallaSavedSearches,
  useSallaSearchAlerts,
  useSallaSimilarProducts,
  useSallaTrendingSearches
} from '../../hooks/useSallaSearch';
import { useSallaCart } from '../../hooks/useSallaCart';
import { FlexBox } from '../../components/flex-box';
import { H1, H2, H3, H4, H6 } from '../../components/Typography';
import { formatPrice, createSlug } from '../../services/salla/utils';
import { SallaProduct, SallaSearchFilters, SallaSearchSort } from '../../services/salla/types';

interface SearchPageProps {}

const SearchPage: React.FC<SearchPageProps> = () => {
  // State
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SallaSearchFilters>({
    categories: [],
    brands: [],
    price_min: 0,
    price_max: 1000,
    rating: 0,
    in_stock: false,
    on_sale: false
  });
  const [sort, setSort] = useState<SallaSearchSort>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [showVisualSearch, setShowVisualSearch] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Hooks
  const {
    searchResults,
    loading: searchLoading,
    error: searchError,
    totalResults,
    searchProducts,
    searchAdvanced,
    clearSearch
  } = useSallaSearch();

  const {
    suggestions,
    loading: autoCompleteLoading,
    getSuggestions
  } = useSallaAutoComplete();

  const {
    suggestions: searchSuggestions,
    getSearchSuggestions
  } = useSallaSearchSuggestions();

  const {
    popularSearches,
    getPopularSearches
  } = useSallaPopularSearches();

  const {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory
  } = useSallaSearchHistory();

  const {
    visualSearchResults,
    loading: visualLoading,
    searchByImage
  } = useSallaVisualSearch();

  const {
    isListening,
    transcript,
    startListening,
    stopListening
  } = useSallaVoiceSearch();

  const {
    savedSearches,
    saveSearch,
    removeSavedSearch
  } = useSallaSavedSearches();

  const {
    searchAlerts,
    createAlert,
    removeAlert
  } = useSallaSearchAlerts();

  const {
    trendingSearches,
    getTrendingSearches
  } = useSallaTrendingSearches();

  const {
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useSallaCart();

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        getSuggestions(searchQuery);
      }
    }, 300),
    [getSuggestions]
  );

  // Effects
  useEffect(() => {
    getPopularSearches();
    getTrendingSearches();
  }, []);

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);

  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
      handleSearch(transcript);
    }
  }, [transcript]);

  // Handlers
  const handleSearch = async (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) return;

    try {
      await searchProducts({
        query: searchTerm,
        filters,
        sort,
        page,
        limit: 20
      });
      addToHistory(searchTerm);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleAdvancedSearch = async () => {
    try {
      await searchAdvanced({
        query,
        filters,
        sort,
        page,
        limit: 20
      });
      addToHistory(query);
      setShowAdvancedSearch(false);
    } catch (error) {
      console.error('Advanced search error:', error);
    }
  };

  const handleFilterChange = (key: keyof SallaSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      price_min: 0,
      price_max: 1000,
      rating: 0,
      in_stock: false,
      on_sale: false
    });
    setPage(1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      try {
        await searchByImage(file);
      } catch (error) {
        console.error('Visual search error:', error);
      }
    }
  };

  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSaveSearch = async () => {
    if (query.trim()) {
      try {
        await saveSearch({
          query,
          filters,
          sort
        });
      } catch (error) {
        console.error('Save search error:', error);
      }
    }
  };

  const handleCreateAlert = async () => {
    if (query.trim()) {
      try {
        await createAlert({
          query,
          filters,
          frequency: 'daily'
        });
      } catch (error) {
        console.error('Create alert error:', error);
      }
    }
  };

  const handleAddToCart = async (product: SallaProduct) => {
    try {
      await addToCart({
        product_id: product.id,
        quantity: 1,
        variant_id: product.variants?.[0]?.id
      });
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  const handleToggleWishlist = async (product: SallaProduct) => {
    try {
      await toggleWishlist(product.id);
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  // Render product card
  const renderProductCard = (product: SallaProduct) => {
    const isWishlisted = isInWishlist(product.id);

    if (viewMode === 'list') {
      return (
        <Card key={product.id} sx={{ display: 'flex', mb: 2 }}>
          <CardMedia
            component="img"
            sx={{ width: 200, height: 200 }}
            image={product.image || '/placeholder-product.jpg'}
            alt={product.name}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {product.description}
              </Typography>
              <FlexBox alignItems="center" gap={1} mb={1}>
                <Rating value={product.rating || 0} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  ({product.reviews_count || 0} reviews)
                </Typography>
              </FlexBox>
              <FlexBox alignItems="center" gap={1}>
                <Typography variant="h6" color="primary">
                  {formatPrice(product.sale_price || product.price)}
                </Typography>
                {product.sale_price && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {formatPrice(product.price)}
                  </Typography>
                )}
                {product.sale_price && (
                  <Chip
                    label={`${Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF`}
                    color="error"
                    size="small"
                  />
                )}
              </FlexBox>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<CartIcon />}
                onClick={() => handleAddToCart(product)}
                disabled={!product.in_stock}
              >
                {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <IconButton
                onClick={() => handleToggleWishlist(product)}
                color={isWishlisted ? 'error' : 'default'}
              >
                {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton>
                <ViewIcon />
              </IconButton>
              <IconButton>
                <ShareIcon />
              </IconButton>
            </CardActions>
          </Box>
        </Card>
      );
    }

    return (
      <Card key={product.id}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height={250}
            image={product.image || '/placeholder-product.jpg'}
            alt={product.name}
          />
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'background.paper' }
            }}
            onClick={() => handleToggleWishlist(product)}
            color={isWishlisted ? 'error' : 'default'}
          >
            {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          {product.sale_price && (
            <Chip
              label={`${Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF`}
              color="error"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8
              }}
            />
          )}
        </Box>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom noWrap>
            {product.name}
          </Typography>
          <FlexBox alignItems="center" gap={1} mb={1}>
            <Rating value={product.rating || 0} readOnly size="small" />
            <Typography variant="body2" color="text.secondary">
              ({product.reviews_count || 0})
            </Typography>
          </FlexBox>
          <FlexBox alignItems="center" gap={1} mb={2}>
            <Typography variant="h6" color="primary">
              {formatPrice(product.sale_price || product.price)}
            </Typography>
            {product.sale_price && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                {formatPrice(product.price)}
              </Typography>
            )}
          </FlexBox>
        </CardContent>
        <CardActions>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CartIcon />}
            onClick={() => handleAddToCart(product)}
            disabled={!product.in_stock}
          >
            {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <H1 mb={2}>Search Products</H1>
        
        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <FlexBox gap={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search for products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <FlexBox gap={1}>
                      <IconButton
                        onClick={handleVoiceSearch}
                        color={isListening ? 'error' : 'default'}
                        size="small"
                      >
                        <MicIcon />
                      </IconButton>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="visual-search-input"
                        type="file"
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="visual-search-input">
                        <IconButton component="span" size="small">
                          <CameraAltIcon />
                        </IconButton>
                      </label>
                      {query && (
                        <IconButton
                          onClick={() => {
                            setQuery('');
                            clearSearch();
                          }}
                          size="small"
                        >
                          <ClearIcon />
                        </IconButton>
                      )}
                    </FlexBox>
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              onClick={() => handleSearch()}
              disabled={!query.trim()}
            >
              Search
            </Button>
          </FlexBox>
          
          {/* Auto-complete suggestions */}
          {suggestions.length > 0 && query && (
            <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
              <List>
                {suggestions.map((suggestion, index) => (
                  <ListItemButton
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <ListItemText primary={suggestion} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}
        </Paper>
        
        {/* Quick Actions */}
        <FlexBox gap={2} mb={3} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<TuneIcon />}
            onClick={() => setShowAdvancedSearch(true)}
          >
            Advanced Search
          </Button>
          <Button
            variant="outlined"
            startIcon={<BookmarkIcon />}
            onClick={handleSaveSearch}
            disabled={!query.trim()}
          >
            Save Search
          </Button>
          <Button
            variant="outlined"
            startIcon={<NotificationsIcon />}
            onClick={handleCreateAlert}
            disabled={!query.trim()}
          >
            Create Alert
          </Button>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Search History
          </Button>
        </FlexBox>
        
        {/* Popular and Trending Searches */}
        {!query && (
          <Grid container spacing={3} mb={3}>
            <Grid item md={6} xs={12}>
              <Card>
                <CardContent>
                  <H4 mb={2}>Popular Searches</H4>
                  <FlexBox gap={1} flexWrap="wrap">
                    {popularSearches.map((search, index) => (
                      <Chip
                        key={index}
                        label={search}
                        onClick={() => handleSuggestionClick(search)}
                        clickable
                      />
                    ))}
                  </FlexBox>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item md={6} xs={12}>
              <Card>
                <CardContent>
                  <H4 mb={2}>Trending Now</H4>
                  <FlexBox gap={1} flexWrap="wrap">
                    {trendingSearches.map((search, index) => (
                      <Chip
                        key={index}
                        label={search}
                        icon={<TrendingUpIcon />}
                        onClick={() => handleSuggestionClick(search)}
                        clickable
                        color="primary"
                      />
                    ))}
                  </FlexBox>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Search Results */}
      {(searchResults.length > 0 || searchLoading) && (
        <Box>
          {/* Results Header */}
          <FlexBox justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h6">
                {searchLoading ? 'Searching...' : `${totalResults} results found`}
                {query && ` for "${query}"`}
              </Typography>
            </Box>
            
            <FlexBox gap={2} alignItems="center">
              {/* Sort */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sort}
                  label="Sort by"
                  onChange={(e) => setSort(e.target.value as SallaSearchSort)}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="price_low_high">Price: Low to High</MenuItem>
                  <MenuItem value="price_high_low">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="popularity">Popularity</MenuItem>
                </Select>
              </FormControl>
              
              {/* View Mode */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <GridViewIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ListViewIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              
              {/* Filters Toggle */}
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </FlexBox>
          </FlexBox>
          
          <Grid container spacing={3}>
            {/* Filters Sidebar */}
            {showFilters && (
              <Grid item lg={3} md={4} xs={12}>
                <Card sx={{ position: 'sticky', top: 20 }}>
                  <CardContent>
                    <FlexBox justifyContent="space-between" alignItems="center" mb={2}>
                      <H4>Filters</H4>
                      <Button size="small" onClick={handleClearFilters}>
                        Clear All
                      </Button>
                    </FlexBox>
                    
                    {/* Price Range */}
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Price Range</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box px={1}>
                          <Slider
                            value={[filters.price_min || 0, filters.price_max || 1000]}
                            onChange={(e, value) => {
                              const [min, max] = value as number[];
                              handleFilterChange('price_min', min);
                              handleFilterChange('price_max', max);
                            }}
                            valueLabelDisplay="auto"
                            min={0}
                            max={1000}
                            step={10}
                          />
                          <FlexBox justifyContent="space-between" mt={1}>
                            <Typography variant="caption">
                              ${filters.price_min}
                            </Typography>
                            <Typography variant="caption">
                              ${filters.price_max}
                            </Typography>
                          </FlexBox>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                    
                    {/* Rating */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Rating</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Rating
                          value={filters.rating || 0}
                          onChange={(e, value) => handleFilterChange('rating', value)}
                        />
                      </AccordionDetails>
                    </Accordion>
                    
                    {/* Availability */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Availability</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={filters.in_stock || false}
                                onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                              />
                            }
                            label="In Stock"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={filters.on_sale || false}
                                onChange={(e) => handleFilterChange('on_sale', e.target.checked)}
                              />
                            }
                            label="On Sale"
                          />
                        </FormGroup>
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {/* Products Grid */}
            <Grid item lg={showFilters ? 9 : 12} md={showFilters ? 8 : 12} xs={12}>
              {searchLoading ? (
                <Grid container spacing={3}>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Grid item lg={viewMode === 'grid' ? 3 : 12} md={viewMode === 'grid' ? 4 : 12} sm={viewMode === 'grid' ? 6 : 12} xs={12} key={index}>
                      <Card>
                        <Skeleton variant="rectangular" height={250} />
                        <CardContent>
                          <Skeleton variant="text" height={32} />
                          <Skeleton variant="text" height={20} width="60%" />
                          <Skeleton variant="text" height={24} width="40%" />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : searchError ? (
                <Alert severity="error">{searchError}</Alert>
              ) : searchResults.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" mb={1}>
                    No products found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search terms or filters
                  </Typography>
                </Box>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <Grid container spacing={3}>
                      {searchResults.map((product) => (
                        <Grid item lg={showFilters ? 4 : 3} md={showFilters ? 6 : 4} sm={6} xs={12} key={product.id}>
                          {renderProductCard(product)}
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box>
                      {searchResults.map((product) => renderProductCard(product))}
                    </Box>
                  )}
                  
                  {/* Pagination */}
                  {totalResults > 20 && (
                    <FlexBox justifyContent="center" mt={4}>
                      <Pagination
                        count={Math.ceil(totalResults / 20)}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                      />
                    </FlexBox>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Advanced Search Dialog */}
      <Dialog
        open={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Advanced Search</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search Query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Grid>
            
            <Grid item md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  multiple
                  value={filters.categories || []}
                  onChange={(e) => handleFilterChange('categories', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="clothing">Clothing</MenuItem>
                  <MenuItem value="books">Books</MenuItem>
                  <MenuItem value="home">Home & Garden</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Brand</InputLabel>
                <Select
                  multiple
                  value={filters.brands || []}
                  onChange={(e) => handleFilterChange('brands', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="apple">Apple</MenuItem>
                  <MenuItem value="samsung">Samsung</MenuItem>
                  <MenuItem value="nike">Nike</MenuItem>
                  <MenuItem value="adidas">Adidas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Min Price"
                value={filters.price_min || ''}
                onChange={(e) => handleFilterChange('price_min', Number(e.target.value))}
              />
            </Grid>
            
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Max Price"
                value={filters.price_max || ''}
                onChange={(e) => handleFilterChange('price_max', Number(e.target.value))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography gutterBottom>Minimum Rating</Typography>
              <Rating
                value={filters.rating || 0}
                onChange={(e, value) => handleFilterChange('rating', value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.in_stock || false}
                      onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                    />
                  }
                  label="In Stock Only"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.on_sale || false}
                      onChange={(e) => handleFilterChange('on_sale', e.target.checked)}
                    />
                  }
                  label="On Sale Only"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdvancedSearch(false)}>Cancel</Button>
          <Button onClick={handleClearFilters}>Clear</Button>
          <Button variant="contained" onClick={handleAdvancedSearch}>
            Search
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Quick Actions */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setShowFilters(!showFilters)}
      >
        <FilterIcon />
      </Fab>
    </Container>
  );
};

export default SearchPage;