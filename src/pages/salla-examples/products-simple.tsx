import React, { useState, useEffect } from 'react';
import { useSallaProducts } from '../../hooks/useSallaProducts';

const ProductsSimplePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('name');

  const {
    products,
    loading,
    error,
    pagination,
    searchProducts
  } = useSallaProducts();

  useEffect(() => {
    searchProducts(searchQuery, { page: currentPage });
  }, [searchQuery, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    searchProducts(searchQuery, { page: 1 });
  };

  const handleFilter = () => {
    searchProducts(searchQuery, {
      page: 1,
      category: selectedCategory,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sortBy
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 1000]);
    setSortBy('name');
    searchProducts('', { page: 1 });
    setCurrentPage(1);
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '30px',
      color: '#333'
    },
    searchForm: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      justifyContent: 'center',
      flexWrap: 'wrap' as const
    },
    searchInput: {
      padding: '12px',
      fontSize: '16px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      minWidth: '300px',
      outline: 'none'
    },
    searchButton: {
      padding: '12px 24px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px'
    },
    filtersContainer: {
      display: 'flex',
      gap: '15px',
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      flexWrap: 'wrap' as const,
      alignItems: 'center'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '5px'
    },
    label: {
      fontWeight: 'bold',
      color: '#555'
    },
    select: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '14px'
    },
    input: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '14px',
      width: '80px'
    },
    filterButton: {
      padding: '10px 20px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    clearButton: {
      padding: '10px 20px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    loadingContainer: {
      textAlign: 'center' as const,
      padding: '50px',
      fontSize: '18px'
    },
    errorContainer: {
      textAlign: 'center' as const,
      padding: '50px',
      color: '#dc3545',
      fontSize: '18px'
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    productCard: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    productImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover' as const,
      borderRadius: '4px',
      marginBottom: '10px'
    },
    productTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: '#333',
      lineHeight: '1.4'
    },
    productPrice: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#007bff',
      marginBottom: '8px'
    },
    productRating: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '8px'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      alignItems: 'center'
    },
    paginationButton: {
      padding: '10px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    paginationInfo: {
      padding: '10px 15px',
      fontSize: '14px',
      color: '#666'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          Loading products...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Salla Products</h1>
      
      {/* Search */}
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>
          Search
        </button>
      </form>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.select}
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="home">Home & Garden</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Min Price:</label>
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
            style={styles.input}
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Max Price:</label>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
            style={styles.input}
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Sort By:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.select}
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <button onClick={handleFilter} style={styles.filterButton}>
          Apply Filters
        </button>
        
        <button onClick={handleClearFilters} style={styles.clearButton}>
          Clear Filters
        </button>
      </div>

      {/* Products Grid */}
      <div style={styles.productsGrid}>
        {products.map((product) => (
          <div 
            key={product.id} 
            style={styles.productCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <img 
              src={product.thumbnail || '/placeholder-image.jpg'} 
              alt={product.title}
              style={styles.productImage}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA5NS4yODQgNzAgMTAwIDcwWk0xMDAgMTMwQzEwOC4yODQgMTMwIDkxLjcxNiAxMzAgMTAwIDEzMFoiIHN0cm9rZT0iI0NDQyIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMzAiIHN0cm9rZT0iI0NDQyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjEyIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
              }}
            />
            <div style={styles.productTitle}>{product.title}</div>
            <div style={styles.productPrice}>${product.price}</div>
            {product.rating && (
              <div style={styles.productRating}>
                Rating: {product.rating}/5 ⭐
              </div>
            )}
            {product.discount && (
              <div style={{ color: '#dc3545', fontSize: '14px', fontWeight: 'bold' }}>
                {product.discount}% OFF
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={!pagination.hasPreviousPage}
            style={{
              ...styles.paginationButton,
              backgroundColor: !pagination.hasPreviousPage ? '#ccc' : '#007bff',
              color: 'white',
              cursor: !pagination.hasPreviousPage ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          <span style={styles.paginationInfo}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
            disabled={!pagination.hasNextPage}
            style={{
              ...styles.paginationButton,
              backgroundColor: !pagination.hasNextPage ? '#ccc' : '#007bff',
              color: 'white',
              cursor: !pagination.hasNextPage ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          No products found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  );
};

export default ProductsSimplePage;