import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import Button from '../components/Button';

const MacroTrackingScreen = ({ navigation }) => {
  const calorieGoal = 2400;
  const caloriesConsumed = 1650;
  const caloriesRemaining = calorieGoal - caloriesConsumed;
  const progress = (caloriesConsumed / calorieGoal) * 100;

  const macros = {
    protein: { consumed: 120, goal: 160, color: '#4A90E2' },
    carbs: { consumed: 150, goal: 300, color: '#F5A623' },
    fats: { consumed: 64, goal: 80, color: '#9013FE' },
  };

  const meals = [
    {
      type: 'Breakfast',
      items: [
        { name: 'Scrambled Eggs (2)', calories: 180 },
        { name: 'Whole Wheat Toast', calories: 80 },
      ],
    },
    {
      type: 'Lunch',
      items: [{ name: 'Chicken Salad', calories: 450 }],
    },
  ];

  const CircularProgress = ({ size, strokeWidth, progress, color }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <Circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tuesday, Oct 26</Text>
        <TouchableOpacity>
          <Icon name="chevron-right" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calorie Tracker */}
        <View style={styles.calorieTracker}>
          <View style={styles.circleContainer}>
            <CircularProgress
              size={192}
              strokeWidth={8}
              progress={100 - (caloriesRemaining / calorieGoal) * 100}
              color={colors.primary}
            />
            <View style={styles.circleContent}>
              <Text style={styles.calorieValue}>{caloriesRemaining}</Text>
              <Text style={styles.calorieLabel}>Remaining</Text>
            </View>
          </View>

          <View style={styles.calorieInfo}>
            <View style={styles.calorieInfoItem}>
              <Text style={styles.calorieInfoLabel}>Consumed</Text>
              <Text style={styles.calorieInfoValue}>{caloriesConsumed}</Text>
            </View>
            <View style={styles.calorieInfoItem}>
              <Text style={styles.calorieInfoLabel}>Goal</Text>
              <Text style={styles.calorieInfoValue}>{calorieGoal}</Text>
            </View>
          </View>
        </View>

        {/* Macro Breakdown */}
        <View style={styles.macroBreakdown}>
          {Object.entries(macros).map(([key, value]) => (
            <View key={key} style={styles.macroCard}>
              <Text style={[styles.macroLabel, { color: value.color }]}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(value.consumed / value.goal) * 100}%`,
                      backgroundColor: value.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.macroValue}>
                {value.consumed}g / {value.goal}g
              </Text>
            </View>
          ))}
        </View>

        {/* Food Recommendations */}
        <View style={styles.recommendations}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.recommendationTitle}>Need more Protein?</Text>
            <TouchableOpacity>
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.recommendationItem}>
            <View style={styles.recommendationImage}>
              <Icon name="food" size={32} color={colors.primary} />
            </View>
            <View style={styles.recommendationInfo}>
              <Text style={styles.recommendationName}>Protein Shake</Text>
              <Text style={styles.recommendationDetails}>25g Protein, 150 kcal</Text>
            </View>
            <TouchableOpacity style={styles.recommendationAddButton}>
              <Icon name="plus" size={20} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recommendationItem}>
            <View style={styles.recommendationImage}>
              <Icon name="food-drumstick" size={32} color={colors.primary} />
            </View>
            <View style={styles.recommendationInfo}>
              <Text style={styles.recommendationName}>Grilled Chicken Breast</Text>
              <Text style={styles.recommendationDetails}>31g Protein, 165 kcal</Text>
            </View>
            <TouchableOpacity style={styles.recommendationAddButton}>
              <Icon name="plus" size={20} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Meal Log */}
        <View style={styles.mealLog}>
          <Text style={styles.sectionTitle}>Today's Log</Text>

          {meals.map((meal, index) => (
            <View key={index} style={styles.mealSection}>
              <Text style={styles.mealType}>{meal.type}</Text>
              {meal.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.mealItem}>
                  <Text style={styles.mealItemName}>{item.name}</Text>
                  <Text style={styles.mealItemCalories}>{item.calories} kcal</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <Button
          title="Log Food"
          onPress={() => navigation.navigate('FoodRecommendations')}
          icon={<Icon name="plus" size={20} color="#102216" style={{ marginRight: 8 }} />}
          style={styles.fab}
        />
      </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  calorieTracker: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 24,
    alignItems: 'center',
  },
  circleContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  circleContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  calorieLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  calorieInfo: {
    flexDirection: 'row',
    gap: 48,
  },
  calorieInfoItem: {
    alignItems: 'center',
  },
  calorieInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  calorieInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  macroBreakdown: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  macroCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroValue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recommendations: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  recommendationImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  recommendationDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recommendationAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealLog: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  mealSection: {
    marginBottom: 16,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  mealItemName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  mealItemCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  fab: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default MacroTrackingScreen;

