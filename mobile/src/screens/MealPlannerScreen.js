import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';

const MealPlannerScreen = ({ navigation }) => {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const dayMeals = {
    Mon: {
      breakfast: [{ name: 'Oatmeal & Berries', calories: 350 }],
      lunch: [
        { name: 'Grilled Chicken Salad', calories: 450 },
        { name: 'Apple', calories: 95 },
      ],
      dinner: [],
    },
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Meal Planner</Text>
          <Text style={styles.headerSubtitle}>Oct 21 - 27</Text>
        </View>
        <TouchableOpacity>
          <Icon name="arrow-right" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.weekScroll}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.dayColumn}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayText}>{day}</Text>
              <TouchableOpacity>
                <Icon name="content-copy" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Breakfast */}
            <View style={styles.mealCard}>
              <Text style={styles.mealTitle}>Breakfast</Text>
              {dayMeals[day]?.breakfast?.length > 0 ? (
                dayMeals[day].breakfast.map((item, i) => (
                  <View key={i} style={styles.mealItem}>
                    <Text style={styles.mealItemName}>{item.name}</Text>
                    <Text style={styles.mealItemCalories}>{item.calories} kcal</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>Drag a food item here</Text>
                  <TouchableOpacity style={styles.addFoodButton}>
                    <Icon name="plus" size={16} color={colors.primary} />
                    <Text style={styles.addFoodText}>Add Food</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Lunch */}
            <View style={styles.mealCard}>
              <Text style={styles.mealTitle}>Lunch</Text>
              {dayMeals[day]?.lunch?.length > 0 ? (
                dayMeals[day].lunch.map((item, i) => (
                  <View key={i} style={styles.mealItem}>
                    <Text style={styles.mealItemName}>{item.name}</Text>
                    <Text style={styles.mealItemCalories}>{item.calories} kcal</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>Drag a food item here</Text>
                  <TouchableOpacity style={styles.addFoodButton}>
                    <Icon name="plus" size={16} color={colors.primary} />
                    <Text style={styles.addFoodText}>Add Food</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Dinner */}
            <View style={styles.mealCard}>
              <Text style={styles.mealTitle}>Dinner</Text>
              {dayMeals[day]?.dinner?.length > 0 ? (
                dayMeals[day].dinner.map((item, i) => (
                  <View key={i} style={styles.mealItem}>
                    <Text style={styles.mealItemName}>{item.name}</Text>
                    <Text style={styles.mealItemCalories}>{item.calories} kcal</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>Drag a food item here</Text>
                  <TouchableOpacity style={styles.addFoodButton}>
                    <Icon name="plus" size={16} color={colors.primary} />
                    <Text style={styles.addFoodText}>Add Food</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Macro Summary */}
            <View style={styles.macroSummary}>
              <Text style={styles.macroSummaryTitle}>Daily Totals</Text>
              <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>110g / 150g</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '73%', backgroundColor: colors.primary }]} />
              </View>
              <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>145g / 200g</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '72%', backgroundColor: '#F5A623' }]} />
              </View>
              <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValue}>40g / 60g</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '66%', backgroundColor: '#ef4444' }]} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="cart" size={32} color="#102216" />
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
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  weekScroll: {
    flex: 1,
  },
  dayColumn: {
    width: 288,
    padding: 16,
    gap: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  mealCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    padding: 8,
  },
  mealItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  mealItemCalories: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  emptySlot: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptySlotText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  addFoodText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  macroSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  macroSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  macroValue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.backgroundDark,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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

export default MealPlannerScreen;

