import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';
import colors from '../styles/colors';
import Button from '../components/Button';
import { exerciseAPI, classAPI } from '../services/api';

const AssignWorkoutScreen = ({ route, navigation }) => {
  const { classId } = route.params;
  
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPickingExercise, setIsPickingExercise] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableExercises();
  }, []);

  const loadAvailableExercises = async () => {
    try {
      const response = await exerciseAPI.getExercises();
      const exercises = response.data.exercises || [];
      setAvailableExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert('Error', 'Failed to load exercises. Please make sure the backend is running.');
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredExercises(availableExercises);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = availableExercises.filter(exercise => {
      const name = exercise.name?.toLowerCase() || '';
      const description = exercise.description?.toLowerCase() || '';
      const category = exercise.category?.toLowerCase() || '';
      const equipment = exercise.equipment?.toLowerCase() || '';
      const muscleGroups = Array.isArray(exercise.muscle_groups)
        ? exercise.muscle_groups.join(',').toLowerCase()
        : exercise.muscle_groups?.toLowerCase() || '';

      return name.includes(query) ||
        description.includes(query) ||
        category.includes(query) ||
        equipment.includes(query) ||
        muscleGroups.includes(query);
    });

    setFilteredExercises(filtered);
  }, [searchQuery, availableExercises]);

  const addExerciseToWorkout = (exercise) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        exercise_id: exercise.id,
        name: exercise.name,
        target_sets: 3,
        target_reps: 10,
      },
    ]);
    setIsPickingExercise(false);
    setSearchQuery('');
  };

  const removeExerciseFromWorkout = (index) => {
    const newExercises = [...selectedExercises];
    newExercises.splice(index, 1);
    setSelectedExercises(newExercises);
  };

  const updateExerciseTarget = (index, field, value) => {
    const newExercises = [...selectedExercises];
    newExercises[index][field] = parseInt(value) || 0;
    setSelectedExercises(newExercises);
  };

  const handleAssignWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    try {
      setLoading(true);
      await classAPI.assignWorkout(classId, {
          name: workoutName,
          description: workoutDescription,
          exercises: selectedExercises,
          due_date: dueDate || null,
      });

        Alert.alert('Success', 'Workout assigned to all students!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    } catch (error) {
      console.error('Error assigning workout:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to assign workout');
    } finally {
      setLoading(false);
    }
  };

  if (isPickingExercise) {
    return (
      <View style={globalStyles.container}>
        <View style={globalStyles.header}>
          <TouchableOpacity onPress={() => {
            setIsPickingExercise(false);
            setSearchQuery('');
          }}>
            <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={globalStyles.headerTitleCenter}>Select Exercise</Text>
          <View style={styles.headerSpacer} />
        </View>

        {availableExercises.length > 0 && (
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color={colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                <Icon name="close-circle" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {availableExercises.length === 0 ? (
          <View style={globalStyles.emptyState}>
            <Icon name="dumbbell" size={64} color={colors.textTertiary} />
            <Text style={globalStyles.emptyStateText}>No exercises available</Text>
            <Text style={globalStyles.emptyStateSubtext}>
              Make sure the backend is running
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadAvailableExercises}
            >
              <Icon name="refresh" size={18} color={colors.primary} />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredExercises.length === 0 ? (
          <View style={globalStyles.emptyState}>
            <Icon name="dumbbell" size={64} color={colors.textTertiary} />
            <Text style={globalStyles.emptyStateText}>No exercises found</Text>
            <Text style={globalStyles.emptyStateSubtext}>
              Try adjusting your search query
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => addExerciseToWorkout(item)}
              >
                <View style={styles.exerciseIcon}>
                  <Icon name="dumbbell" size={24} color={colors.primary} />
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Text style={styles.exerciseCategory}>
                    {item.category || 'Strength'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  // Main Form View
  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitleCenter}>Assign Workout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputGroup}>
          <Text style={globalStyles.inputLabel}>Workout Name *</Text>
          <TextInput
            style={globalStyles.input}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="e.g., Upper Body Strength"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={globalStyles.inputLabel}>Description (optional)</Text>
          <TextInput
            style={[globalStyles.input, globalStyles.textArea]}
            value={workoutDescription}
            onChangeText={setWorkoutDescription}
            placeholder="Add workout notes..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={globalStyles.inputLabel}>Exercises *</Text>
          {selectedExercises.length > 0 && (
            <View style={styles.selectedExercisesList}>
              {selectedExercises.map((ex, index) => (
                <View key={index} style={styles.selectedExerciseCard}>
                  <View style={styles.selectedExerciseHeader}>
                    <Text style={styles.selectedExerciseName}>{ex.name}</Text>
                    <TouchableOpacity onPress={() => removeExerciseFromWorkout(index)}>
                      <Icon name="close-circle" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.targetInputsRow}>
                    <View style={styles.targetInputGroup}>
                      <Text style={styles.targetInputLabel}>Sets</Text>
                      <TextInput
                        style={styles.targetInput}
                        value={ex.target_sets.toString()}
                        onChangeText={(text) => updateExerciseTarget(index, 'target_sets', text)}
                        keyboardType="number-pad"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                    <View style={styles.targetInputGroup}>
                      <Text style={styles.targetInputLabel}>Reps</Text>
                      <TextInput
                        style={styles.targetInput}
                        value={ex.target_reps.toString()}
                        onChangeText={(text) => updateExerciseTarget(index, 'target_reps', text)}
                        keyboardType="number-pad"
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => setIsPickingExercise(true)}
          >
            <Icon name="plus-circle" size={20} color={colors.primary} />
            <Text style={styles.addExerciseButtonText}>
              Add Exercise ({availableExercises.length} available)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={globalStyles.inputLabel}>Due Date (optional)</Text>
          <TextInput
            style={globalStyles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textTertiary}
          />
          <Text style={styles.helperText}>
            Format: YYYY-MM-DD (e.g., 2025-12-31)
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Icon name="information" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            This workout will be assigned to all students currently enrolled in this class.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={globalStyles.bottomBar}>
        <Button
          title={loading ? 'Assigning...' : `Assign Workout (${selectedExercises.length} exercises)`}
          variant="primary"
          onPress={handleAssignWorkout}
          loading={loading}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  headerSpacer: {
    width: 24,
  },
  bottomSpacer: {
    height: 100,
  },
  inputGroup: {
    marginBottom: 24,
  },
  helperText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  selectedExercisesList: {
    gap: 12,
    marginBottom: 12,
  },
  selectedExerciseCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
  selectedExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  targetInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  targetInputGroup: {
    flex: 1,
  },
  targetInputLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  targetInput: {
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: 'rgba(19, 236, 91, 0.15)',
    gap: 8,
  },
  addExerciseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 12,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    marginTop: 20,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clearSearchButton: {
    padding: 4,
  },
});

export default AssignWorkoutScreen;

