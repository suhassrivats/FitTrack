import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_MEALS_KEY = '@fittrack_recent_meals';
const FAVORITE_MEALS_KEY = '@fittrack_favorite_meals';
const MAX_RECENT_MEALS = 20;

/**
 * Save a meal to recent meals
 * @param {Object} mealData - Meal data to save
 */
export const saveRecentMeal = async (mealData) => {
  try {
    const existing = await getRecentMeals();
    
    // Add timestamp and unique ID
    const mealWithMeta = {
      ...mealData,
      savedAt: new Date().toISOString(),
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    // Remove if already exists (by name) and add to front
    const filtered = existing.filter(m => m.name !== mealData.name);
    const updated = [mealWithMeta, ...filtered].slice(0, MAX_RECENT_MEALS);
    
    await AsyncStorage.setItem(RECENT_MEALS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving recent meal:', error);
    return [];
  }
};

/**
 * Get recent meals
 * @returns {Promise<Array>} Array of recent meals
 */
export const getRecentMeals = async () => {
  try {
    const data = await AsyncStorage.getItem(RECENT_MEALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting recent meals:', error);
    return [];
  }
};

/**
 * Clear recent meals
 */
export const clearRecentMeals = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_MEALS_KEY);
  } catch (error) {
    console.error('Error clearing recent meals:', error);
  }
};

/**
 * Add meal to favorites
 * @param {Object} mealData - Meal data to favorite
 */
export const addFavoriteMeal = async (mealData) => {
  try {
    const existing = await getFavoriteMeals();
    
    // Check if already favorited
    if (existing.some(m => m.name === mealData.name)) {
      return existing;
    }
    
    const mealWithMeta = {
      ...mealData,
      favoritedAt: new Date().toISOString(),
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    const updated = [mealWithMeta, ...existing];
    await AsyncStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error adding favorite meal:', error);
    return [];
  }
};

/**
 * Remove meal from favorites
 * @param {string} mealId - ID of meal to remove
 */
export const removeFavoriteMeal = async (mealId) => {
  try {
    const existing = await getFavoriteMeals();
    const updated = existing.filter(m => m.id !== mealId);
    await AsyncStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error removing favorite meal:', error);
    return [];
  }
};

/**
 * Get favorite meals
 * @returns {Promise<Array>} Array of favorite meals
 */
export const getFavoriteMeals = async () => {
  try {
    const data = await AsyncStorage.getItem(FAVORITE_MEALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorite meals:', error);
    return [];
  }
};

/**
 * Check if meal is favorited
 * @param {string} mealName - Name of the meal
 * @returns {Promise<boolean>} True if favorited
 */
export const isMealFavorited = async (mealName) => {
  try {
    const favorites = await getFavoriteMeals();
    return favorites.some(m => m.name === mealName);
  } catch (error) {
    console.error('Error checking if meal is favorited:', error);
    return false;
  }
};

