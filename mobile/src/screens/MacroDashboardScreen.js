import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import { styles } from '../styles/MacroDashboardScreenStyles';
import { macroAPI } from '../services/api';

const MacroDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'monthly'
  const [dashboardData, setDashboardData] = useState(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await macroAPI.getDashboard(dateStr);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading macro dashboard:', error);
      Alert.alert('Error', 'Failed to load macro dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Reload when screen comes into focus or date changes
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [selectedDate])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const navigateToNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    handleDateChange(nextDate);
  };

  const navigateToPrevDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    handleDateChange(prevDate);
  };

  // Get meal icon based on meal type
  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: 'food-egg',
      lunch: 'food',
      dinner: 'food-variant',
      snack: 'food-apple',
    };
    return icons[mealType.toLowerCase()] || 'food';
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + i);
      const today = new Date();
      days.push({
        day: date.getDate(),
        dayName: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()],
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        date: date,
      });
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  const getProgressBarWidth = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  if (loading && !dashboardData) {
    return (
      <View style={globalStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Extract data from API response
  const goal = dashboardData?.goal || { calories: 2450, protein: 245, carbs: 215, fats: 68, plan_name: 'High Protein' };
  const dailyIntake = dashboardData?.daily_intake || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0 };
  const adherence = dashboardData?.adherence || { status: 'On Track', protein: { met: false, status: 'Low Intake' }, carbs: { met: false, status: 'Low Intake' }, fats: { met: false, status: 'Low Intake' } };
  const meals = dashboardData?.meals || [];
  const trends = dashboardData?.trends || [];

  const dailyProgress = {
    current: dailyIntake.total_calories || 0,
    goal: goal.calories || 2450,
    percentage: goal.calories > 0 ? (dailyIntake.total_calories / goal.calories) * 100 : 0,
  };

  const macroGoals = {
    protein: { current: dailyIntake.total_protein || 0, goal: goal.protein || 245, color: colors.primary },
    carbs: { current: dailyIntake.total_carbs || 0, goal: goal.carbs || 215, color: '#00d4ff' },
    fats: { current: dailyIntake.total_fats || 0, goal: goal.fats || 68, color: '#a855f7' },
  };

  const remainingIntake = {
    remaining: Math.max(0, goal.calories - dailyIntake.total_calories),
    eaten: dailyIntake.total_calories || 0,
  };

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Macro Dashboard</Text>
        <TouchableOpacity onPress={navigateToNextDay}>
          <Icon name="arrow-right" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Date Selector */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendarStrip}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.calendarDay, (day.isToday || day.isSelected) && styles.calendarDayActive]}
                onPress={() => handleDateChange(day.date)}
              >
                <Text style={[styles.calendarDayName, (day.isToday || day.isSelected) && styles.calendarDayNameActive]}>
                  {day.dayName}
                </Text>
                <Text style={[styles.calendarDayNumber, (day.isToday || day.isSelected) && styles.calendarDayNumberActive]}>
                  {day.day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Planned Goals Active Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.iconContainer}>
                <Icon name="calendar-check" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Planned Goals Active</Text>
                <Text style={styles.cardSubtitle}>Following your '{goal.plan_name}' plan for today.</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.adjustButton}
            onPress={() => {
              // TODO: Navigate to plan adjustment screen
              // Placeholder alert removed after testing.
            }}
          >
            <Text style={styles.adjustButtonText}>Adjust Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Progress</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${dailyProgress.percentage}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Current Intake</Text>
            <Text style={styles.progressLabel}>Goal Target</Text>
          </View>
          <Text style={styles.progressValue}>
            {dailyProgress.current.toLocaleString()} / {dailyProgress.goal.toLocaleString()} kcal
          </Text>
        </View>

        {/* Adherence Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Adherence Summary</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{adherence.status}</Text>
            </View>
          </View>
          <View style={styles.adherenceList}>
            <View style={styles.adherenceItem}>
              <Icon
                name={adherence.protein.met ? 'check-circle' : 'minus-circle'}
                size={20}
                color={adherence.protein.met ? colors.primary : '#f5a623'}
              />
              <Text style={styles.adherenceLabel}>Protein</Text>
              <Text style={styles.adherenceStatus}>{adherence.protein.status}</Text>
            </View>
            <View style={styles.adherenceItem}>
              <Icon
                name={adherence.carbs.met ? 'check-circle' : 'minus-circle'}
                size={20}
                color={adherence.carbs.met ? colors.primary : '#f5a623'}
              />
              <Text style={styles.adherenceLabel}>Carbs</Text>
              <Text style={styles.adherenceStatus}>{adherence.carbs.status}</Text>
            </View>
            <View style={styles.adherenceItem}>
              <Icon
                name={adherence.fats.met ? 'check-circle' : 'minus-circle'}
                size={20}
                color={adherence.fats.met ? colors.primary : '#f5a623'}
              />
              <Text style={styles.adherenceLabel}>Fats</Text>
              <Text style={styles.adherenceStatus}>{adherence.fats.status}</Text>
            </View>
          </View>
        </View>

        {/* Remaining Intake */}
        <View style={styles.card}>
          <View style={styles.intakeHeader}>
            <View>
              <Text style={styles.intakeLabel}>Remaining Intake</Text>
              <Text style={styles.intakeValue}>{remainingIntake.remaining.toLocaleString()} kcal left</Text>
            </View>
            <View style={styles.intakeRight}>
              <Text style={styles.intakeLabel}>Eaten</Text>
              <Text style={styles.intakeValue}>{remainingIntake.eaten.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.macroProgressList}>
            {Object.entries(macroGoals).map(([key, macro]) => (
              <View key={key} style={styles.macroProgressItem}>
                <View style={styles.macroProgressHeader}>
                  <Text style={styles.macroProgressLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <Text style={styles.macroProgressValue}>
                    {macro.current}g / {macro.goal}g planned
                  </Text>
                </View>
                <View style={styles.macroProgressBarContainer}>
                  <View
                    style={[
                      styles.macroProgressBar,
                      { width: `${getProgressBarWidth(macro.current, macro.goal)}%`, backgroundColor: macro.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Macro Trends */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Macro Trends</Text>
              <Text style={styles.cardSubtitle}>Last 7 days adherence</Text>
            </View>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'weekly' && styles.toggleButtonActive]}
                onPress={() => setViewMode('weekly')}
              >
                <Text style={[styles.toggleText, viewMode === 'weekly' && styles.toggleTextActive]}>
                  Weekly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'monthly' && styles.toggleButtonActive]}
                onPress={() => setViewMode('monthly')}
              >
                <Text style={[styles.toggleText, viewMode === 'monthly' && styles.toggleTextActive]}>
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.trendsGraph}>
            {trends.map((trend, index) => {
              const date = new Date(trend.date);
              const dayName = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
              const isToday = date.toDateString() === new Date().toDateString();
              const statusColors = {
                met: colors.primary,
                over: '#f5a623',
                under: '#ef4444',
                none: colors.cardBg,
              };
              return (
                <View key={index} style={styles.trendDay}>
                  <Text style={styles.trendDayLabel}>{dayName}</Text>
                  <View
                    style={[
                      styles.trendBar,
                      { 
                        backgroundColor: statusColors[trend.status] || colors.cardBg,
                        height: trend.status === 'none' ? 20 : trend.status === 'met' ? 40 : 30,
                      },
                    ]}
                  />
                  {trend.status !== 'none' && (
                    <View style={styles.trendDot}>
                      <Icon 
                        name="circle" 
                        size={8} 
                        color={statusColors[trend.status] || colors.primary} 
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Today's Meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity 
              style={styles.addFoodButton}
              onPress={() => {
                // TODO: Navigate to add meal screen
                // Placeholder alert removed after testing.
              }}
            >
              <Text style={styles.addFoodButtonText}>Add Food</Text>
            </TouchableOpacity>
          </View>
          {meals.length === 0 ? (
            <View style={[globalStyles.card, globalStyles.alignCenter, globalStyles.gap12]}>
              <Icon name="food-off" size={48} color={colors.textTertiary} />
              <Text style={globalStyles.emptyStateText}>No meals logged yet</Text>
              <Text style={globalStyles.emptyStateSubtext}>Tap "Add Food" to log your first meal</Text>
            </View>
          ) : (
            meals.map((meal) => (
              <TouchableOpacity 
                key={meal.id} 
                style={styles.mealCard}
                onPress={() => {
                  // TODO: Navigate to meal details/edit screen
                  // Placeholder alert removed after testing.
                }}
              >
                <View style={styles.mealIcon}>
                  <Icon name={getMealIcon(meal.meal_type)} size={24} color={colors.primary} />
                </View>
                <View style={styles.mealContent}>
                  <Text style={styles.mealName}>{meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}</Text>
                  <Text style={styles.mealDescription}>{meal.name}</Text>
                  {meal.description && (
                    <Text style={styles.mealDescription}>{meal.description}</Text>
                  )}
                  <Text style={styles.mealMacros}>
                    P: {Math.round(meal.protein)}g C: {Math.round(meal.carbs)}g F: {Math.round(meal.fats)}g
                  </Text>
                </View>
                <View style={styles.mealCalories}>
                  <Text style={styles.mealCaloriesValue}>{Math.round(meal.calories)} kcal</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default MacroDashboardScreen;

