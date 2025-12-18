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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import Button from '../components/Button';
import { workoutAPI, exerciseAPI } from '../services/api';

const CreateRoutineScreen = ({ navigation, route }) => {
  const routineId = route?.params?.routineId;
  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('dumbbell');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailableExercises();
  }, []);

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
    if (searchQuery.trim() === '') {
      setFilteredExercises(availableExercises);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = availableExercises.filter((exercise) => {
        if (exercise.name && exercise.name.toLowerCase().includes(query)) {
          return true;
        }
        if (exercise.description && exercise.description.toLowerCase().includes(query)) {
          return true;
        }
        if (exercise.category && exercise.category.toLowerCase().includes(query)) {
          return true;
        }
        if (exercise.muscle_groups) {
          const muscleGroupsStr = Array.isArray(exercise.muscle_groups)
            ? exercise.muscle_groups.join(',').toLowerCase()
            : exercise.muscle_groups.toLowerCase();
          if (muscleGroupsStr.includes(query)) {
            return true;
          }
        }
        if (exercise.equipment && exercise.equipment.toLowerCase().includes(query)) {
          return true;
        }
        return false;
      });
      setFilteredExercises(filtered);
    }
  }, [searchQuery, availableExercises]);

  const icons = [
    'dumbbell',
    'run',
    'weight-lifter',
    'arm-flex',
    'yoga',
    'bicycle',
    'rowing',
    'walk',
  ];

  const toggleExercise = (exercise) => {
    const exists = selectedExercises.find((e) => e.id === exercise.id);
    if (exists) {
      setSelectedExercises(selectedExercises.filter((e) => e.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const removeExercise = (exerciseId) => {
    setSelectedExercises(selectedExercises.filter((e) => e.id !== exerciseId));
  };

  const saveRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert('Missing information', 'Please enter a routine name');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Missing exercises', 'Please add at least one exercise');
      return;
    }

    try {
      setSaving(true);

      const routineData = {
        name: routineName,
        description: description,
        icon: selectedIcon,
        exercise_ids: selectedExercises.map((e) => e.id),
      };

      console.log('Saving routine:', routineData);
      const response = await workoutAPI.createRoutine(routineData);
      console.log('Routine saved:', response.data);

      navigation.goBack();

      setTimeout(() => {
        Alert.alert('Success', `Routine "${routineName}" created successfully!`);
      }, 500);
    } catch (error) {
      console.error('Error saving routine:', error);
      Alert.alert('Error', 'Failed to save routine. Please try again.');
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
        <Text style={globalStyles.headerTitle}>
          {routineId ? 'Edit Routine' : 'Create Routine'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Routine Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Routine Name</Text>
          <TextInput
            style={styles.input}
            value={routineName}
            onChangeText={setRoutineName}
            placeholder="e.g., Push Day, Full Body Strength"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add notes about this routine..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Icon Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Choose Icon</Text>
          <View style={styles.iconGrid}>
            {icons.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconButton,
                  selectedIcon === icon && styles.iconButtonActive,
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Icon
                  name={icon}
                  size={28}
                  color={selectedIcon === icon ? '#102216' : colors.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Exercises */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>
              Exercises ({selectedExercises.length})
            </Text>
            <TouchableOpacity onPress={() => setShowExercisePicker(true)}>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={[globalStyles.card, globalStyles.alignCenter, globalStyles.gap16]}>
              <Icon name="dumbbell" size={48} color={colors.textTertiary} />
              <Text style={globalStyles.emptyStateText}>No exercises added</Text>
              <TouchableOpacity
                style={styles.addExerciseButton}
                onPress={() => setShowExercisePicker(true)}
              >
                <Icon name="plus" size={18} color={colors.primary} />
                <Text style={styles.addExerciseText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.exerciseList}>
              {selectedExercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseItem}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseCategory}>
                      {exercise.category || 'Strength'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeExercise(exercise.id)}
                    style={styles.removeButton}
                  >
                    <Icon name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={globalStyles.bottomBar}>
        <Button
          title={saving ? 'Saving...' : 'Create Routine'}
          onPress={saveRoutine}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        />
      </View>

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowExercisePicker(false);
          setSearchQuery('');
        }}
      >
        <View style={globalStyles.modalContainer}>
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>Add Exercises</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowExercisePicker(false);
                  setSearchQuery('');
                }}
              >
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Icon
                name="magnify"
                size={20}
                color={colors.textTertiary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                >
                  <Icon name="close-circle" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = selectedExercises.find((e) => e.id === item.id);
                return (
                  <TouchableOpacity
                    style={styles.modalExerciseItem}
                    onPress={() => toggleExercise(item)}
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
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Icon name="check" size={16} color="#102216" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>
                    {searchQuery ? 'No exercises found' : 'No exercises available'}
                  </Text>
                  {searchQuery && (
                    <Text style={styles.emptyListSubtext}>
                      Try a different search term
                    </Text>
                  )}
                </View>
              }
            />

            <View style={styles.modalFooter}>
              <Button
                title={`Add ${selectedExercises.length} Exercise${
                  selectedExercises.length !== 1 ? 's' : ''
                }`}
                onPress={() => {
                  setShowExercisePicker(false);
                  setSearchQuery('');
                }}
                disabled={selectedExercises.length === 0}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    height: 48,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  addButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  addExerciseText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  exerciseCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  removeButton: {
    padding: 4,
  },
  modalExerciseItem: {
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
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
  emptyListSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CreateRoutineScreen;


