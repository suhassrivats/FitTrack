import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import Button from '../components/Button';
import { workoutAPI } from '../services/api';
import { styles } from '../styles/DashboardScreenStyles';

const WorkoutDashboardContent = ({ navigation, stats: initialStats }) => {
  const [stats, setStats] = useState(initialStats);
  const [routines, setRoutines] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);

  useEffect(() => {
    loadWorkoutData();
  }, []);

  const loadWorkoutData = async () => {
    try {
      const [statsRes, routinesRes, workoutsRes] = await Promise.all([
        workoutAPI.getStats(),
        workoutAPI.getRoutines(),
        workoutAPI.getWorkouts(),
      ]);

      setStats(statsRes.data.stats);
      setRoutines(routinesRes.data.routines);
      setRecentWorkouts(workoutsRes.data.workouts.slice(0, 3));
    } catch (error) {
      console.error('Error loading workout data:', error);
    }
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

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
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

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <Button
          title="Start Cross-Training"
          onPress={() => navigation.navigate('LogWorkout')}
          icon={<Icon name="plus" size={20} color="#102216" style={{ marginRight: 8 }} />}
          style={styles.fab}
        />
      </View>
    </ScrollView>
  );
};

export default WorkoutDashboardContent;

