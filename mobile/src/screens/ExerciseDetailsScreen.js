import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import Button from '../components/Button';
import { exerciseAPI } from '../services/api';
import { styles } from '../styles/ExerciseDetailsScreenStyles';

const ExerciseDetailsScreen = ({ navigation, route }) => {
  const exerciseId = route?.params?.exerciseId || 1; // Default to first exercise
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      const response = await exerciseAPI.getExercise(exerciseId);
      console.log('Exercise loaded:', response.data.exercise);
      setExercise(response.data.exercise);
    } catch (error) {
      console.error('Error loading exercise:', error);
      alert('Failed to load exercise details');
    } finally {
      setLoading(false);
    }
  };

  const parseInstructions = (instructionsText) => {
    if (!instructionsText) return [];
    return instructionsText.split('\n').filter(line => line.trim());
  };

  const proTips = [
    "Maintain proper form throughout the movement",
    "Control the weight - don't use momentum",
    "Breathe properly - exhale on exertion, inhale on release",
    "Warm up before starting heavy sets",
  ];

  if (loading) {
    return (
      <View style={globalStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.loadingText}>Loading exercise...</Text>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={globalStyles.centerContent}>
        <Text style={globalStyles.emptyStateText}>Exercise not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
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
        <Text style={globalStyles.headerTitleCenter}>{exercise.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Exercise Info Header */}
        <View style={styles.infoHeader}>
          <View style={globalStyles.iconContainer}>
            <Icon name="dumbbell" size={28} color={colors.primary} />
          </View>
          <View style={styles.infoHeaderText}>
            <Text style={styles.categoryText}>{exercise.category || 'Strength'}</Text>
            {exercise.equipment && (
              <Text style={styles.equipmentText}>
                <Icon name="weight-lifter" size={14} color={colors.textTertiary} />
                {' '}{exercise.equipment}
              </Text>
            )}
          </View>
        </View>

        {/* Target Muscles */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Target Muscles</Text>
          <View style={[globalStyles.card, globalStyles.gap8]}>
            <Text style={styles.muscleText}>
              <Text style={styles.muscleBold}>Primary: </Text>
              {exercise.muscle_groups && exercise.muscle_groups.length > 0
                ? exercise.muscle_groups.join(', ')
                : 'Not specified'}
            </Text>
            {exercise.description && (
              <Text style={styles.descriptionText}>
                {exercise.description}
              </Text>
            )}
          </View>
        </View>

        {/* How to Perform */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>How to Perform</Text>
          {parseInstructions(exercise.instructions).map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Pro Tips */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Pro Tips</Text>
          {proTips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Icon name="lightbulb" size={16} color={colors.warning} />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={globalStyles.bottomBar}>
        <Button
          title="Add to Today's Workout"
          onPress={() => navigation.navigate('LogWorkout')}
          icon={<Icon name="plus" size={20} color="#102216" style={{ marginRight: 8 }} />}
          style={globalStyles.shadowLarge}
        />
      </View>
    </View>
  );
};

export default ExerciseDetailsScreen;

