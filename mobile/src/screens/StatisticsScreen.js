import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import { profileAPI } from '../services/api';
import { styles } from '../styles/StatisticsScreenStyles';

const StatisticsScreen = () => {
  const [stats, setStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadStatistics();
    }, [])
  );

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [profileRes, weeklyRes] = await Promise.all([
        profileAPI.getProfile(),
        profileAPI.getStats()
      ]);
      
      console.log('Stats loaded:', profileRes.data, weeklyRes.data);
      setStats(profileRes.data.stats);
      setWeeklyStats(weeklyRes.data.weekly_workouts || []);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const getMaxWeekCount = () => {
    if (weeklyStats.length === 0) return 1;
    return Math.max(...weeklyStats.map(w => w.count), 1);
  };

  if (loading) {
    return (
      <View style={globalStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Statistics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Overall Stats */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Overall Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="dumbbell" size={32} color={colors.primary} />
              <Text style={styles.statValue}>{stats?.total_workouts || 0}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="fire" size={32} color={colors.primary} />
              <Text style={styles.statValue}>{stats?.streak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="clock-outline" size={32} color={colors.primary} />
              <Text style={styles.statValue}>
                {Math.floor((stats?.total_time || 0) / 60)}
              </Text>
              <Text style={styles.statLabel}>Hours Trained</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="weight-kilogram" size={32} color={colors.primary} />
              <Text style={styles.statValue}>
                {stats?.total_volume ? (stats.total_volume / 1000).toFixed(1) : 0}k
              </Text>
              <Text style={styles.statLabel}>kg Lifted</Text>
            </View>
          </View>
        </View>

        {/* Workout Consistency Chart */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Workout Consistency</Text>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>This Month</Text>
            <Text style={styles.chartValue}>
              {weeklyStats.reduce((sum, w) => sum + w.count, 0)} Workouts
            </Text>
            <View style={styles.chartSubtext}>
              <Text style={styles.chartLabel}>Weekly breakdown</Text>
            </View>

            {/* Weekly Bar Chart */}
            <View style={styles.chart}>
              {weeklyStats.map((week, index) => {
                const maxCount = getMaxWeekCount();
                const heightPercent = (week.count / maxCount) * 100;
                
                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={[styles.bar, { height: `${Math.max(heightPercent, 8)}%` }]}>
                      {week.count > 0 && (
                        <Text style={styles.barCount}>{week.count}</Text>
                      )}
                    </View>
                    <Text style={styles.barLabel}>{week.week}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Personal Records */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Personal Records</Text>
          <View style={styles.recordCard}>
            <View style={styles.recordItem}>
              <Icon name="trophy" size={24} color={colors.primary} />
              <View style={styles.recordInfo}>
                <Text style={styles.recordValue}>Coming Soon</Text>
                <Text style={styles.recordLabel}>Best Lifts & PRs</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default StatisticsScreen;

