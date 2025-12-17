import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import { workoutAPI } from '../services/api';
import { styles } from '../styles/DashboardScreenStyles';
import MacroDashboardContent from './MacroDashboardContent';
import WorkoutDashboardContent from './WorkoutDashboardContent';
import { useDashboard } from '../contexts/DashboardContext';

const UnifiedDashboardScreen = ({ navigation, route }) => {
  const { activeMode: contextMode, setActiveMode } = useDashboard();
  const [activeTab, setActiveTab] = useState(contextMode || 'workout'); // 'workout' or 'macros'
  const refreshWorkoutContentRef = useRef(null);
  
  // Sync with context on mount (but never allow macros mode)
  useEffect(() => {
    if (contextMode && contextMode !== activeTab && contextMode !== 'macros') {
      setActiveTab(contextMode);
    }
    // If somehow macros is set, reset to workout
    if (activeTab === 'macros') {
      setActiveTab('workout');
    }
  }, [contextMode]);
  
  // Update global mode when tab changes (only if not macros, which is disabled)
  useEffect(() => {
    if (activeTab !== 'macros') {
      setActiveMode(activeTab);
    }
  }, [activeTab, setActiveMode]);
  const [userName, setUserName] = useState('');

  // Load user info and trigger refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserInfo();
      // Also trigger refresh in WorkoutDashboardContent when screen comes into focus
      // Add small delay to ensure navigation has completed
      setTimeout(() => {
        console.log('UnifiedDashboardScreen focused - triggering refresh');
        if (refreshWorkoutContentRef.current) {
          refreshWorkoutContentRef.current();
        }
      }, 100);
    }, [])
  );

  // Add navigation listener as backup to refresh when coming back from CreateRoutine
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('UnifiedDashboardScreen navigation focus - triggering refresh');
      // Trigger refresh in WorkoutDashboardContent
      if (refreshWorkoutContentRef.current) {
        refreshWorkoutContentRef.current();
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Also listen for route params changes (for manual refresh triggers)
  useEffect(() => {
    if (route?.params?.refreshRoutines) {
      console.log('Refresh routines param detected - triggering refresh');
      if (refreshWorkoutContentRef.current) {
        refreshWorkoutContentRef.current();
      }
      // Clear the param to prevent infinite loops
      navigation.setParams({ refreshRoutines: false });
    }
  }, [route?.params?.refreshRoutines, navigation]);

  const loadUserInfo = async () => {
    try {
      const statsRes = await workoutAPI.getStats();
      setUserName(statsRes.data.stats?.user?.full_name || statsRes.data.stats?.user?.username || '');
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  return (
    <View style={globalStyles.container}>
      {/* Header with User Info */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: 'https://via.placeholder.com/48' }}
            style={styles.avatar}
          />
          <Text style={styles.greeting}>Hello, {userName}!</Text>
        </View>
      </View>

      {/* Tab Navigation - Similar to Uber's Rides/Eats */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'workout' && styles.tabActive]}
          onPress={() => setActiveTab('workout')}
        >
          <Icon 
            name="dumbbell" 
            size={24} 
            color={activeTab === 'workout' ? colors.textPrimary : colors.textSecondary} 
          />
          <Text style={[styles.tabLabel, activeTab === 'workout' && styles.tabLabelActive]}>
            Workout Log
          </Text>
          {activeTab === 'workout' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, styles.tabDisabled]}
          disabled={true}
        >
          <Icon 
            name="food-apple" 
            size={24} 
            color={colors.textTertiary} 
          />
          <Text style={[styles.tabLabel, styles.tabLabelDisabled]}>
            Macros Log
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'workout' ? (
        <WorkoutDashboardContent 
          navigation={navigation} 
          refreshRef={refreshWorkoutContentRef}
        />
      ) : (
        <MacroDashboardContent navigation={navigation} />
      )}
    </View>
  );
};

export default UnifiedDashboardScreen;

