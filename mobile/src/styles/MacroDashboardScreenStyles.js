import { StyleSheet } from 'react-native';
import colors from './colors';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  dateSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  calendarStrip: {
    marginTop: 8,
  },
  calendarDay: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    marginRight: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  calendarDayActive: {
    backgroundColor: colors.primary,
  },
  calendarDayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  calendarDayNameActive: {
    color: colors.secondary,
    fontWeight: '600',
  },
  calendarDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  calendarDayNumberActive: {
    color: colors.secondary,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  adjustButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  adjustButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.cardBg,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  adherenceList: {
    gap: 12,
  },
  adherenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adherenceLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  adherenceStatus: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  intakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  intakeRight: {
    alignItems: 'flex-end',
  },
  intakeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  intakeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  macroProgressList: {
    gap: 16,
  },
  macroProgressItem: {
    marginBottom: 8,
  },
  macroProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  macroProgressLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  macroProgressValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  macroProgressBarContainer: {
    height: 6,
    backgroundColor: colors.cardBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.secondary,
  },
  trendsGraph: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
    marginTop: 16,
  },
  trendDay: {
    alignItems: 'center',
    flex: 1,
  },
  trendDayLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  trendBar: {
    width: 20,
    height: 20,
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    marginBottom: 4,
  },
  trendDot: {
    marginTop: 4,
  },
  addFoodButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addFoodButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  mealIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealContent: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  mealMacros: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  mealCalories: {
    alignItems: 'flex-end',
  },
  mealCaloriesValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
});

