import React, { useState, useCallback, useEffect } from 'react';
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

  // Load user info
  useFocusEffect(
    useCallback(() => {
      loadUserInfo();
    }, [])
  );

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
        <WorkoutDashboardContent navigation={navigation} />
      ) : (
        <MacroDashboardContent navigation={navigation} />
      )}
    </View>
  );
};

export default UnifiedDashboardScreen;

