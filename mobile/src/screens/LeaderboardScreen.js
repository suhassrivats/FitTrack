import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';
import colors from '../styles/colors';
import { API_URL } from '../services/api';

const LeaderboardScreen = ({ route, navigation }) => {
  const { classId } = route.params;
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/classes/${classId}/leaderboard`);
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return colors.textSecondary;
    }
  };

  const renderLeaderboardItem = (entry) => (
    <View
      key={entry.student.id}
      style={[
        styles.leaderboardItem,
        entry.rank <= 3 && styles.topThree,
      ]}
    >
      {/* Rank */}
      <View style={[styles.rankBadge, entry.rank <= 3 && { borderColor: getRankColor(entry.rank) }]}>
        <Text style={[styles.rankText, { color: getRankColor(entry.rank) }]}>
          {getRankEmoji(entry.rank)}
        </Text>
      </View>

      {/* Student Info */}
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{entry.student.full_name}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Icon name="dumbbell" size={12} color={colors.textSecondary} />
            <Text style={styles.statValue}>{entry.stats.total_workouts} workouts</Text>
          </View>
          <View style={styles.statBadge}>
            <Icon name="weight-kilogram" size={12} color={colors.textSecondary} />
            <Text style={styles.statValue}>{entry.stats.total_volume.toFixed(0)} kg</Text>
          </View>
        </View>
      </View>

      {/* Completion Rate */}
      <View style={styles.completionContainer}>
        <Text style={styles.completionText}>{entry.stats.completion_rate.toFixed(0)}%</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${entry.stats.completion_rate}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitleCenter}>Leaderboard</Text>
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
        {loading ? (
          <View style={globalStyles.centerContent}>
            <Text style={globalStyles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={globalStyles.emptyState}>
            <Icon name="trophy-outline" size={80} color={colors.textTertiary} />
            <Text style={globalStyles.emptyStateText}>No Rankings Yet</Text>
            <Text style={globalStyles.emptyStateSubtext}>
              Complete workouts to appear on the leaderboard
            </Text>
          </View>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <View style={styles.podium}>
                <View style={styles.podiumItem}>
                  <View style={[styles.podiumRank, styles.secondPlace]}>
                    <Text style={styles.podiumEmoji}>🥈</Text>
                    <Text style={styles.podiumName}>{leaderboard[1].student.full_name.split(' ')[0]}</Text>
                    <Text style={styles.podiumScore}>{leaderboard[1].stats.total_workouts}</Text>
                  </View>
                </View>
                <View style={styles.podiumItem}>
                  <View style={[styles.podiumRank, styles.firstPlace]}>
                    <Text style={styles.podiumEmoji}>🥇</Text>
                    <Text style={styles.podiumName}>{leaderboard[0].student.full_name.split(' ')[0]}</Text>
                    <Text style={styles.podiumScore}>{leaderboard[0].stats.total_workouts}</Text>
                  </View>
                </View>
                <View style={styles.podiumItem}>
                  <View style={[styles.podiumRank, styles.thirdPlace]}>
                    <Text style={styles.podiumEmoji}>🥉</Text>
                    <Text style={styles.podiumName}>{leaderboard[2].student.full_name.split(' ')[0]}</Text>
                    <Text style={styles.podiumScore}>{leaderboard[2].stats.total_workouts}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Full Leaderboard List */}
            <View style={styles.leaderboardList}>
              <Text style={styles.sectionTitle}>Rankings</Text>
              {leaderboard.map(renderLeaderboardItem)}
            </View>
          </>
        )}
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
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 32,
    gap: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  podiumRank: {
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  firstPlace: {
    borderColor: '#FFD700',
    paddingVertical: 24,
  },
  secondPlace: {
    borderColor: '#C0C0C0',
    paddingVertical: 20,
  },
  thirdPlace: {
    borderColor: '#CD7F32',
    paddingVertical: 16,
  },
  podiumEmoji: {
    fontSize: 32,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  topThree: {
    borderWidth: 2,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
    gap: 6,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  completionContainer: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 60,
  },
  completionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  progressBar: {
    width: 60,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});

export default LeaderboardScreen;


