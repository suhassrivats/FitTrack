import { StyleSheet } from 'react-native';
import colors from '../styles/colors';

export const styles = StyleSheet.create({
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  infoHeaderText: {
    flex: 1,
    gap: 4,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  equipmentText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  muscleText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  muscleBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#102216',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    borderRadius: 8,
    padding: 12,
  },
  tipIcon: {
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});

