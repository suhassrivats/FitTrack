import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import { API_URL } from '../services/api';
import { getWeightUnit } from '../utils/units';

const LogAssignedWorkoutScreen = ({ navigation, route }) => {
  const { classId, assignedWorkout } = route.params;
  
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [weightUnit, setWeightUnit] = useState('kg');

  useEffect(() => {
    loadWeightUnit();
    loadAssignedWorkout();
  }, []);

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

  const loadWeightUnit = async () => {
    const unit = await getWeightUnit();
    setWeightUnit(unit);
  };

  const loadAssignedWorkout = () => {
    // Pre-populate exercises from workout template
    const workoutExercises = assignedWorkout.workout_template?.exercises || [];
    
    const preloadedExercises = workoutExercises.map((ex) => {
      // Create target_sets number of sets, or default to 3
      const targetSets = ex.target_sets || 3;
      const sets = [];
      
      for (let i = 1; i <= targetSets; i++) {
        sets.push({
          number: i,
          weight: '',
          reps: ex.target_reps?.toString() || '',
          completed: false,
        });
      }
      
      return {
        exercise_id: ex.exercise_id,
        name: ex.name,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        sets: sets,
      };
    });
    
    setExercises(preloadedExercises);
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
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
  };

  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const completeWorkout = async () => {
    if (exercises.length === 0) {
      Alert.alert('Error', 'Please complete at least one exercise');
      return;
    }

    try {
      setSaving(true);

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
        duration: Math.floor(timer / 60),
        total_volume: totalVolume,
        workout_data: {
          duration: Math.floor(timer / 60),
          total_volume: totalVolume,
          exercises: exercises.map((exercise, order) => ({
            exercise_id: exercise.exercise_id,
            order: order,
            sets: exercise.sets.map((set) => ({
              set_number: set.number,
              weight: parseFloat(set.weight) || 0,
              reps: parseInt(set.reps) || 0,
              completed: set.completed,
            })),
          })),
        }
      };

      const response = await fetch(
        `${API_URL}/classes/${classId}/assigned-workouts/${assignedWorkout.id}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workoutData),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Workout completed! Great job! 💪', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Failed to complete workout');
      }
    } catch (error) {
      console.error('Error completing workout:', error);
      Alert.alert('Error', 'Failed to complete workout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitleCenter}>{assignedWorkout.name}</Text>
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
            <Text style={globalStyles.emptyStateText}>No exercises in this workout</Text>
          </View>
        ) : (
          exercises.map((exercise, exerciseIndex) => (
            <View key={exerciseIndex} style={styles.exerciseSection}>
              <View style={styles.exerciseHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  {(exercise.target_sets || exercise.target_reps) && (
                    <Text style={styles.exerciseTarget}>
                      Target: {exercise.target_sets || '?'} sets × {exercise.target_reps || '?'} reps
                    </Text>
                  )}
                </View>
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={globalStyles.bottomBar}>
        <TouchableOpacity 
          style={[styles.completeButton, (saving || exercises.length === 0) && styles.buttonDisabled]}
          onPress={completeWorkout}
          disabled={saving || exercises.length === 0}
        >
          <Text style={styles.completeButtonText}>
            {saving ? 'Saving...' : `Complete Workout (${exercises.length} exercises)`}
          </Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  exerciseTarget: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
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
  completeButton: {
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
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#102216',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default LogAssignedWorkoutScreen;

