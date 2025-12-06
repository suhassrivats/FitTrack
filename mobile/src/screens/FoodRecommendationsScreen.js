import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';

const FoodRecommendationsScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  
  const macroGoals = {
    protein: { current: 80, total: 160 },
    carbs: { current: 120, total: 240 },
    fat: { current: 45, total: 80 },
  };

  const recommendations = [
    {
      name: 'Grilled Chicken Salad',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      tags: ['High Protein', 'Under 30 mins'],
      tagColors: ['primary', 'warning'],
      protein: 40,
      carbs: 25,
      fat: 15,
      calories: 500,
    },
    {
      name: 'Protein Oatmeal',
      image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400',
      tags: ['High Fiber', 'Quick Prep'],
      tagColors: ['primary', 'warning'],
      protein: 25,
      carbs: 55,
      fat: 10,
      calories: 410,
    },
    {
      name: 'Salmon with Quinoa',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      tags: ['High Protein', 'Low Carb'],
      tagColors: ['primary', 'error'],
      protein: 45,
      carbs: 30,
      fat: 20,
      calories: 580,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today's Suggestions</Text>
        <TouchableOpacity>
          <Icon name="bell-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food or recipes"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterChip,
                selectedFilter === filter.toLowerCase() && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.toLowerCase())}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.toLowerCase() && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Macro Summary */}
        <View style={styles.macroSummary}>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>
              {macroGoals.protein.current}g left
            </Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>
              {macroGoals.carbs.current}g left
            </Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>
              {macroGoals.fat.current}g left
            </Text>
          </View>
        </View>

        {/* Recommendation Cards */}
        <View style={styles.recommendations}>
          {recommendations.map((item, index) => (
            <View key={index} style={styles.recommendationCard}>
              <Image source={{ uri: item.image }} style={styles.foodImage} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <View style={styles.tags}>
                      {item.tags.map((tag, tagIndex) => (
                        <View
                          key={tagIndex}
                          style={[
                            styles.tag,
                            item.tagColors[tagIndex] === 'primary' && styles.tagPrimary,
                            item.tagColors[tagIndex] === 'warning' && styles.tagWarning,
                            item.tagColors[tagIndex] === 'error' && styles.tagError,
                          ]}
                        >
                          <Text
                            style={[
                              styles.tagText,
                              item.tagColors[tagIndex] === 'primary' && styles.tagTextPrimary,
                              item.tagColors[tagIndex] === 'warning' && styles.tagTextWarning,
                              item.tagColors[tagIndex] === 'error' && styles.tagTextError,
                            ]}
                          >
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.addButton}>
                    <Icon name="plus" size={20} color="#102216" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.macroInfo}>
                  P: {item.protein}g, C: {item.carbs}g, F: {item.fat}g, {item.calories} Kcal
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="plus" size={32} color="#102216" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  filterTextActive: {
    color: '#102216',
  },
  macroSummary: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  macroCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  macroLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  recommendations: {
    paddingHorizontal: 16,
    gap: 16,
  },
  recommendationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardLeft: {
    flex: 1,
    gap: 8,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagPrimary: {
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
  },
  tagWarning: {
    backgroundColor: 'rgba(245, 166, 35, 0.2)',
  },
  tagError: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagTextPrimary: {
    color: colors.primary,
  },
  tagTextWarning: {
    color: '#f5a623',
  },
  tagTextError: {
    color: '#ef4444',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroInfo: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default FoodRecommendationsScreen;

