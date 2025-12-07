import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import Button from '../components/Button';
import { workoutAPI } from '../services/api';
import { styles } from '../styles/DashboardScreenStyles';

const DashboardScreen = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Dashboard focused - reloading data...');
      loadDashboardData();
    }, [])
  );

  // Also reload when route params change (manual refresh trigger)
  useEffect(() => {
    if (route?.params?.refresh) {
      console.log('Refresh param detected - reloading...');
      loadDashboardData();
    }
  }, [route?.params?.refresh]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      const [statsRes, routinesRes, workoutsRes] = await Promise.all([
        workoutAPI.getStats(),
        workoutAPI.getRoutines(),
        workoutAPI.getWorkouts(),
      ]);

      console.log('Stats:', statsRes.data.stats);
      console.log('Routines:', routinesRes.data.routines);
      console.log('Recent workouts:', workoutsRes.data.workouts);

      setStats(statsRes.data.stats);
      setRoutines(routinesRes.data.routines);
      setRecentWorkouts(workoutsRes.data.workouts.slice(0, 3)); // Show only 3 most recent
    } catch (error) {
      console.error('Error loading dashboard:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const daysAgo = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      if (daysAgo < 7) {
        return `${daysAgo} days ago`;
      }
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: 'https://via.placeholder.com/48' }}
            style={styles.avatar}
          />
          <Text style={styles.greeting}>Hello, {stats?.user?.full_name || stats?.user?.username || 'Welcome'}!</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell-outline" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Last Workout</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {stats?.last_workout?.name || 'No workouts yet'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Workouts</Text>
            <Text style={styles.statValue}>
              {stats?.total_workouts || 0}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Volume</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {stats?.total_volume ? `${Math.round(stats.total_volume)} kg` : '0 kg'}
            </Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Recent Activity</Text>
          {recentWorkouts.length === 0 ? (
            <View style={[globalStyles.card, globalStyles.alignCenter, globalStyles.gap12]}>
              <Icon name="dumbbell" size={48} color={colors.textTertiary} />
              <Text style={globalStyles.emptyStateText}>No workouts logged yet</Text>
              <Text style={globalStyles.emptyStateSubtext}>Start your first workout below!</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activityScroll}
            >
              {recentWorkouts.map((workout, index) => (
                <TouchableOpacity 
                  key={workout.id || index} 
                  style={styles.activityCard}
                  onPress={() => navigation.navigate('LogWorkout', { workoutId: workout.id })}
                >
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>{workout.name}</Text>
                    <Text style={styles.activityDate}>
                      {formatDate(workout.date)}
                    </Text>
                  </View>
                  <View style={styles.activityStats}>
                    <View style={styles.activityStat}>
                      <Icon name="timer-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.activityStatText}>
                        {workout.duration || 0} min
                      </Text>
                    </View>
                    <View style={styles.activityStat}>
                      <Icon name="dumbbell" size={16} color={colors.textSecondary} />
                      <Text style={styles.activityStatText}>
                        {Math.round(workout.total_volume || 0)} kg
                      </Text>
                    </View>
                  </View>
                  <View style={styles.exerciseCount}>
                    <Text style={styles.exerciseCountText}>
                      {workout.exercises?.length || 0} exercises
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* My Routines */}
        <View style={globalStyles.section}>
          <View style={globalStyles.sectionHeader}>
            <Text style={globalStyles.sectionTitle}>My Routines</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CreateRoutine')}>
              <Text style={styles.seeAllButton}>+ Create</Text>
            </TouchableOpacity>
          </View>

          {routines.length === 0 ? (
            <View style={styles.emptyRoutines}>
              <Icon name="clipboard-list-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyRoutinesText}>No routines created yet</Text>
              <TouchableOpacity
                style={styles.createRoutineButton}
                onPress={() => navigation.navigate('CreateRoutine')}
              >
                <Icon name="plus" size={18} color={colors.primary} />
                <Text style={styles.createRoutineText}>Create Your First Routine</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {routines.slice(0, 3).map((routine, index) => (
                <TouchableOpacity 
                  key={routine.id || index} 
                  style={styles.routineCard}
                  onPress={() => {
                    console.log('Starting workout from routine:', routine.name);
                    navigation.navigate('LogWorkout', { 
                      routineId: routine.id,
                      routineName: routine.name 
                    });
                  }}
                >
                  <View style={styles.routineLeft}>
                    <View style={styles.routineIcon}>
                      <Icon name={routine.icon || 'dumbbell'} size={24} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.routineName}>{routine.name}</Text>
                      <Text style={styles.routineDetail}>
                        {routine.exercise_count} Exercises
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={24} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <Button
          title="Start Cross-Training"
          onPress={() => navigation.navigate('LogWorkout')}
          icon={<Icon name="plus" size={20} color="#102216" style={{ marginRight: 8 }} />}
          style={styles.fab}
        />
      </View>
    </View>
  );
};

export default DashboardScreen;

