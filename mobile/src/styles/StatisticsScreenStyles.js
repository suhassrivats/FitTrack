import { StyleSheet } from 'react-native';
import colors from './colors';

export const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  chartSubtext: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  chartIncrease: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  chart: {
    flexDirection: 'row',
    height: 180,
    gap: 24,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  chartBar: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    width: '100%',
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    borderRadius: 4,
    minHeight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
  },
  barLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  recordCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
  },
  recordInfo: {
    flex: 1,
    gap: 4,
  },
  recordValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  recordLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

