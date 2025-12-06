import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SectionList,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import { workoutAPI } from '../services/api';

const HistoryScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, week, month

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('History screen focused - loading workouts...');
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const response = await workoutAPI.getWorkouts();
      console.log('Loaded workouts:', response.data.workouts);
      setWorkouts(response.data.workouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const deleteWorkout = async (workoutId) => {
    try {
      await workoutAPI.deleteWorkout(workoutId);
      alert('Workout deleted successfully');
      loadWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
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
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const groupWorkoutsByDate = () => {
    const groups = {};
    
    workouts.forEach((workout) => {
      const dateKey = new Date(workout.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = {
          title: formatDate(workout.date),
          date: workout.date,
          data: [],
        };
      }
      groups[dateKey].data.push(workout);
    });

    return Object.values(groups).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  };

  const getWorkoutStats = (workout) => {
    const exerciseCount = workout.exercises?.length || 0;
    const totalSets = workout.exercises?.reduce(
      (sum, ex) => sum + (ex.sets?.length || 0), 
      0
    ) || 0;
    
    return {
      exerciseCount,
      totalSets,
      duration: workout.duration || 0,
      volume: Math.round(workout.total_volume || 0),
    };
  };

  if (loading) {
    return (
      <View style={globalStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.loadingText}>Loading workout history...</Text>
      </View>
    );
  }

  const sections = groupWorkoutsByDate();

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout History</Text>
        <View style={styles.headerRight}>
          <Text style={styles.totalCount}>{workouts.length} Total</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'week' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('week')}
        >
          <Text style={[styles.filterText, selectedFilter === 'week' && styles.filterTextActive]}>
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'month' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('month')}
        >
          <Text style={[styles.filterText, selectedFilter === 'month' && styles.filterTextActive]}>
            This Month
          </Text>
        </TouchableOpacity>
      </View>

      {workouts.length === 0 ? (
        <View style={globalStyles.emptyState}>
          <Icon name="history" size={64} color={colors.textTertiary} />
          <Text style={globalStyles.emptyStateText}>No workout history yet</Text>
          <Text style={globalStyles.emptyStateSubtext}>
            Complete your first workout to see it here!
          </Text>
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={() => navigation.navigate('LogWorkout')}
          >
            <Icon name="plus" size={20} color="#102216" />
            <Text style={styles.startWorkoutText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
              <Text style={styles.sectionHeaderCount}>
                {section.data.length} workout{section.data.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const stats = getWorkoutStats(item);
            return (
              <TouchableOpacity
                style={styles.workoutCard}
                onPress={() => navigation.navigate('LogWorkout', { workoutId: item.id })}
              >
                <View style={styles.workoutHeader}>
                  <View style={styles.workoutIcon}>
                    <Icon name="dumbbell" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{item.name}</Text>
                    <View style={styles.workoutMeta}>
                      <View style={styles.metaItem}>
                        <Icon name="weight-lifter" size={14} color={colors.textTertiary} />
                        <Text style={styles.metaText}>
                          {stats.exerciseCount} exercises
                        </Text>
                      </View>
                      <View style={styles.metaDivider} />
                      <View style={styles.metaItem}>
                        <Icon name="counter" size={14} color={colors.textTertiary} />
                        <Text style={styles.metaText}>
                          {stats.totalSets} sets
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (Platform.OS === 'web') {
                        if (window.confirm(`Delete "${item.name}"?`)) {
                          deleteWorkout(item.id);
                        }
                      } else {
                        Alert.alert(
                          'Delete Workout',
                          `Delete "${item.name}"?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Delete', 
                              style: 'destructive',
                              onPress: () => deleteWorkout(item.id)
                            },
                          ]
                        );
                      }
                    }}
                  >
                    <Icon name="delete-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.workoutStats}>
                  <View style={styles.statItem}>
                    <Icon name="timer-outline" size={18} color={colors.primary} />
                    <Text style={styles.statText}>{stats.duration} min</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="dumbbell" size={18} color={colors.primary} />
                    <Text style={styles.statText}>{stats.volume} kg</Text>
                  </View>
                </View>

                {/* Exercise List */}
                {item.exercises && item.exercises.length > 0 && (
                  <View style={styles.exerciseList}>
                    {item.exercises.slice(0, 3).map((ex, idx) => (
                      <View key={idx} style={styles.exerciseChip}>
                        <Text style={styles.exerciseChipText} numberOfLines={1}>
                          {ex.exercise?.name || 'Unknown Exercise'}
                        </Text>
                        <Text style={styles.exerciseSets}>
                          {ex.sets?.length || 0} sets
                        </Text>
                      </View>
                    ))}
                    {item.exercises.length > 3 && (
                      <Text style={styles.moreExercises}>
                        +{item.exercises.length - 3} more
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  totalCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#102216',
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: colors.backgroundDark,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  sectionHeaderCount: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  workoutCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.cardBorder,
  },
  metaText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  deleteButton: {
    padding: 4,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  exerciseList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  exerciseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  exerciseChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    maxWidth: 120,
  },
  exerciseSets: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  moreExercises: {
    fontSize: 12,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    marginTop: 16,
  },
  startWorkoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#102216',
  },
});

export default HistoryScreen;

