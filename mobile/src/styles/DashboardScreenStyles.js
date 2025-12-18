import { StyleSheet } from 'react-native';
import colors from '../styles/colors';

export const styles = StyleSheet.create({
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    position: 'relative',
  },
  tabActive: {
    // Active tab styling
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  tabDisabled: {
    opacity: 0.5,
  },
  tabLabelDisabled: {
    color: colors.textTertiary,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  quickAccessSection: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  quickAccessCardDisabled: {
    opacity: 0.6,
  },
  quickAccessLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  quickAccessValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  notificationButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  activityScroll: {
    gap: 16,
    paddingRight: 16,
  },
  activityCard: {
    width: 256,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  activityDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  activityStats: {
    flexDirection: 'row',
    gap: 16,
  },
  activityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityStatText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  exerciseCount: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  exerciseCountText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  emptyRoutines: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  emptyRoutinesText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  createRoutineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    marginTop: 8,
  },
  createRoutineText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  routineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  routineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  routineIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  routineDetail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  fab: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

