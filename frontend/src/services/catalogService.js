import apiClient from './api';

// In-memory cache store
const cache = new Map();
// In-flight network promises to deduplicate simultaneous requests
const pendingRequests = new Map();

// Default Cache TTLs
const TTL_CATEGORIES = 10 * 60 * 1000; // 10 minutes
const TTL_BRANDS = 10 * 60 * 1000;     // 10 minutes
const TTL_FEATURED = 5 * 60 * 1000;    // 5 minutes
const TTL_PRODUCTS = 3 * 60 * 1000;    // 3 minutes
const TTL_PRODUCT_DETAIL = 5 * 60 * 1000; // 5 minutes

// Helper to get cached item if valid
const getFromCache = (key, maxAge = TTL_PRODUCTS) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > maxAge) {
    return null; // Expired
  }
  return entry.data;
};

// Helper to store in cache
const setInCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Helper to run a deduplicated cached query
const fetchWithCache = async (key, fetcher, maxAge) => {
  const cached = getFromCache(key, maxAge);
  if (cached !== null) {
    return cached;
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = fetcher()
    .then((data) => {
      setInCache(key, data);
      return data;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
};

// Canonical key generator for products query
const buildProductsQueryString = (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.page_size) query.append('page_size', params.page_size);
  if (params.search) query.append('search', params.search.trim());
  if (params.category) query.append('category', params.category);
  if (params.brand) query.append('brand', params.brand);
  if (params.min_price) query.append('min_price', params.min_price);
  if (params.max_price) query.append('max_price', params.max_price);
  if (params.in_stock) query.append('in_stock', 'true');
  if (params.featured) query.append('featured', 'true');
  if (params.ordering) query.append('ordering', params.ordering);
  return query.toString();
};

export const getProducts = async (params = {}, options = {}) => {
  const queryString = buildProductsQueryString(params);
  const cacheKey = `products:${queryString}`;
  const maxAge = options.maxAge || TTL_PRODUCTS;

  if (options.forceRefresh) {
    cache.delete(cacheKey);
  }

  return fetchWithCache(
    cacheKey,
    async () => {
      const url = queryString ? `/products/?${queryString}` : '/products/';
      const response = await apiClient.get(url);
      return response.data;
    },
    maxAge
  );
};

export const getProductBySlugOrId = async (slugOrId, options = {}) => {
  const cacheKey = `product_detail:${slugOrId}`;
  const maxAge = options.maxAge || TTL_PRODUCT_DETAIL;

  if (options.forceRefresh) {
    cache.delete(cacheKey);
  }

  return fetchWithCache(
    cacheKey,
    async () => {
      const response = await apiClient.get(`/products/${slugOrId}/`);
      return response.data;
    },
    maxAge
  );
};

export const getFeaturedProducts = async (options = {}) => {
  const cacheKey = 'products:featured';
  const maxAge = options.maxAge || TTL_FEATURED;

  if (options.forceRefresh) {
    cache.delete(cacheKey);
  }

  return fetchWithCache(
    cacheKey,
    async () => {
      const response = await apiClient.get('/products/featured/');
      return response.data.results || response.data;
    },
    maxAge
  );
};

export const getCategories = async (params = {}, options = {}) => {
  const query = new URLSearchParams(params).toString();
  const cacheKey = `categories:${query}`;
  const maxAge = options.maxAge || TTL_CATEGORIES;

  if (options.forceRefresh) {
    cache.delete(cacheKey);
  }

  return fetchWithCache(
    cacheKey,
    async () => {
      const url = query ? `/categories/?${query}` : '/categories/';
      const response = await apiClient.get(url);
      return response.data.results || response.data;
    },
    maxAge
  );
};

export const getBrands = async (options = {}) => {
  const cacheKey = 'brands:all';
  const maxAge = options.maxAge || TTL_BRANDS;

  if (options.forceRefresh) {
    cache.delete(cacheKey);
  }

  return fetchWithCache(
    cacheKey,
    async () => {
      const response = await apiClient.get('/products/brands/');
      return response.data.results || response.data;
    },
    maxAge
  );
};

// ================= Synchronous Cache Getters for Instant Component Rendering =================
export const getCachedProducts = (params = {}) => {
  const queryString = buildProductsQueryString(params);
  return getFromCache(`products:${queryString}`, TTL_PRODUCTS);
};

export const getCachedProductBySlugOrId = (slugOrId) => {
  return getFromCache(`product_detail:${slugOrId}`, TTL_PRODUCT_DETAIL);
};

export const getCachedFeaturedProducts = () => {
  return getFromCache('products:featured', TTL_FEATURED);
};

export const getCachedCategories = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return getFromCache(`categories:${query}`, TTL_CATEGORIES);
};

export const getCachedBrands = () => {
  return getFromCache('brands:all', TTL_BRANDS);
};

// ================= Background Cache Warm-up =================
export const prefetchCatalogMetadata = () => {
  // Silently preheat key datasets in the background
  getCategories().catch(() => {});
  getCategories({ all: 'true' }).catch(() => {});
  getBrands().catch(() => {});
  getFeaturedProducts().catch(() => {});
  getProducts({ page_size: 12 }).catch(() => {});
};

// ================= Cache Invalidation =================
export const invalidateCatalogCache = (pattern = null) => {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

export default {
  getProducts,
  getProductBySlugOrId,
  getFeaturedProducts,
  getCategories,
  getBrands,
  getCachedProducts,
  getCachedProductBySlugOrId,
  getCachedFeaturedProducts,
  getCachedCategories,
  getCachedBrands,
  prefetchCatalogMetadata,
  invalidateCatalogCache,
};
