import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import Button from '../components/Button';
import { workoutAPI, exerciseAPI } from '../services/api';
import { getWeightUnit } from '../utils/units';

const LogWorkoutScreen = ({ navigation, route }) => {
  const workoutId = route?.params?.workoutId;
  const routineId = route?.params?.routineId;
  const routineName = route?.params?.routineName;
  
  const [workoutName, setWorkoutName] = useState(routineName || 'New Workout');
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showCustomExerciseModal, setShowCustomExerciseModal] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weightUnit, setWeightUnit] = useState('kg');

  // Timer effect - only runs when timerRunning is true
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Reset timer to 00:00:00?')) {
        setTimer(0);
        setTimerRunning(false);
      }
    } else {
      Alert.alert(
        'Reset Timer',
        'Reset timer to 00:00:00?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reset', 
            style: 'destructive',
            onPress: () => {
              setTimer(0);
              setTimerRunning(false);
            }
          },
        ]
      );
    }
  };

  // Load workout or routine
  useEffect(() => {
    if (workoutId) {
      loadWorkout();
    } else if (routineId) {
      loadRoutine();
    }
    loadAvailableExercises();
    loadWeightUnit();
  }, [workoutId, routineId]);

  const loadWeightUnit = async () => {
    const unit = await getWeightUnit();
    setWeightUnit(unit);
  };

  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadWorkout = async () => {
    try {
      setLoading(true);
      const response = await workoutAPI.getWorkout(workoutId);
      const workout = response.data.workout;
      setWorkoutName(workout.name);
      setTimer(workout.duration * 60 || 0);
      
      // Transform API data to local state format
      const transformedExercises = workout.exercises.map((ex) => {
        // Handle both regular exercises and custom exercises
        const isCustom = !ex.exercise && ex.custom_exercise_name;
        return {
          exercise_id: isCustom ? null : ex.exercise?.id,
          name: isCustom ? ex.custom_exercise_name : ex.exercise?.name,
          is_custom: isCustom,
          sets: ex.sets.map((s) => ({
            id: s.id,
            number: s.set_number,
            weight: s.weight?.toString() || '',
            reps: s.reps?.toString() || '',
            completed: s.completed,
          })),
        };
      });
      setExercises(transformedExercises);
    } catch (error) {
      console.error('Error loading workout:', error);
      Alert.alert('Error', 'Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableExercises = async () => {
    try {
      const response = await exerciseAPI.getExercises();
      setAvailableExercises(response.data.exercises);
      setFilteredExercises(response.data.exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  // Filter exercises based on search query
  useEffect(() => {
    if (exerciseSearchQuery.trim() === '') {
      setFilteredExercises(availableExercises);
    } else {
      const query = exerciseSearchQuery.toLowerCase();
      const filtered = availableExercises.filter(exercise => {
        // Search in name
        if (exercise.name && exercise.name.toLowerCase().includes(query)) {
          return true;
        }
        // Search in description
        if (exercise.description && exercise.description.toLowerCase().includes(query)) {
          return true;
        }
        // Search in category
        if (exercise.category && exercise.category.toLowerCase().includes(query)) {
          return true;
        }
        // Search in muscle groups (can be array or comma-separated string)
        if (exercise.muscle_groups) {
          const muscleGroupsStr = Array.isArray(exercise.muscle_groups)
            ? exercise.muscle_groups.join(',').toLowerCase()
            : exercise.muscle_groups.toLowerCase();
          if (muscleGroupsStr.includes(query)) {
            return true;
          }
        }
        // Search in equipment
        if (exercise.equipment && exercise.equipment.toLowerCase().includes(query)) {
          return true;
        }
        return false;
      });
      setFilteredExercises(filtered);
    }
  }, [exerciseSearchQuery, availableExercises]);

  const loadRoutine = async () => {
    try {
      setLoading(true);
      console.log('Loading routine:', routineId);
      const response = await workoutAPI.getRoutine(routineId);
      const routine = response.data.routine;
      
      console.log('Routine loaded:', routine);
      
      // Pre-populate exercises from routine
      const routineExercises = routine.exercises.map((ex) => ({
        exercise_id: ex.id,
        name: ex.name,
        sets: [
          {
            number: 1,
            weight: '',
            reps: '',
            completed: false,
          },
        ],
      }));
      
      setExercises(routineExercises);
      console.log('Pre-populated exercises:', routineExercises);
    } catch (error) {
      console.error('Error loading routine:', error);
      alert('Failed to load routine');
    } finally {
      setLoading(false);
    }
  };

  const addExercise = (exercise) => {
    setExercises([
      ...exercises,
      {
        exercise_id: exercise.id, // Will be null for custom exercises
        name: exercise.name,
        is_custom: exercise.is_custom || false, // Mark custom exercises
        sets: [
          {
            number: 1,
            weight: '',
            reps: '',
            completed: false,
          },
        ],
      },
    ]);
    setShowExercisePicker(false);
    setExerciseSearchQuery(''); // Clear search when closing
  };

  const handleCreateCustomExercise = () => {
    if (!customExerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    // Create a custom exercise object locally (not saved to database)
    const customExercise = {
      id: null, // Custom exercises don't have a database ID
      name: customExerciseName.trim(),
      is_custom: true, // Marker to identify custom exercises
    };
    
    // Add the custom exercise to the workout
    addExercise(customExercise);
    
    // Close modal and clear
    setShowCustomExerciseModal(false);
    setCustomExerciseName('');
  };

  const removeExercise = (exerciseIndex) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newExercises = [...exercises];
            newExercises.splice(exerciseIndex, 1);
            setExercises(newExercises);
          },
        },
      ]
    );
  };

  const toggleSetComplete = (exerciseIndex, setIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex].completed = 
      !newExercises[exerciseIndex].sets[setIndex].completed;
    setExercises(newExercises);
  };

  const updateSetValue = (exerciseIndex, setIndex, field, value) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const addSet = (exerciseIndex) => {
    const newExercises = [...exercises];
    const lastSet = newExercises[exerciseIndex].sets[newExercises[exerciseIndex].sets.length - 1];
    newExercises[exerciseIndex].sets.push({
      number: newExercises[exerciseIndex].sets.length + 1,
      weight: lastSet.weight,
      reps: lastSet.reps,
      completed: false,
    });
    setExercises(newExercises);
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const newExercises = [...exercises];
    if (newExercises[exerciseIndex].sets.length > 1) {
      newExercises[exerciseIndex].sets.splice(setIndex, 1);
      // Renumber sets
      newExercises[exerciseIndex].sets.forEach((set, idx) => {
        set.number = idx + 1;
      });
      setExercises(newExercises);
    }
  };

  const saveWorkout = async () => {
    console.log('=== SAVE WORKOUT CLICKED ===');
    console.log('Exercises count:', exercises.length);
    
    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    try {
      setSaving(true);
      console.log('Starting save process...');

      // Calculate total volume
      let totalVolume = 0;
      exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (set.completed && set.weight && set.reps) {
            totalVolume += parseFloat(set.weight) * parseInt(set.reps);
          }
        });
      });

      const workoutData = {
        name: workoutName,
        duration: Math.floor(timer / 60), // Convert to minutes
        total_volume: totalVolume,
        date: new Date().toISOString(),
        exercises: exercises.map((exercise, order) => ({
          exercise_id: exercise.exercise_id, // Will be null for custom exercises
          custom_exercise_name: exercise.is_custom ? exercise.name : null,
          order: order,
          sets: exercise.sets.map((set) => ({
            set_number: set.number,
            weight: parseFloat(set.weight) || 0,
            reps: parseInt(set.reps) || 0,
            completed: set.completed,
          })),
        })),
      };

      console.log('Workout data to save:', JSON.stringify(workoutData, null, 2));

      if (workoutId) {
        console.log('Updating workout:', workoutId);
        const response = await workoutAPI.updateWorkout(workoutId, workoutData);
        console.log('Update response:', response.data);
        alert('Workout updated successfully!');
        // Navigate back and refresh
        navigation.navigate('Main', { screen: 'Home', params: { refresh: Date.now() } });
      } else {
        console.log('Creating new workout...');
        const response = await workoutAPI.createWorkout(workoutData);
        console.log('Create response:', response.data);
        alert('Workout saved successfully! ID: ' + response.data.workout.id);
        // Navigate to dashboard with refresh
        navigation.navigate('Main', { screen: 'Home', params: { refresh: Date.now() } });
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to save workout. ';
      
      if (error.response?.status === 401) {
        errorMessage = 'You need to be logged in to save workouts. Please login or create an account first.';
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <TextInput
          style={globalStyles.headerTitleCenter}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Workout Name"
          placeholderTextColor={colors.textTertiary}
        />
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTimer(timer)}</Text>
        </View>
      </View>

      {/* Timer Controls */}
      <View style={styles.timerControls}>
        <TouchableOpacity
          style={[styles.timerButton, timerRunning && styles.timerButtonActive]}
          onPress={toggleTimer}
        >
          <Icon 
            name={timerRunning ? 'pause' : 'play'} 
            size={20} 
            color={timerRunning ? '#102216' : colors.primary} 
          />
          <Text style={[styles.timerButtonText, timerRunning && styles.timerButtonTextActive]}>
            {timerRunning ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.timerButton}
          onPress={resetTimer}
          disabled={timer === 0}
        >
          <Icon name="refresh" size={20} color={colors.textSecondary} />
          <Text style={styles.timerButtonText}>Reset</Text>
        </TouchableOpacity>

        <View style={styles.timerStatus}>
          <View style={[styles.statusDot, timerRunning && styles.statusDotActive]} />
          <Text style={styles.timerStatusText}>
            {timerRunning ? 'Recording' : 'Paused'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {exercises.length === 0 ? (
          <View style={globalStyles.emptyState}>
            <Icon name="dumbbell" size={64} color={colors.textTertiary} />
            <Text style={globalStyles.emptyStateText}>No exercises added yet</Text>
            <Text style={globalStyles.emptyStateSubtext}>
              Tap "Add Exercise" to get started
            </Text>
          </View>
        ) : (
          exercises.map((exercise, exerciseIndex) => (
            <View key={exerciseIndex} style={styles.exerciseSection}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <TouchableOpacity
                  onPress={() => removeExercise(exerciseIndex)}
                  style={styles.deleteButton}
                >
                  <Icon name="delete-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.exerciseCard}>
                {/* Header Row */}
                <View style={styles.setHeaderRow}>
                  <Text style={styles.setHeaderText}>SET</Text>
                  <Text style={styles.setHeaderText}>WEIGHT ({weightUnit})</Text>
                  <Text style={styles.setHeaderText}>REPS</Text>
                  <View style={{ width: 64 }} />
                </View>

                {/* Sets */}
                {exercise.sets.map((set, setIndex) => (
                  <View
                    key={setIndex}
                    style={[
                      styles.setRow,
                      !set.completed && styles.setRowIncomplete,
                    ]}
                  >
                    <View style={styles.setNumber}>
                      <View
                        style={[
                          styles.setNumberCircle,
                          set.completed && styles.setNumberCircleCompleted,
                        ]}
                      >
                        <Text
                          style={[
                            styles.setNumberText,
                            set.completed && styles.setNumberTextCompleted,
                          ]}
                        >
                          {set.number}
                        </Text>
                      </View>
                    </View>

                    <TextInput
                      style={styles.setInput}
                      value={set.weight}
                      onChangeText={(text) =>
                        updateSetValue(exerciseIndex, setIndex, 'weight', text.replace(/[^0-9.]/g, ''))
                      }
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textTertiary}
                    />

                    <TextInput
                      style={styles.setInput}
                      value={set.reps}
                      onChangeText={(text) =>
                        updateSetValue(exerciseIndex, setIndex, 'reps', text.replace(/[^0-9]/g, ''))
                      }
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textTertiary}
                    />

                    <TouchableOpacity
                      style={[
                        styles.checkButton,
                        set.completed && styles.checkButtonCompleted,
                      ]}
                      onPress={() => toggleSetComplete(exerciseIndex, setIndex)}
                    >
                      {set.completed && (
                        <Icon name="check" size={18} color="#102216" />
                      )}
                    </TouchableOpacity>

                    {exercise.sets.length > 1 && (
                      <TouchableOpacity
                        style={styles.deleteSetButton}
                        onPress={() => removeSet(exerciseIndex, setIndex)}
                      >
                        <Icon name="close" size={16} color={colors.textTertiary} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Add Set Button */}
                <TouchableOpacity
                  style={styles.addSetButton}
                  onPress={() => addSet(exerciseIndex)}
                >
                  <Icon name="plus" size={18} color={colors.primary} />
                  <Text style={styles.addSetText}>Add Set</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowExercisePicker(true)}
        >
          <Icon name="plus" size={20} color={colors.primary} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={globalStyles.bottomBar}>
        <TouchableOpacity 
          style={[styles.testButton, (saving || exercises.length === 0) && styles.buttonDisabled]}
          onPress={() => {
            console.log('TEST: Button clicked!');
            console.log('TEST: Exercises:', exercises.length);
            console.log('TEST: Calling saveWorkout...');
            saveWorkout();
          }}
          disabled={saving || exercises.length === 0}
        >
          <Text style={styles.testButtonText}>
            {saving ? 'Saving...' : `Finish Workout (${exercises.length} exercises)`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowExercisePicker(false);
          setExerciseSearchQuery(''); // Clear search when closing
        }}
      >
        <View style={globalStyles.modalContainer}>
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>Select Exercise</Text>
              <TouchableOpacity onPress={() => {
                setShowExercisePicker(false);
                setExerciseSearchQuery(''); // Clear search when closing
              }}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={20} color={colors.textTertiary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={colors.textTertiary}
                value={exerciseSearchQuery}
                onChangeText={setExerciseSearchQuery}
                autoFocus={false}
              />
              {exerciseSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setExerciseSearchQuery('')} style={styles.clearSearchButton}>
                  <Icon name="close-circle" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exerciseItem}
                  onPress={() => addExercise(item)}
                >
                  <View style={styles.exerciseItemIcon}>
                    <Icon name="dumbbell" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.exerciseItemInfo}>
                    <Text style={styles.exerciseItemName}>{item.name}</Text>
                    <Text style={styles.exerciseItemCategory}>
                      {item.category || 'Strength'}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Icon name="magnify" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyListText}>
                    {exerciseSearchQuery ? 'No exercises found' : 'No exercises available'}
                  </Text>
                  {exerciseSearchQuery && (
                    <Text style={styles.emptyListSubtext}>
                      Try a different search term or add a custom exercise
                    </Text>
                  )}
                </View>
              }
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.customExerciseButton}
                  onPress={() => {
                    setShowExercisePicker(false);
                    setShowCustomExerciseModal(true);
                  }}
                >
                  <Icon name="plus-circle-outline" size={24} color={colors.primary} />
                  <Text style={styles.customExerciseButtonText}>Add Custom Exercise</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Custom Exercise Modal */}
      <Modal
        visible={showCustomExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCustomExerciseModal(false);
          setCustomExerciseName('');
        }}
      >
        <View style={globalStyles.modalContainer}>
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>Custom Exercise</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCustomExerciseModal(false);
                  setCustomExerciseName('');
                }}
                onPress={() => {
                  setShowCustomExerciseModal(false);
                  setCustomExerciseName('');
                }}
              >
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.customExerciseContent}>
              <Text style={styles.customExerciseLabel}>
                Enter the name of your exercise
              </Text>
              <TextInput
                style={styles.customExerciseInput}
                placeholder="e.g., Custom Bench Press"
                placeholderTextColor={colors.textTertiary}
                value={customExerciseName}
                onChangeText={setCustomExerciseName}
                autoFocus={true}
              />
              
              <Text style={styles.customExerciseHint}>
                This exercise will only be saved with this workout. It won't appear in the exercise library.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCustomExerciseModal(false);
                  setCustomExerciseName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  !customExerciseName.trim() && styles.buttonDisabled,
                ]}
                onPress={handleCreateCustomExercise}
                disabled={!customExerciseName.trim()}
              >
                <Text style={styles.confirmButtonText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    alignItems: 'flex-end',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    minWidth: 85,
    fontVariant: ['tabular-nums'],
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  timerButtonActive: {
    backgroundColor: colors.primary,
  },
  timerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  timerButtonTextActive: {
    color: '#102216',
  },
  timerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
  },
  statusDotActive: {
    backgroundColor: colors.primary,
  },
  timerStatusText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  exerciseSection: {
    marginTop: 24,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  exerciseCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 4,
  },
  setHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  setHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    gap: 8,
  },
  setRowIncomplete: {
    opacity: 0.5,
  },
  setNumber: {
    flex: 1,
    alignItems: 'center',
  },
  setNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumberCircleCompleted: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
  },
  setNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textTertiary,
  },
  setNumberTextCompleted: {
    color: colors.primary,
  },
  setInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  deleteSetButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(19, 236, 91, 0.5)',
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    gap: 8,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  testButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#102216',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 12,
  },
  exerciseItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseItemInfo: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exerciseItemCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyListSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
    height: 48,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: 4,
  },
  customExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    gap: 8,
  },
  customExerciseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  customExerciseContent: {
    padding: 20,
  },
  customExerciseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  customExerciseInput: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  customExerciseHint: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#102216',
  },
});

export default LogWorkoutScreen;

