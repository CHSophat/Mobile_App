export const colors = {
  // Primary Colors (brand teal)
  primary: '#5DBDB2',
  primaryDark: '#3A9B91',
  primaryLight: '#A8DDD7',
  primarySoft: '#E3F4F1',

  // Secondary Colors
  secondary: '#FF6F00',
  secondaryDark: '#E65100',
  secondaryLight: '#FFB74D',

  // Status Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Background Colors
  background: '#F7F7F5',
  surface: '#FFFFFF',
  backdrop: 'rgba(0, 0, 0, 0.5)',

  // Text Colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textDisabled: '#BDBDBD',
  textHint: '#9CA3AF',

  // Border Colors
  border: '#E0E0E0',
  divider: '#EEEEEE',

  // Semantic Colors
  danger: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',
  success: '#4CAF50',
};

export const lightTheme = {
  ...colors,
};

export const darkTheme = {
  ...colors,
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#BDBDBD',
  textDisabled: '#757575',
};
