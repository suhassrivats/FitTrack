import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';
import colors from '../styles/colors';
import Button from '../components/Button';
import { classAPI } from '../services/api';

const ClassesScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [userRole, setUserRole] = useState('student'); // Default to student

  useEffect(() => {
    const initialize = async () => {
      await loadUserRole();
      loadClasses();
    };
    initialize();
  }, []);

  const loadUserRole = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('Loaded user role:', user.role);
        setUserRole(user.role || 'student');
      } else {
        console.log('No user found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      console.log('Classes API response:', response.data);
      const classesList = response.data.classes || [];
      console.log('Classes list:', classesList);
      setClasses(classesList);
    } catch (error) {
      console.error('Error loading classes:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.error || 'Failed to load classes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadClasses();
  };

  const handleJoinClass = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a join code');
      return;
    }

    try {
      const response = await classAPI.joinClass({ join_code: joinCode.toUpperCase() });
      Alert.alert(
        'Request Submitted',
        'Your join request has been submitted. Waiting for instructor approval.',
        [{ text: 'OK', onPress: () => {} }]
      );
      setJoinModalVisible(false);
      setJoinCode('');
      loadClasses();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit join request');
    }
  };

  const handleCreateClass = async () => {
    if (!className.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    try {
      const response = await classAPI.createClass({
        name: className,
        description: classDescription,
      });

      Alert.alert(
        'Success',
        `Class created! Share code ${response.data.class.join_code} with students.`,
        [{ text: 'OK', onPress: () => {} }]
      );
      setCreateModalVisible(false);
      setClassName('');
      setClassDescription('');
      loadClasses();
    } catch (error) {
      console.error('Create class error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create class');
    }
  };

  const renderEmptyState = () => (
    <View style={globalStyles.emptyState}>
      <Icon name="account-group" size={80} color={colors.textTertiary} />
      <Text style={globalStyles.emptyStateText}>
        {userRole === 'instructor' ? 'No Classes Yet' : 'Not Enrolled in Any Classes'}
      </Text>
      <Text style={globalStyles.emptyStateSubtext}>
        {userRole === 'instructor'
          ? 'Create your first class to get started'
          : 'Join a class using a code from your instructor'}
      </Text>
    </View>
  );

  const renderClassCard = (classItem) => (
    <TouchableOpacity
      key={classItem.id}
      style={styles.classCard}
      onPress={() => navigation.navigate('ClassDetails', { classId: classItem.id })}
    >
      <View style={styles.classHeader}>
        <View style={styles.classIcon}>
          <Icon name="school" size={28} color={colors.primary} />
        </View>
        <View style={styles.classInfo}>
          <Text style={styles.className}>{classItem.name}</Text>
          {classItem.instructor && (
            <Text style={styles.instructorName}>
              <Icon name="account" size={14} color={colors.textSecondary} />{' '}
              {classItem.instructor.full_name}
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.classDescription} numberOfLines={2}>
        {classItem.description}
      </Text>

      <View style={styles.classFooter}>
        <View style={styles.statItem}>
          <Icon name="account-group" size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{classItem.member_count} Members</Text>
        </View>
        {userRole === 'instructor' && (
          <View style={styles.statItem}>
            <Icon name="key" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>{classItem.join_code}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Leaderboard', { classId: classItem.id })}
        >
          <Icon name="trophy" size={18} color={colors.primary} />
          <Text style={styles.actionText}>Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate(
              userRole === 'instructor' ? 'ClassDetails' : 'AssignedWorkouts',
              { classId: classItem.id }
            )
          }
        >
          <Icon name="dumbbell" size={18} color={colors.primary} />
          <Text style={styles.actionText}>
            {userRole === 'instructor' ? 'Manage' : 'Workouts'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>My Classes</Text>
        <TouchableOpacity
          onPress={() =>
            userRole === 'instructor'
              ? setCreateModalVisible(true)
              : setJoinModalVisible(true)
          }
        >
          <Icon name="plus-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Classes List */}
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
        {loading ? (
          <View style={globalStyles.centerContent}>
            <Text style={globalStyles.loadingText}>Loading classes...</Text>
          </View>
        ) : classes.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.classesGrid}>
            {classes.map(renderClassCard)}
          </View>
        )}
      </ScrollView>

      {/* Join Class Modal */}
      <Modal
        visible={joinModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={globalStyles.modalContainer}>
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>Join Class</Text>
              <TouchableOpacity onPress={() => setJoinModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Enter Class Code</Text>
              <TextInput
                style={[globalStyles.input, styles.codeInput]}
                value={joinCode}
                onChangeText={setJoinCode}
                placeholder="e.g., FIT2024A"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="characters"
                maxLength={8}
              />
              <Text style={styles.helperText}>
                Ask your instructor for the class join code
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setJoinModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Join Class"
                variant="primary"
                onPress={handleJoinClass}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Class Modal (Instructor) */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={globalStyles.modalContainer}>
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>Create Class</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Class Name *</Text>
              <TextInput
                style={globalStyles.input}
                value={className}
                onChangeText={setClassName}
                placeholder="e.g., Advanced Strength Training"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
              />

              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                style={[globalStyles.input, styles.descriptionInput]}
                value={classDescription}
                onChangeText={setClassDescription}
                placeholder="Add details about this class..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.helperText}>
                Students will use a unique join code to enroll in your class
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setCreateModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Create Class"
                variant="primary"
                onPress={handleCreateClass}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  classesGrid: {
    gap: 16,
  },
  classCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  classIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  classDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  classFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalBody: {
    padding: 20,
    gap: 12,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  descriptionInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  helperText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  modalButton: {
    flex: 1,
  },
});

export default ClassesScreen;

