import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import Button from '../components/Button';
import { workoutAPI } from '../services/api';
import { styles } from '../styles/DashboardScreenStyles';

const WorkoutDashboardContent = ({ navigation, refreshRef }) => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorkoutData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading routines...');
      const routinesRes = await workoutAPI.getRoutines();
      console.log('Routines response:', JSON.stringify(routinesRes.data, null, 2));
      const routinesData = routinesRes.data?.routines || routinesRes.data || [];
      console.log('Setting routines:', routinesData);
      console.log('Number of routines:', routinesData.length);
      console.log('First 3 routine names:', routinesData.slice(0, 3).map(r => r.name));
      setRoutines(Array.isArray(routinesData) ? routinesData : []);
    } catch (error) {
      console.error('Error loading workout data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setRoutines([]); // Ensure we set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Expose refresh function via ref
  useEffect(() => {
    if (refreshRef) {
      refreshRef.current = loadWorkoutData;
    }
    return () => {
      if (refreshRef) {
        refreshRef.current = null;
      }
    };
  }, [refreshRef, loadWorkoutData]);

  // Load data on mount
  useEffect(() => {
    loadWorkoutData();
  }, [loadWorkoutData]);

  // Reload routines when screen comes into focus (e.g., after creating a routine)
  useFocusEffect(
    useCallback(() => {
      loadWorkoutData();
    }, [loadWorkoutData])
  );

  if (loading) {
    return (
      <View style={[globalStyles.centerContent, { flex: 1, paddingTop: 50 }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[globalStyles.loadingText, { marginTop: 16 }]}>Loading routines...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
              {routines.map((routine, index) => (
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

        {/* Extra space so last card isn't hidden behind the fixed button */}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Floating Action Button fixed to bottom */}
      <View style={styles.fabContainer}>
        <Button
          title="Start Cross-Training"
          onPress={() => navigation.navigate('LogWorkout')}
          icon={<Icon name="plus" size={20} color="#102216" style={{ marginRight: 8 }} />}
          style={styles.fab}
        />
      </View>
    </View>
  );
};

export default WorkoutDashboardContent;

