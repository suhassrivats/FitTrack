import axios from 'axios';

// Open Food Facts API base URL
// Using the cgi endpoint directly (not v2 API)
const OFF_API_BASE_URL = 'https://world.openfoodfacts.org';

/**
 * Open Food Facts API Service
 * Documentation: https://world.openfoodfacts.org/data
 * 
 * Rate Limits: 
 * - 1 API call = 1 real scan by a user
 * - For bulk data, use the daily exports instead of scraping via API
 */
const openFoodFactsAPI = axios.create({
  baseURL: OFF_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'FitTrack/1.0.0 (Mobile App)',
  },
  timeout: 10000,
});

/**
 * Search for products by name
 * @param {string} searchTerm - Product name to search for
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Results per page (default: 24, max: 100)
 * @returns {Promise} Search results
 */
export const searchProducts = async (searchTerm, page = 1, pageSize = 24) => {
  try {
    console.log('Searching Open Food Facts for:', searchTerm);
    const response = await openFoodFactsAPI.get('/cgi/search.pl', {
      params: {
        search_terms: searchTerm,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: pageSize,
        page: page,
        fields: [
          'code', // barcode
          'product_name',
          'product_name_en',
          'brands',
          'categories',
          'image_url',
          'image_small_url',
          'nutriments', // nutrition data
          'nutriscore_grade',
          'serving_size',
          'quantity',
        ].join(','),
      },
    });

    console.log('Open Food Facts API response:', {
      status: response.data.status,
      count: response.data.count,
      productsLength: response.data.products?.length || 0,
    });

    // Handle case where API returns error status
    if (response.data.status === 0) {
      console.log('API returned status 0 (no results)');
      return {
        products: [],
        count: 0,
        page: page,
        pageSize: pageSize,
      };
    }

    const products = response.data.products || [];
    console.log('Found products:', products.length);
    
    return {
      products: products,
      count: response.data.count || 0,
      page: response.data.page || 1,
      pageSize: response.data.page_size || pageSize,
    };
  } catch (error) {
    console.error('Open Food Facts search error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    // Return empty results instead of throwing to prevent screen crash
    return {
      products: [],
      count: 0,
      page: page,
      pageSize: pageSize,
      error: error.message,
    };
  }
};

/**
 * Get product by barcode
 * @param {string} barcode - Product barcode
 * @returns {Promise} Product data
 */
export const getProductByBarcode = async (barcode) => {
  try {
    const response = await openFoodFactsAPI.get(`/api/v2/product/${barcode}.json`);
    
    if (response.data.status === 0) {
      throw new Error('Product not found');
    }

    return response.data.product;
  } catch (error) {
    console.error('Open Food Facts barcode lookup error:', error);
    throw error;
  }
};

/**
 * Extract nutrition data from Open Food Facts product
 * @param {Object} product - Open Food Facts product object
 * @param {number} quantity - Quantity in grams (optional, defaults to 100g)
 * @returns {Object} Normalized nutrition data
 */
export const extractNutritionData = (product, quantity = 100) => {
  const nutriments = product.nutriments || {};
  const servingSize = product.serving_size 
    ? parseFloat(product.serving_size.replace(/[^0-9.]/g, '')) 
    : 100;

  // Open Food Facts stores values per 100g by default
  // If we have a different quantity, we need to scale
  const scale = quantity / 100;

  // Extract macros (values are typically per 100g)
  const calories = (nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0) * scale;
  const protein = (nutriments['proteins_100g'] || nutriments.proteins || 0) * scale;
  const carbs = (nutriments['carbohydrates_100g'] || nutriments.carbohydrates || 0) * scale;
  const fats = (nutriments['fat_100g'] || nutriments.fat || 0) * scale;

  return {
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10, // Round to 1 decimal
    carbs: Math.round(carbs * 10) / 10,
    fats: Math.round(fats * 10) / 10,
    servingSize: servingSize,
    quantity: quantity,
  };
};

/**
 * Format product name for display
 * @param {Object} product - Open Food Facts product object
 * @returns {string} Formatted product name
 */
export const formatProductName = (product) => {
  return product.product_name_en || product.product_name || 'Unknown Product';
};

/**
 * Format product brand and name
 * @param {Object} product - Open Food Facts product object
 * @returns {string} Formatted brand and name
 */
export const formatProductDisplayName = (product) => {
  const name = formatProductName(product);
  const brand = product.brands ? product.brands.split(',')[0].trim() : '';
  return brand ? `${brand} - ${name}` : name;
};

export default {
  searchProducts,
  getProductByBarcode,
  extractNutritionData,
  formatProductName,
  formatProductDisplayName,
};

