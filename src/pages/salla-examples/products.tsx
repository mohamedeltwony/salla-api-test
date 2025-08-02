import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Slider,
  TextField,
  Typography
} from '@mui/material';
import { useSallaProducts } from '../../hooks/useSallaProducts';
import { useSallaCategories } from '../../hooks/useSallaCategories';
import { useSallaSearch } from '../../hooks/useSallaSearch';
import ProductCard1 from '../../components/product-cards/product-card-1';
import { SearchInput } from '../../components/SearchInput';
import { FlexBox } from '../../components/flex-box';
import { H1, H5 } from '../../components/Typography';
import { SallaProduct, SallaCategory } from '../../services/salla/types';
import { transformSallaProduct } from '../../services/salla/utils';

interface ProductsPageProps {
  initialProducts?: SallaProduct[];
  initialCategories?: SallaCategory[];
  categoryId?: string;
  searchQuery?: string;
}

const ProductsPage: React.FC<ProductsPageProps> = ({
  initialProducts = [],
  initialCategories = [],
  categoryId,
  searchQuery
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category_id: categoryId || '',
    price_min: 0,
    price_max: 10000,
    brand_id: '',
    sort_by: 'created_at',
    sort_order: 'desc' as 'asc' | 'desc'
  });
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');

  // Hooks for data fetching
  const {
    products,
    loading: productsLoading,
    error: productsError,
    pagination,
    fetchProducts
  } = useSallaProducts();

  const {
    categories,
    loading: categoriesLoading,
    fetchCategories
  } = useSallaCategories();

  const {
    searchResults,
    loading: searchLoading,
    searchProducts,
    clearSearch
  } = useSallaSearch();

  // Initialize data
  useEffect(() => {
    if (initialCategories.length === 0) {
      fetchCategories({ page: 1, per_page: 100 });
    }
  }, []);

  // Fetch products when filters or page changes
  useEffect(() => {
    if (searchTerm) {
      // Use search API
      searchProducts(searchTerm, {
        ...filters,
        page: currentPage,
        per_page: 20
      });
    } else {
      // Use regular products API
      fetchProducts({
        page: currentPage,
        per_page: 20,
        filters: {
          category_id: filters.category_id,
          price_min: filters.price_min,
          price_max: filters.price_max,
          brand_id: filters.brand_id
        },
        sort_by: filters.sort_by,
        sort_order: filters.sort_order
      });
    }
  }, [filters, currentPage, searchTerm]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
    if (!query) {
      clearSearch();
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get current products (either from search or regular fetch)
  const currentProducts = searchTerm ? searchResults?.results : products;
  const currentPagination = searchTerm ? {
    current_page: currentPage,
    total_pages: Math.ceil((searchResults?.total || 0) / 20),
    total: searchResults?.total || 0
  } : pagination;

  const isLoading = productsLoading || searchLoading;

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      {/* Page Header */}
      <Box mb={4}>
        <H1 mb={2}>
          {searchTerm ? `Search Results for "${searchTerm}"` : 'Products'}
        </H1>
        
        {/* Search Bar */}
        <Box mb={3}>
          <SearchInput
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </Box>

        {/* Results Summary */}
        {currentPagination && (
          <Typography variant="body2" color="text.secondary">
            Showing {((currentPagination.current_page - 1) * 20) + 1}-
            {Math.min(currentPagination.current_page * 20, currentPagination.total)} of {currentPagination.total} products
            {searchTerm && ` for "${searchTerm}"`}
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
            <Grid item lg={3} md={4} xs={12}>
              <Card sx={{ p: 2, mb: 2 }}>
                <H5 mb={2}>Filters</H5>
                
                {/* Categories Filter */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category_id || ''}
                    label="Category"
                    onChange={(e) => handleFilterChange({ category_id: e.target.value })}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories?.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Price Range */}
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>Price Range</Typography>
                  <Slider
                    value={[filters.price_min || 0, filters.price_max || 1000]}
                    onChange={(_, newValue) => {
                      const [min, max] = newValue as number[];
                      handleFilterChange({ price_min: min, price_max: max });
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                  />
                  <FlexBox justifyContent="space-between">
                    <Typography variant="body2">${filters.price_min || 0}</Typography>
                    <Typography variant="body2">${filters.price_max || 1000}</Typography>
                  </FlexBox>
                </Box>

                {/* Sort Options */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sort_by || 'created_at'}
                    label="Sort By"
                    onChange={(e) => handleFilterChange({ sort_by: e.target.value })}
                  >
                    <MenuItem value="created_at">Newest</MenuItem>
                    <MenuItem value="price">Price</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={filters.sort_order || 'desc'}
                    label="Order"
                    onChange={(e) => handleFilterChange({ sort_order: e.target.value })}
                  >
                    <MenuItem value="desc">Descending</MenuItem>
                    <MenuItem value="asc">Ascending</MenuItem>
                  </Select>
                </FormControl>

                {/* Clear Filters Button */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setFilters({
                      category_id: '',
                      price_min: 0,
                      price_max: 1000,
                      brand_id: '',
                      sort_by: 'created_at',
                      sort_order: 'desc'
                    });
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            </Grid>

        {/* Products Grid */}
        <Grid item lg={9} md={8} xs={12}>
          {/* Loading State */}
          {isLoading && (
            <FlexBox justifyContent="center" py={6}>
              <CircularProgress />
            </FlexBox>
          )}

          {/* Error State */}
          {productsError && (
            <Box textAlign="center" py={6}>
              <Typography color="error" variant="h6">
                Error loading products
              </Typography>
              <Typography color="text.secondary" mt={1}>
                {productsError}
              </Typography>
            </Box>
          )}

          {/* No Results */}
          {!isLoading && !productsError && (!currentProducts || currentProducts.length === 0) && (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">
                {searchTerm ? 'No products found for your search' : 'No products available'}
              </Typography>
              {searchTerm && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Try adjusting your search terms or filters
                </Typography>
              )}
            </Box>
          )}

          {/* Products Grid */}
          {!isLoading && currentProducts && currentProducts.length > 0 && (
            <>
              <Grid container spacing={3}>
                {currentProducts.map((sallaProduct) => {
                  // Transform Salla product to Bazaar format
                  const bazaarProduct = transformSallaProduct(sallaProduct);
                  
                  return (
                    <Grid item lg={4} md={6} sm={6} xs={12} key={sallaProduct.id}>
                      <ProductCard1
                        id={bazaarProduct.id}
                        slug={bazaarProduct.slug}
                        title={bazaarProduct.title}
                        price={bazaarProduct.price}
                        off={bazaarProduct.discount}
                        rating={bazaarProduct.rating}
                        images={bazaarProduct.images}
                        imgUrl={bazaarProduct.thumbnail}
                        hoverEffect
                      />
                    </Grid>
                  );
                })}
              </Grid>

              {/* Pagination */}
              {currentPagination && currentPagination.total_pages > 1 && (
                <FlexBox justifyContent="center" mt={6}>
                  <Pagination
                    count={currentPagination.total_pages}
                    page={currentPagination.current_page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </FlexBox>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Search Suggestions (if available) */}
      {searchResults?.suggestions && searchResults.suggestions.length > 0 && (
        <Box mt={4}>
          <H5 mb={2}>Did you mean?</H5>
          <FlexBox gap={2} flexWrap="wrap">
            {searchResults.suggestions.map((suggestion, index) => (
              <Box
                key={index}
                component="button"
                onClick={() => handleSearch(suggestion)}
                sx={
                  theme => ({
                    px: 2,
                    py: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    background: 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  })
                }
              >
                <Typography variant="body2">{suggestion}</Typography>
              </Box>
            ))}
          </FlexBox>
        </Box>
      )}
    </Container>
  );
};

// Server-side rendering for SEO and initial data
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const categoryId = query.category as string;
  const searchQuery = query.search as string;

  try {
    // You can fetch initial data here if needed
    // const sallaApi = new SallaApiClient();
    // const [productsResponse, categoriesResponse] = await Promise.all([
    //   sallaApi.getProducts({ page: 1, per_page: 20, filters: { category_id: categoryId } }),
    //   sallaApi.getCategories({ page: 1, per_page: 100 })
    // ]);

    return {
      props: {
        // initialProducts: productsResponse.data || [],
        // initialCategories: categoriesResponse.data || [],
        categoryId: categoryId || null,
        searchQuery: searchQuery || null
      }
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return {
      props: {
        initialProducts: [],
        initialCategories: [],
        categoryId: categoryId || null,
        searchQuery: searchQuery || null
      }
    };
  }
};

export default ProductsPage;