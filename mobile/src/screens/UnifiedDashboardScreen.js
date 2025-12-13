import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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
  
  // Sync with context on mount
  useEffect(() => {
    if (contextMode && contextMode !== activeTab) {
      setActiveTab(contextMode);
    }
  }, [contextMode]);
  
  // Update global mode when tab changes
  useEffect(() => {
    setActiveMode(activeTab);
  }, [activeTab, setActiveMode]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [userName, setUserName] = useState('');

  // Load user info
  useFocusEffect(
    useCallback(() => {
      loadUserInfo();
    }, [])
  );

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const statsRes = await workoutAPI.getStats();
      setStats(statsRes.data.stats);
      setUserName(statsRes.data.stats?.user?.full_name || statsRes.data.stats?.user?.username || '');
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

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
          style={[styles.tab, activeTab === 'macros' && styles.tabActive]}
          onPress={() => setActiveTab('macros')}
        >
          <Icon 
            name="food-apple" 
            size={24} 
            color={activeTab === 'macros' ? colors.textPrimary : colors.textSecondary} 
          />
          <Text style={[styles.tabLabel, activeTab === 'macros' && styles.tabLabelActive]}>
            Macros Log
          </Text>
          {activeTab === 'macros' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'workout' ? (
        <WorkoutDashboardContent navigation={navigation} stats={stats} />
      ) : (
        <MacroDashboardContent navigation={navigation} />
      )}
    </View>
  );
};

export default UnifiedDashboardScreen;

