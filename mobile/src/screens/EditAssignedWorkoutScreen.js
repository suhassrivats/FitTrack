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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';
import colors from '../styles/colors';
import Button from '../components/Button';
import { classAPI, exerciseAPI } from '../services/api';

const EditAssignedWorkoutScreen = ({ route, navigation }) => {
  const { classId, workout } = route.params;
  
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editExercises, setEditExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  
  // Exercise picker state
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [replaceIndex, setReplaceIndex] = useState(undefined);

  useEffect(() => {
    // Initialize form with workout data
    if (workout) {
      setEditName(workout.name);
      setEditDescription(workout.description || '');
      setEditDueDate(workout.due_date ? workout.due_date.split('T')[0] : '');
      const exercises = workout.workout_template?.exercises || [];
      setEditExercises(exercises.map(ex => ({ ...ex }))); // Deep copy
    }
    loadAvailableExercises();
  }, [workout]);

  const loadAvailableExercises = async () => {
    try {
      const response = await exerciseAPI.getExercises();
      setAvailableExercises(response.data.exercises || []);
      setFilteredExercises(response.data.exercises || []);
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
        if (exercise.name && exercise.name.toLowerCase().includes(query)) return true;
        if (exercise.description && exercise.description.toLowerCase().includes(query)) return true;
        if (exercise.category && exercise.category.toLowerCase().includes(query)) return true;
        return false;
      });
      setFilteredExercises(filtered);
    }
  }, [exerciseSearchQuery, availableExercises]);

  const handleSaveWorkout = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (editExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    try {
      setSaving(true);
      
      await classAPI.updateAssignedWorkout(classId, workout.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        due_date: editDueDate || null,
        exercises: editExercises,
      });

      Alert.alert('Success', 'Workout updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating workout:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update workout');
    } finally {
      setSaving(false);
    }
  };

  const addExercise = (exercise) => {
    setEditExercises([
      ...editExercises,
      {
        exercise_id: exercise.id,
        name: exercise.name,
        target_sets: 3,
        target_reps: 10,
      },
    ]);
    setShowExercisePicker(false);
    setExerciseSearchQuery('');
    setReplaceIndex(undefined);
  };

  const removeExercise = (index) => {
    const newExercises = [...editExercises];
    newExercises.splice(index, 1);
    setEditExercises(newExercises);
  };

  const replaceExercise = (index, exercise) => {
    const newExercises = [...editExercises];
    if (newExercises[index]) {
      newExercises[index] = {
        exercise_id: exercise.id,
        name: exercise.name,
        target_sets: newExercises[index].target_sets || 3,
        target_reps: newExercises[index].target_reps || 10,
      };
      setEditExercises(newExercises);
    }
    setShowExercisePicker(false);
    setExerciseSearchQuery('');
    setReplaceIndex(undefined);
  };

  const moveExerciseUp = (index) => {
    if (index === 0) return;
    const newExercises = [...editExercises];
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    setEditExercises(newExercises);
  };

  const moveExerciseDown = (index) => {
    if (index === editExercises.length - 1) return;
    const newExercises = [...editExercises];
    [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    setEditExercises(newExercises);
  };

  const updateExerciseTarget = (index, field, value) => {
    const newExercises = [...editExercises];
    newExercises[index][field] = parseInt(value) || 0;
    setEditExercises(newExercises);
  };

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitleCenter}>Edit Workout</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.inputGroup}>
          <Text style={globalStyles.inputLabel}>Workout Name *</Text>
          <TextInput
            style={globalStyles.input}
            value={editName}
            onChangeText={setEditName}
            placeholder="e.g., Push Day - Week 1"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={globalStyles.inputLabel}>Description</Text>
          <TextInput
            style={[globalStyles.input, globalStyles.textArea]}
            value={editDescription}
            onChangeText={setEditDescription}
            placeholder="Add workout description..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={globalStyles.inputLabel}>Due Date</Text>
          <TextInput
            style={globalStyles.input}
            value={editDueDate}
            onChangeText={setEditDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textTertiary}
          />
          <Text style={styles.inputHint}>Format: YYYY-MM-DD (e.g., 2025-12-13)</Text>
        </View>

        {/* Exercises Section */}
        <View style={styles.inputGroup}>
          <View style={styles.exercisesHeader}>
            <Text style={globalStyles.inputLabel}>Exercises ({editExercises.length})</Text>
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => {
                setReplaceIndex(undefined);
                setShowExercisePicker(true);
              }}
            >
              <Icon name="plus-circle" size={20} color={colors.primary} />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {editExercises.length === 0 ? (
            <View style={styles.emptyExercises}>
              <Icon name="dumbbell" size={32} color={colors.textTertiary} />
              <Text style={styles.emptyExercisesText}>No exercises added</Text>
              <Text style={styles.emptyExercisesSubtext}>Tap "Add Exercise" to get started</Text>
            </View>
          ) : (
            <View style={styles.exercisesList}>
              {editExercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseEditCard}>
                  <View style={styles.exerciseEditHeader}>
                    <View style={styles.exerciseEditInfo}>
                      <Text style={styles.exerciseEditName}>{exercise.name}</Text>
                      <View style={styles.exerciseEditActions}>
                        <TouchableOpacity
                          style={[styles.reorderButton, index === 0 && styles.disabledButton]}
                          onPress={() => moveExerciseUp(index)}
                          disabled={index === 0}
                        >
                          <Icon name="chevron-up" size={18} color={index === 0 ? colors.textTertiary : colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.reorderButton, index === editExercises.length - 1 && styles.disabledButton]}
                          onPress={() => moveExerciseDown(index)}
                          disabled={index === editExercises.length - 1}
                        >
                          <Icon name="chevron-down" size={18} color={index === editExercises.length - 1 ? colors.textTertiary : colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.replaceButton}
                          onPress={() => {
                            setReplaceIndex(index);
                            setShowExercisePicker(true);
                          }}
                        >
                          <Icon name="swap-horizontal" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeExercise(index)}
                        >
                          <Icon name="close-circle" size={20} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <View style={styles.exerciseTargets}>
                    <View style={styles.targetInput}>
                      <Text style={styles.targetLabel}>Sets</Text>
                      <TextInput
                        style={styles.targetTextInput}
                        value={exercise.target_sets?.toString() || ''}
                        onChangeText={(value) => updateExerciseTarget(index, 'target_sets', value)}
                        placeholder="3"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.targetInput}>
                      <Text style={styles.targetLabel}>Reps</Text>
                      <TextInput
                        style={styles.targetTextInput}
                        value={exercise.target_reps?.toString() || ''}
                        onChangeText={(value) => updateExerciseTarget(index, 'target_reps', value)}
                        placeholder="10"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={globalStyles.bottomBar}>
        <Button
          title={saving ? 'Saving...' : 'Save Changes'}
          variant="primary"
          onPress={handleSaveWorkout}
          loading={saving}
          disabled={saving}
        />
      </View>

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowExercisePicker(false);
          setExerciseSearchQuery('');
          setReplaceIndex(undefined);
        }}
      >
        <View style={globalStyles.modalContainer}>
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>
                {replaceIndex !== undefined ? 'Replace Exercise' : 'Add Exercise'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowExercisePicker(false);
                setExerciseSearchQuery('');
                setReplaceIndex(undefined);
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
              />
              {exerciseSearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setExerciseSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Icon name="close-circle" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Exercises List */}
            <ScrollView style={styles.exercisePickerList}>
              {filteredExercises.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="magnify" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyStateText}>No exercises found</Text>
                  <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
                </View>
              ) : (
                filteredExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exercisePickerItem}
                    onPress={() => {
                      if (replaceIndex !== undefined) {
                        replaceExercise(replaceIndex, exercise);
                      } else {
                        addExercise(exercise);
                      }
                    }}
                  >
                    <View style={styles.exercisePickerIcon}>
                      <Icon name="dumbbell" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.exercisePickerInfo}>
                      <Text style={styles.exercisePickerName}>{exercise.name}</Text>
                      {exercise.category && (
                        <Text style={styles.exercisePickerCategory}>{exercise.category}</Text>
                      )}
                    </View>
                    <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
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
  inputGroup: {
    marginBottom: 24,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addExerciseText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyExercises: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
  },
  emptyExercisesText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyExercisesSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseEditCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
  exerciseEditHeader: {
    marginBottom: 12,
  },
  exerciseEditInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseEditName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  exerciseEditActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reorderButton: {
    padding: 4,
  },
  replaceButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  disabledButton: {
    opacity: 0.3,
  },
  exerciseTargets: {
    flexDirection: 'row',
    gap: 12,
  },
  targetInput: {
    flex: 1,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  targetTextInput: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    margin: 20,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  exercisePickerList: {
    maxHeight: 400,
  },
  exercisePickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  exercisePickerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exercisePickerInfo: {
    flex: 1,
  },
  exercisePickerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exercisePickerCategory: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
});

export default EditAssignedWorkoutScreen;

