import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import Button from '../components/Button';
import { workoutAPI } from '../services/api';
import { styles } from '../styles/DashboardScreenStyles';

const WorkoutDashboardContent = ({ navigation }) => {
  const [routines, setRoutines] = useState([]);

  // Reload routines when screen comes into focus (e.g., after creating a routine)
  useFocusEffect(
    useCallback(() => {
      loadWorkoutData();
    }, [])
  );

  const loadWorkoutData = async () => {
    try {
      const routinesRes = await workoutAPI.getRoutines();
      setRoutines(routinesRes.data.routines);
    } catch (error) {
      console.error('Error loading workout data:', error);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* My Routines */}
      <View style={[globalStyles.section, { paddingTop: 24 }]}>
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

