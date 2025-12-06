import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import { exerciseAPI } from '../services/api';
import { styles } from '../styles/ExercisesScreenStyles';

const ExercisesScreen = ({ navigation }) => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Core'];
  const equipmentTypes = ['All', 'Barbell', 'Dumbbells', 'Dumbbell'];

  useFocusEffect(
    React.useCallback(() => {
      loadExercises();
    }, [])
  );

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await exerciseAPI.getExercises();
      console.log('Exercises loaded:', response.data.exercises.length);
      setExercises(response.data.exercises);
      setFilteredExercises(response.data.exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      alert('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterExercises();
  }, [searchQuery, selectedCategory, selectedEquipment, exercises]);

  const filterExercises = () => {
    let filtered = [...exercises];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category (muscle group)
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(ex =>
        ex.muscle_groups.some(mg => mg.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }

    // Filter by equipment
    if (selectedEquipment !== 'All') {
      filtered = filtered.filter(ex =>
        ex.equipment.toLowerCase() === selectedEquipment.toLowerCase()
      );
    }

    setFilteredExercises(filtered);
  };

  const getEquipmentIcon = (equipment) => {
    const eq = equipment.toLowerCase();
    if (eq.includes('barbell')) return 'weight-lifter';
    if (eq.includes('dumbbell')) return 'dumbbell';
    return 'weight';
  };

  if (loading) {
    return (
      <View style={globalStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Exercises</Text>
        <Text style={styles.exerciseCount}>{filteredExercises.length} exercises</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={globalStyles.section}>
          <View style={globalStyles.searchContainer}>
            <Icon name="magnify" size={20} color={colors.textTertiary} />
            <TextInput
              style={globalStyles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Muscle Group</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    selectedCategory === category && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === category && styles.filterChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Equipment Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Equipment</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              {equipmentTypes.map((equipment) => (
                <TouchableOpacity
                  key={equipment}
                  style={[
                    styles.filterChip,
                    selectedEquipment === equipment && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedEquipment(equipment)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedEquipment === equipment && styles.filterChipTextActive,
                    ]}
                  >
                    {equipment}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Exercise List */}
        <View style={globalStyles.section}>
          {filteredExercises.length === 0 ? (
            <View style={globalStyles.emptyState}>
              <Icon name="dumbbell" size={64} color={colors.textTertiary} />
              <Text style={globalStyles.emptyStateText}>No exercises found</Text>
              <Text style={globalStyles.emptyStateSubtext}>
                Try adjusting your filters
              </Text>
            </View>
          ) : (
            filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => navigation.navigate('ExerciseDetails', { exerciseId: exercise.id })}
              >
                <View style={styles.exerciseIconContainer}>
                  <Icon
                    name={getEquipmentIcon(exercise.equipment)}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDescription} numberOfLines={1}>
                    {exercise.description}
                  </Text>
                  <View style={styles.exerciseMeta}>
                    <View style={styles.metaTag}>
                      <Icon name="weight-lifter" size={12} color={colors.textTertiary} />
                      <Text style={styles.metaText}>{exercise.equipment}</Text>
                    </View>
                    <View style={styles.metaTag}>
                      <Icon name="arm-flex" size={12} color={colors.textTertiary} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {exercise.muscle_groups.slice(0, 2).join(', ')}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <Icon name="chevron-right" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default ExercisesScreen;

