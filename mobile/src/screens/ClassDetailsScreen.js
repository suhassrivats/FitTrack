import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';
import colors from '../styles/colors';
import { API_URL } from '../services/api';

const ClassDetailsScreen = ({ route, navigation }) => {
  const { classId } = route.params;
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    loadClassDetails();
  }, []);

  const loadClassDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/classes/${classId}`);
      const data = await response.json();
      setClassData(data.class);
      setIsInstructor(data.is_instructor || false);
    } catch (error) {
      console.error('Error loading class details:', error);
      Alert.alert('Error', 'Failed to load class details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadClassDetails();
  };

  const handleDeleteClass = () => {
    Alert.alert(
      'Delete Class',
      'Are you sure you want to delete this class? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/classes/${classId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Success', 'Class deleted successfully');
                navigation.goBack();
              } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to delete class');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete class');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <View style={globalStyles.centerContent}>
          <Text style={globalStyles.loadingText}>Loading class details...</Text>
        </View>
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={globalStyles.container}>
        <View style={globalStyles.centerContent}>
          <Text style={globalStyles.emptyStateText}>Class not found</Text>
        </View>
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
        <Text style={globalStyles.headerTitleCenter}>Class Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Class Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.classIconLarge}>
            <Icon name="school" size={48} color={colors.primary} />
          </View>
          <Text style={styles.className}>{classData.name}</Text>
          {classData.description && (
            <Text style={styles.classDescription}>{classData.description}</Text>
          )}
          
          {isInstructor && (
            <View style={styles.joinCodeContainer}>
              <Text style={styles.joinCodeLabel}>Join Code</Text>
              <View style={styles.joinCodeBox}>
                <Text style={styles.joinCode}>{classData.join_code}</Text>
              </View>
              <Text style={styles.joinCodeHelper}>
                Share this code with students to join
              </Text>
            </View>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="account-group" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{classData.member_count}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="dumbbell" size={32} color={colors.primary} />
            <Text style={styles.statValue}>
              {classData.assigned_workouts_count || 0}
            </Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              navigation.navigate('AssignedWorkouts', { classId: classData.id })
            }
          >
            <View style={styles.actionIcon}>
              <Icon name="dumbbell" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                {isInstructor ? 'Manage Workouts' : 'View Workouts'}
              </Text>
              <Text style={styles.actionSubtitle}>
                {isInstructor
                  ? 'Assign and track student workouts'
                  : 'View assigned workouts'}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              navigation.navigate('Leaderboard', { classId: classData.id })
            }
          >
            <View style={styles.actionIcon}>
              <Icon name="trophy" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Leaderboard</Text>
              <Text style={styles.actionSubtitle}>
                View class rankings and stats
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Instructor Actions */}
        {isInstructor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructor Actions</Text>
            
            <TouchableOpacity
              style={[styles.actionCard, styles.dangerCard]}
              onPress={handleDeleteClass}
            >
              <View style={[styles.actionIcon, styles.dangerIcon]}>
                <Icon name="delete" size={24} color={colors.error} />
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, styles.dangerText]}>
                  Delete Class
                </Text>
                <Text style={styles.actionSubtitle}>
                  Permanently delete this class
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Class Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.infoCard}>
            {classData.instructor && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Instructor</Text>
                <Text style={styles.infoValue}>
                  {classData.instructor.full_name}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>
                {new Date(classData.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 20,
  },
  headerCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  classIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  classDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  joinCodeContainer: {
    width: '100%',
    marginTop: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    alignItems: 'center',
    gap: 8,
  },
  joinCodeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  joinCodeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  joinCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 4,
  },
  joinCodeHelper: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 4,
  },
  actionCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dangerCard: {
    borderColor: colors.error,
  },
  dangerIcon: {
    borderColor: colors.error,
  },
  dangerText: {
    color: colors.error,
  },
  infoCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default ClassDetailsScreen;

