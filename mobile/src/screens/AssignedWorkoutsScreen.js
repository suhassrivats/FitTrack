import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';
import colors from '../styles/colors';
import Button from '../components/Button';
import { classAPI } from '../services/api';

const AssignedWorkoutsScreen = ({ route, navigation }) => {
  // Ensure classId is a number
  const classId = route.params?.classId ? Number(route.params.classId) : null;
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [duration, setDuration] = useState('');
  const [volume, setVolume] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  // Reload workouts when screen comes into focus (e.g., returning from edit screen)
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      
      if (!classId) {
        console.error('No classId provided');
        Alert.alert('Error', 'Class ID is missing');
        return;
      }
      
      console.log('Loading assigned workouts for class:', classId);
      const response = await classAPI.getAssignedWorkouts(classId);
      console.log('Assigned workouts response:', response.data);
      setWorkouts(response.data.assigned_workouts || []);
      setIsInstructor(response.data.is_instructor || false);
    } catch (error) {
      console.error('Error loading workouts:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.error || 'Failed to load workouts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  const openCompleteModal = (workout) => {
    setSelectedWorkout(workout);
    setCompleteModalVisible(true);
  };

  const handleCompleteWorkout = async () => {
    if (!selectedWorkout) return;

    try {
      const response = await classAPI.completeWorkout(classId, selectedWorkout.id, {
        duration: duration ? parseInt(duration) : null,
        total_volume: volume ? parseFloat(volume) : null,
        calories_burned: calories ? parseInt(calories) : null,
        notes: notes,
      });

      Alert.alert('Success', 'Workout completed! Great job! 💪');
      setCompleteModalVisible(false);
      resetForm();
      loadWorkouts();
    } catch (error) {
      console.error('Error completing workout:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.error || 'Failed to complete workout');
    }
  };

  const resetForm = () => {
    setDuration('');
    setVolume('');
    setCalories('');
    setNotes('');
    setSelectedWorkout(null);
  };

  const openEditScreen = (workout) => {
    navigation.navigate('EditAssignedWorkout', { 
      classId, 
      workout 
    });
  };

  const handleDeleteWorkout = (workout) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await classAPI.deleteAssignedWorkout(classId, workout.id);
              Alert.alert('Success', 'Workout deleted successfully');
              loadWorkouts();
            } catch (error) {
              console.error('Error deleting workout:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const renderWorkoutCard = (workout) => {
    const isCompleted = workout.my_log && workout.my_log.completed;
    const isDue = workout.due_date && new Date(workout.due_date) < new Date();

    return (
      <View
        key={workout.id}
        style={[
          styles.workoutCard,
          isCompleted && styles.completedCard,
        ]}
      >
        {/* Header */}
        <View style={styles.workoutHeader}>
          <View style={styles.workoutTitleContainer}>
            <Text style={styles.workoutTitle}>{workout.name}</Text>
            {isCompleted && (
              <Icon name="check-circle" size={24} color={colors.success} />
            )}
          </View>
          <View style={styles.headerActions}>
            {isDue && !isCompleted && (
              <View style={styles.dueBadge}>
                <Text style={styles.dueText}>Overdue</Text>
              </View>
            )}
            {isInstructor && (
              <View style={styles.instructorActions}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => openEditScreen(workout)}
                >
                  <Icon name="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleDeleteWorkout(workout)}
                >
                  <Icon name="delete" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Exercises List */}
        {workout.workout_template?.exercises && workout.workout_template.exercises.length > 0 ? (
          <View style={styles.exercisesList}>
            {workout.workout_template.exercises.map((ex, idx) => (
              <View key={idx} style={styles.exerciseItem}>
                <Icon name="dumbbell" size={16} color={colors.primary} />
                <Text style={styles.exerciseItemText}>
                  {ex.name} - {ex.target_sets || '?'} × {ex.target_reps || '?'}
                </Text>
              </View>
            ))}
          </View>
        ) : workout.description ? (
          <Text style={styles.workoutDescription}>{workout.description}</Text>
        ) : null}

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateItem}>
            <Icon name="calendar" size={14} color={colors.textSecondary} />
            <Text style={styles.dateText}>
              Assigned: {new Date(workout.assigned_date).toLocaleDateString()}
            </Text>
          </View>
          {workout.due_date && (
            <View style={styles.dateItem}>
              <Icon name="clock-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.dateText}>
                Due: {new Date(workout.due_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Completion Info */}
        {isCompleted ? (
          <View style={styles.completionInfo}>
            <Text style={styles.completionTitle}>Completed!</Text>
            <View style={styles.completionStats}>
              {workout.my_log.duration && (
                <View style={styles.statPill}>
                  <Icon name="clock" size={14} color={colors.textSecondary} />
                  <Text style={styles.statPillText}>{workout.my_log.duration} min</Text>
                </View>
              )}
              {workout.my_log.total_volume && (
                <View style={styles.statPill}>
                  <Icon name="weight-kilogram" size={14} color={colors.textSecondary} />
                  <Text style={styles.statPillText}>{workout.my_log.total_volume} kg</Text>
                </View>
              )}
              {workout.my_log.calories_burned && (
                <View style={styles.statPill}>
                  <Icon name="fire" size={14} color={colors.textSecondary} />
                  <Text style={styles.statPillText}>{workout.my_log.calories_burned} kcal</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <Button
            title="Start Workout"
            variant="primary"
            onPress={() => navigation.navigate('LogAssignedWorkout', { 
              classId,
              assignedWorkout: workout 
            })}
            icon={<Icon name="play" size={18} color={colors.buttonPrimaryText} style={{ marginRight: 6 }} />}
          />
        )}
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitleCenter}>Assigned Workouts</Text>
        {isInstructor ? (
          <TouchableOpacity onPress={() => navigation.navigate('AssignWorkout', { classId })}>
            <Icon name="plus-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <View style={globalStyles.centerContent}>
            <Text style={globalStyles.loadingText}>Loading workouts...</Text>
          </View>
        ) : workouts.length === 0 ? (
          <View style={globalStyles.emptyState}>
            <Icon name="dumbbell" size={80} color={colors.textTertiary} />
            <Text style={globalStyles.emptyStateText}>No Workouts Assigned</Text>
            <Text style={globalStyles.emptyStateSubtext}>
              Your instructor hasn't assigned any workouts yet
            </Text>
          </View>
        ) : (
          <View style={styles.workoutsList}>
            {workouts.map(renderWorkoutCard)}
          </View>
        )}
      </ScrollView>

      {/* Complete Workout Modal */}
      <Modal
        visible={completeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setCompleteModalVisible(false);
          resetForm();
        }}
      >
        <TouchableOpacity 
          style={globalStyles.modalContainer}
          activeOpacity={1}
          onPress={() => {
            setCompleteModalVisible(false);
            resetForm();
          }}
        >
          <TouchableOpacity 
            style={globalStyles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>Complete Workout</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('Close complete modal');
                  setCompleteModalVisible(false);
                  resetForm();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalWorkoutName}>{selectedWorkout?.name}</Text>

              <View style={styles.inputGroup}>
                <Text style={globalStyles.inputLabel}>Duration (minutes)</Text>
                <TextInput
                  style={globalStyles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="e.g., 60"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={globalStyles.inputLabel}>Total Volume (kg)</Text>
                <TextInput
                  style={globalStyles.input}
                  value={volume}
                  onChangeText={setVolume}
                  placeholder="e.g., 4500"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={globalStyles.inputLabel}>Calories Burned</Text>
                <TextInput
                  style={globalStyles.input}
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="e.g., 350"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={globalStyles.inputLabel}>Notes (optional)</Text>
                <TextInput
                  style={[globalStyles.input, globalStyles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="How did it go?"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setCompleteModalVisible(false);
                  resetForm();
                }}
                style={styles.modalButton}
              />
              <Button
                title="Complete"
                variant="primary"
                onPress={handleCompleteWorkout}
                style={styles.modalButton}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  workoutsList: {
    gap: 16,
  },
  workoutCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  completedCard: {
    borderColor: colors.success,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  dueBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.buttonPrimaryText,
  },
  workoutDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  exercisesList: {
    gap: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  datesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  completionInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  completionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statPillText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalWorkoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  modalButton: {
    flex: 1,
  },
});

export default AssignedWorkoutsScreen;


