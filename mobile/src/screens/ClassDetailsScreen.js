import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';
import colors from '../styles/colors';
import Button from '../components/Button';
import { classAPI } from '../services/api';

const ClassDetailsScreen = ({ route, navigation }) => {
  // Ensure classId is a number
  const classId = route.params?.classId ? Number(route.params.classId) : null;
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    loadClassDetails();
  }, []);

  // Reload join requests and members when screen comes into focus (for instructors)
  useFocusEffect(
    useCallback(() => {
      if (isInstructor && classData && classId) {
        console.log('Screen focused - reloading join requests and members');
        loadJoinRequests();
        loadMembers();
      }
    }, [isInstructor, classData, classId])
  );

  useEffect(() => {
    if (isInstructor && classData && classId) {
      console.log('Loading join requests and members for class:', classId);
      loadJoinRequests();
      loadMembers();
    }
  }, [isInstructor, classData, classId]);

  const loadClassDetails = async () => {
    try {
      if (!classId) {
        console.error('No classId provided');
        Alert.alert('Error', 'Class ID is missing');
        return;
      }
      
      console.log('Loading class details for classId:', classId);
      const response = await classAPI.getClass(classId);
      const classData = response.data.class;
      const isInstructorFlag = response.data.is_instructor || false;
      console.log('Class loaded. Is instructor:', isInstructorFlag);
      setClassData(classData);
      setIsInstructor(isInstructorFlag);
      
      // Load join requests and members if instructor
      // Use a small delay to ensure state is updated
      if (isInstructorFlag && classData && classId) {
        console.log('Instructor detected, loading join requests and members for class:', classId);
        // Use setTimeout to ensure state updates are complete
        setTimeout(() => {
          loadJoinRequests();
          loadMembers();
        }, 100);
      }
    } catch (error) {
      console.error('Error loading class details:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.error || 'Failed to load class details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadClassDetails();
    if (isInstructor) {
      loadJoinRequests();
      loadMembers();
    }
  };

  const loadJoinRequests = async () => {
    try {
      setLoadingRequests(true);
      console.log('Loading join requests for class:', classId);
      console.log('Is instructor:', isInstructor);
      console.log('Class data exists:', !!classData);
      
      if (!classId) {
        console.error('classId is undefined or null');
        Alert.alert('Error', 'Class ID is missing');
        return;
      }
      
      // Log the full URL that will be called
      const expectedUrl = `/classes/${classId}/join-requests`;
      console.log('Expected API URL:', expectedUrl);
      
      const response = await classAPI.getJoinRequests(classId);
      console.log('Join requests API response:', response.data);
      const requests = response.data.requests || [];
      console.log('Join requests list:', requests);
      setJoinRequests(requests);
    } catch (error) {
      console.error('Error loading join requests:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Request URL:', error.config?.url);
      console.error('Request method:', error.config?.method);
      
      // Don't show alert for 403 errors (permission denied) - just log it
      // This might happen if user navigates away before request completes
      if (error.response?.status === 403) {
        console.log('Permission denied - user may not be instructor or class may have changed');
        setJoinRequests([]);
      } else if (error.response?.status === 404) {
        console.error('404 Not Found - Check if classId is correct:', classId);
        console.error('Full request URL:', error.config?.baseURL + error.config?.url);
        Alert.alert('Error', `Class not found (ID: ${classId}). Please try refreshing.`);
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to load join requests';
        console.error('Showing error alert:', errorMessage);
        // Only show alert if it's not a network error or if it's a meaningful error
        if (error.response?.status !== 401) {
          Alert.alert('Error', errorMessage);
        }
      }
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await classAPI.getMembers(classId);
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await classAPI.acceptJoinRequest(classId, requestId);
      Alert.alert('Success', 'Join request accepted');
      loadJoinRequests();
      loadMembers();
      loadClassDetails(); // Refresh class data to update member count
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this join request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await classAPI.rejectJoinRequest(classId, requestId);
              Alert.alert('Success', 'Join request rejected');
              loadJoinRequests();
            } catch (error) {
              console.error('Error rejecting request:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to reject request');
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = (studentId, studentName) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${studentName || 'this student'} from the class?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await classAPI.removeMember(classId, studentId);
              Alert.alert('Success', 'Member removed successfully');
              loadMembers();
              loadClassDetails(); // Refresh class data to update member count
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const handleEditClass = () => {
    if (classData) {
      setEditName(classData.name);
      setEditDescription(classData.description || '');
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    try {
      setSaving(true);
      const response = await classAPI.updateClass(classId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      
      setClassData(response.data.class);
      setEditModalVisible(false);
      Alert.alert('Success', 'Class updated successfully');
    } catch (error) {
      console.error('Error updating class:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update class');
    } finally {
      setSaving(false);
    }
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
              await classAPI.deleteClass(classId);
              Alert.alert('Success', 'Class deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting class:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete class');
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
        {isInstructor && (
          <TouchableOpacity onPress={handleEditClass}>
            <Icon name="pencil" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        {!isInstructor && <View style={{ width: 24 }} />}
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

        {/* Pending Join Requests (Instructor Only) */}
        {isInstructor && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Join Requests</Text>
              {joinRequests.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{joinRequests.length}</Text>
                </View>
              )}
            </View>
            
            {loadingRequests ? (
              <Text style={styles.loadingText}>Loading requests...</Text>
            ) : joinRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Icon name="account-plus" size={32} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No pending requests</Text>
              </View>
            ) : (
              joinRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestName}>
                      {request.student?.full_name || request.student?.username || 'Unknown Student'}
                    </Text>
                    <Text style={styles.requestEmail}>
                      {request.student?.email || ''}
                    </Text>
                    <Text style={styles.requestDate}>
                      Requested {new Date(request.requested_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.acceptButton]}
                      onPress={() => handleAcceptRequest(request.id)}
                    >
                      <Icon name="check" size={20} color="#102216" />
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.rejectButton]}
                      onPress={() => handleRejectRequest(request.id)}
                    >
                      <Icon name="close" size={20} color={colors.error} />
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Class Members (Instructor Only) */}
        {isInstructor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Class Members ({members.length})</Text>
            
            {loadingMembers ? (
              <Text style={styles.loadingText}>Loading members...</Text>
            ) : members.length === 0 ? (
              <View style={styles.emptyCard}>
                <Icon name="account-group" size={32} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No members yet</Text>
              </View>
            ) : (
              members.map((membership) => (
                <View key={membership.id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberAvatar}>
                      <Icon name="account" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>
                        {membership.student?.full_name || membership.student?.username || 'Unknown'}
                      </Text>
                      <Text style={styles.memberEmail}>
                        {membership.student?.email || ''}
                      </Text>
                      <Text style={styles.memberDate}>
                        Joined {new Date(membership.joined_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeMemberButton}
                    onPress={() => handleRemoveMember(
                      membership.student_id,
                      membership.student?.full_name || membership.student?.username
                    )}
                  >
                    <Icon name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Instructor Actions */}
        {isInstructor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructor Actions</Text>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleEditClass}
            >
              <View style={styles.actionIcon}>
                <Icon name="pencil" size={24} color={colors.primary} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Edit Class</Text>
                <Text style={styles.actionSubtitle}>
                  Update class name and description
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

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

      {/* Edit Class Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={globalStyles.modalContainer}>
          <View style={globalStyles.modalContent}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>Edit Class</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Class Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="e.g., Advanced Strength Training"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
              />

              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Add details about this class..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setEditModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title={saving ? 'Saving...' : 'Save Changes'}
                variant="primary"
                onPress={handleSaveEdit}
                loading={saving}
                disabled={saving}
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
  modalBody: {
    padding: 20,
    gap: 12,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalInput: {
    height: 48,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalTextArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#102216',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
  },
  emptyCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  requestCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  requestInfo: {
    marginBottom: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  requestEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  acceptButtonText: {
    color: '#102216',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 1,
    borderColor: colors.error,
  },
  rejectButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  memberCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  memberDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  removeMemberButton: {
    padding: 4,
  },
});

export default ClassDetailsScreen;

