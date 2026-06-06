import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';

export const globalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },

  screenPadding: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  // Text Styles
  h1: {
    ...typography.h1,
    color: colors.text,
  },
  h2: {
    ...typography.h2,
    color: colors.text,
  },
  h3: {
    ...typography.h3,
    color: colors.text,
  },
  h4: {
    ...typography.h4,
    color: colors.text,
  },
  h5: {
    ...typography.h5,
    color: colors.text,
  },
  h6: {
    ...typography.h6,
    color: colors.text,
  },

  body1: {
    ...typography.body1,
    color: colors.text,
  },
  body2: {
    ...typography.body2,
    color: colors.text,
  },

  button: {
    ...typography.button,
    color: colors.text,
  },

  label: {
    ...typography.label,
    color: colors.text,
  },

  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Flex Layouts
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  flexBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  flexStart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  flexEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  flexColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.lg,
    ...shadows.md,
  },

  // Inputs
  inputContainer: {
    marginBottom: spacing.lg,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body1.fontSize,
    color: colors.text,
    backgroundColor: colors.surface,
  },

  // Buttons
  buttonContainer: {
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
  },

  buttonSecondary: {
    backgroundColor: colors.secondary,
  },

  buttonOutlined: {
    borderWidth: 1,
    borderColor: colors.primary,
  },

  buttonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },

  buttonTextOutlined: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
  },
});
