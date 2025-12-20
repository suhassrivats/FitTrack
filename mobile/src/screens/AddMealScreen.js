import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import Button from '../components/Button';
import { macroAPI } from '../services/api';
import {
  searchProducts,
  getProductByBarcode,
  extractNutritionData,
  formatProductDisplayName,
} from '../services/openFoodFactsAPI';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import {
  saveRecentMeal,
  getRecentMeals,
  getFavoriteMeals,
  addFavoriteMeal,
  removeFavoriteMeal,
  isMealFavorited,
} from '../utils/recentMeals';

// Barcode scanner enabled
const BARCODE_SCANNER_ENABLED = true;

const AddMealScreen = ({ navigation, route }) => {
  const selectedDate = route?.params?.date || new Date().toISOString().split('T')[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('100'); // in grams
  const [mealType, setMealType] = useState('snack');
  const [saving, setSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [recentMeals, setRecentMeals] = useState([]);
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [showRecentFavorites, setShowRecentFavorites] = useState(true);
  const [activeQuickTab, setActiveQuickTab] = useState('recent'); // 'recent' or 'favorites'

  // Load recent and favorite meals on mount
  useEffect(() => {
    loadRecentAndFavorites();
  }, []);

  const loadRecentAndFavorites = async () => {
    const recent = await getRecentMeals();
    const favorites = await getFavoriteMeals();
    setRecentMeals(recent);
    setFavoriteMeals(favorites);
  };

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: 'food-egg' },
    { value: 'lunch', label: 'Lunch', icon: 'food' },
    { value: 'dinner', label: 'Dinner', icon: 'food-variant' },
    { value: 'snack', label: 'Snack', icon: 'food-apple' },
  ];

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setProducts([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query) => {
    try {
      setLoading(true);
      console.log('Performing search for:', query);
      const results = await searchProducts(query, 1, 20);
      console.log('Search results:', {
        totalProducts: results.products.length,
        count: results.count,
        error: results.error,
      });
      
      const filteredProducts = results.products.filter(p => p.product_name);
      console.log('Filtered products (with names):', filteredProducts.length);
      setProducts(filteredProducts);
      
      if (results.error) {
        console.warn('Search warning:', results.error);
        Alert.alert('Search Error', `Unable to search: ${results.error}`);
      } else if (results.products.length === 0 && query.length >= 2) {
        console.log('No products found for query:', query);
      }
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
      Alert.alert('Error', 'Failed to search products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    // Set default quantity to serving size if available
    if (product.serving_size) {
      const servingSize = parseFloat(product.serving_size.replace(/[^0-9.]/g, ''));
      if (servingSize) {
        setQuantity(servingSize.toString());
      }
    }
  };

  const handleBarcodeScan = async (barcode) => {
    try {
      console.log('Looking up barcode:', barcode);
      const product = await getProductByBarcode(barcode);
      setShowScanner(false);
      handleProductSelect(product);
    } catch (error) {
      console.error('Barcode lookup error:', error);
      setShowScanner(false);
      Alert.alert('Product Not Found', 'Could not find a product with this barcode. Try searching manually.');
    }
  };

  const handleQuickAddMeal = (meal) => {
    // Create a product-like object from the saved meal
    const product = {
      product_name: meal.name,
      brands: '',
      nutriments: {
        'energy-kcal_100g': (meal.calories / meal.quantity) * 100,
        'proteins_100g': (meal.protein / meal.quantity) * 100,
        'carbohydrates_100g': (meal.carbs / meal.quantity) * 100,
        'fat_100g': (meal.fats / meal.quantity) * 100,
      },
      serving_size: `${meal.quantity}g`,
    };
    
    setSelectedProduct(product);
    setQuantity(meal.quantity.toString());
    setMealType(meal.meal_type);
    setShowRecentFavorites(false);
  };

  const toggleFavorite = async (meal) => {
    const isFav = favoriteMeals.some(f => f.name === meal.name);
    if (isFav) {
      const mealToRemove = favoriteMeals.find(f => f.name === meal.name);
      await removeFavoriteMeal(mealToRemove.id);
    } else {
      await addFavoriteMeal(meal);
    }
    await loadRecentAndFavorites();
  };

  const handleSaveMeal = async () => {
    if (!selectedProduct) {
      Alert.alert('Missing Information', 'Please select a product');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity in grams');
      return;
    }

    try {
      setSaving(true);
      const nutrition = extractNutritionData(selectedProduct, quantityNum);
      const productName = formatProductDisplayName(selectedProduct);

      const mealData = {
        date: selectedDate,
        meal_type: mealType,
        name: productName,
        description: selectedProduct.categories ? selectedProduct.categories.split(',')[0] : null,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fats: nutrition.fats,
        quantity: quantityNum,
      };

      await macroAPI.createMeal(mealData);
      
      // Save to recent meals
      await saveRecentMeal(mealData);
      
      Alert.alert('Success', 'Meal added successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving meal:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save meal. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderProductItem = ({ item }) => {
    const isSelected = selectedProduct?.code === item.code;
    const imageUrl = item.image_small_url || item.image_url;

    return (
      <TouchableOpacity
        style={[styles.productItem, isSelected && styles.productItemSelected]}
        onPress={() => handleProductSelect(item)}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, styles.productImagePlaceholder]}>
            <Icon name="food" size={32} color={colors.textTertiary} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {formatProductDisplayName(item)}
          </Text>
          {item.brands && (
            <Text style={styles.productBrand} numberOfLines={1}>
              {item.brands.split(',')[0]}
            </Text>
          )}
          {item.nutriments && (
            <Text style={styles.productNutrition}>
              {Math.round(item.nutriments['energy-kcal_100g'] || item.nutriments['energy-kcal'] || 0)} kcal per 100g
            </Text>
          )}
        </View>
        {isSelected && (
          <Icon name="check-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>Add Meal</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Search Bar with Barcode Scanner */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Icon
              name="magnify"
              size={20}
              color={colors.textTertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for food products..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setProducts([]);
                  setSelectedProduct(null);
                }}
                style={styles.clearButton}
              >
                <Icon name="close-circle" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          {BARCODE_SCANNER_ENABLED && (
            <TouchableOpacity
              style={styles.barcodeButton}
              onPress={() => setShowScanner(true)}
            >
              <Icon name="barcode-scan" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Recent & Favorites - Show when no search */}
          {!loading && searchQuery.trim().length < 2 && !selectedProduct && products.length === 0 && showRecentFavorites && (recentMeals.length > 0 || favoriteMeals.length > 0) && (
            <View style={styles.quickAddSection}>
              <View style={styles.quickAddTabs}>
                <TouchableOpacity
                  style={[styles.quickAddTab, activeQuickTab === 'recent' && styles.quickAddTabActive]}
                  onPress={() => setActiveQuickTab('recent')}
                >
                  <Icon name="history" size={20} color={activeQuickTab === 'recent' ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.quickAddTabText, activeQuickTab === 'recent' && styles.quickAddTabTextActive]}>
                    Recent ({recentMeals.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickAddTab, activeQuickTab === 'favorites' && styles.quickAddTabActive]}
                  onPress={() => setActiveQuickTab('favorites')}
                >
                  <Icon name="star" size={20} color={activeQuickTab === 'favorites' ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.quickAddTabText, activeQuickTab === 'favorites' && styles.quickAddTabTextActive]}>
                    Favorites ({favoriteMeals.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {activeQuickTab === 'recent' && recentMeals.length > 0 && (
                <View style={styles.quickAddList}>
                  {recentMeals.slice(0, 5).map((meal) => (
                    <TouchableOpacity
                      key={meal.id}
                      style={styles.quickAddItem}
                      onPress={() => handleQuickAddMeal(meal)}
                    >
                      <View style={styles.quickAddItemLeft}>
                        <Icon name="food" size={24} color={colors.primary} />
                        <View style={styles.quickAddItemInfo}>
                          <Text style={styles.quickAddItemName} numberOfLines={1}>{meal.name}</Text>
                          <Text style={styles.quickAddItemMacros}>
                            {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => toggleFavorite(meal)}>
                        <Icon
                          name={favoriteMeals.some(f => f.name === meal.name) ? 'star' : 'star-outline'}
                          size={24}
                          color={favoriteMeals.some(f => f.name === meal.name) ? colors.primary : colors.textTertiary}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {activeQuickTab === 'favorites' && favoriteMeals.length > 0 && (
                <View style={styles.quickAddList}>
                  {favoriteMeals.map((meal) => (
                    <TouchableOpacity
                      key={meal.id}
                      style={styles.quickAddItem}
                      onPress={() => handleQuickAddMeal(meal)}
                    >
                      <View style={styles.quickAddItemLeft}>
                        <Icon name="food" size={24} color={colors.primary} />
                        <View style={styles.quickAddItemInfo}>
                          <Text style={styles.quickAddItemName} numberOfLines={1}>{meal.name}</Text>
                          <Text style={styles.quickAddItemMacros}>
                            {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => toggleFavorite(meal)}>
                        <Icon name="star" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {activeQuickTab === 'favorites' && favoriteMeals.length === 0 && (
                <View style={styles.emptyQuickAdd}>
                  <Icon name="star-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyQuickAddText}>No favorite meals yet</Text>
                  <Text style={styles.emptyQuickAddSubtext}>Star meals to add them to favorites</Text>
                </View>
              )}
            </View>
          )}

          {/* Initial State - Show when no search and no recent/favorites */}
          {!loading && searchQuery.trim().length < 2 && !selectedProduct && products.length === 0 && (recentMeals.length === 0 && favoriteMeals.length === 0) && (
            <View style={styles.initialStateContainer}>
              <View style={styles.initialStateIconContainer}>
                <Icon name="magnify" size={64} color={colors.textPrimary} />
              </View>
              <Text style={styles.initialStateTitle}>Search for Food</Text>
              <Text style={styles.initialStateText}>
                Start typing to search for food products from Open Food Facts database
              </Text>
              <Text style={styles.initialStateSubtext}>
                Try searching for: "chicken", "banana", "bread", etc.
              </Text>
            </View>
          )}

        {/* Product List */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching products...</Text>
          </View>
        )}

        {!loading && searchQuery.length >= 2 && products.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="food-off" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        )}

        {!loading && products.length > 0 && (
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Search Results ({products.length})</Text>
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.code || Math.random().toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No products found</Text>
              }
            />
          </View>
        )}

        {/* Selected Product Details */}
        {selectedProduct && (
          <View style={styles.detailsSection}>
            <View style={styles.selectedProductCard}>
              <View style={styles.selectedProductHeader}>
                <Text style={styles.selectedProductName}>
                  {formatProductDisplayName(selectedProduct)}
                </Text>
                <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                  <Icon name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Meal Type Selection */}
              <View style={styles.mealTypeSection}>
                <Text style={styles.label}>Meal Type</Text>
                <View style={styles.mealTypeGrid}>
                  {mealTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.mealTypeButton,
                        mealType === type.value && styles.mealTypeButtonActive,
                      ]}
                      onPress={() => setMealType(type.value)}
                    >
                      <Icon
                        name={type.icon}
                        size={20}
                        color={mealType === type.value ? '#102216' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.mealTypeLabel,
                          mealType === type.value && styles.mealTypeLabelActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Quantity Input */}
              <View style={styles.quantitySection}>
                <Text style={styles.label}>Quantity (grams)</Text>
                <View style={styles.quantityInputContainer}>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="100"
                  />
                  <Text style={styles.quantityUnit}>g</Text>
                </View>
              </View>

              {/* Nutrition Preview */}
              {quantity && !isNaN(parseFloat(quantity)) && (
                <View style={styles.nutritionPreview}>
                  <Text style={styles.nutritionTitle}>Nutrition (per {quantity}g)</Text>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {extractNutritionData(selectedProduct, parseFloat(quantity)).calories}
                      </Text>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {extractNutritionData(selectedProduct, parseFloat(quantity)).protein}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {extractNutritionData(selectedProduct, parseFloat(quantity)).carbs}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {extractNutritionData(selectedProduct, parseFloat(quantity)).fats}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Fats</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Save Button */}
      {selectedProduct && (
        <View style={globalStyles.bottomBar}>
          <Button
            title={saving ? 'Saving...' : 'Add Meal'}
            onPress={handleSaveMeal}
            loading={saving}
            disabled={saving || !quantity || isNaN(parseFloat(quantity))}
          />
        </View>
      )}

      {/* Barcode Scanner Modal */}
      {BARCODE_SCANNER_ENABLED && (
        <BarcodeScannerModal
          visible={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleBarcodeScan}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  barcodeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  initialStateContainer: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    minHeight: 300,
    backgroundColor: 'transparent',
  },
  initialStateIconContainer: {
    marginBottom: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 12,
  },
  initialStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  initialStateSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  productsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  productItemSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.cardBorder,
  },
  productImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  productNutrition: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  detailsSection: {
    marginTop: 24,
  },
  selectedProductCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
  },
  selectedProductHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  mealTypeSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  mealTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealTypeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mealTypeLabelActive: {
    color: '#102216',
    fontWeight: '600',
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  quantityInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.textPrimary,
  },
  quantityUnit: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  nutritionPreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickAddSection: {
    marginBottom: 24,
  },
  quickAddTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickAddTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  quickAddTabActive: {
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    borderColor: colors.primary,
  },
  quickAddTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickAddTabTextActive: {
    color: colors.primary,
  },
  quickAddList: {
    gap: 8,
  },
  quickAddItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
  quickAddItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickAddItemInfo: {
    flex: 1,
  },
  quickAddItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  quickAddItemMacros: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyQuickAdd: {
    padding: 40,
    alignItems: 'center',
  },
  emptyQuickAddText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyQuickAddSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
});

export default AddMealScreen;

