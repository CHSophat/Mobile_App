import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@theme/index';

export interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  testID,
}) => {
  const buttonStyle = getButtonStyle(variant, size, disabled);
  const textStyle = getTextStyle(variant, size);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[buttonStyle.container, style]}
      testID={testID}
    >
      {icon && <>{icon}</> }
      <Text style={textStyle}>{loading ? '...' : label}</Text>
    </TouchableOpacity>
  );
};

const getButtonStyle = (
  variant: string,
  size: string,
  disabled: boolean
) => {
  const baseStyle = {
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      opacity: disabled ? 0.5 : 1,
    },
  };

  if (variant === 'primary') {
    return {
      ...baseStyle,
      container: {
        ...baseStyle.container,
        backgroundColor: colors.primary,
      },
    };
  }

  if (variant === 'secondary') {
    return {
      ...baseStyle,
      container: {
        ...baseStyle.container,
        backgroundColor: colors.secondary,
      },
    };
  }

  if (variant === 'outlined') {
    return {
      ...baseStyle,
      container: {
        ...baseStyle.container,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
      },
    };
  }

  return baseStyle;
};

const getTextStyle = (variant: string, size: string) => {
  const baseStyle = {
    color: variant === 'outlined' ? colors.primary : colors.white,
    fontWeight: '600' as const,
  };

  if (size === 'small') {
    return { ...baseStyle, fontSize: 12 };
  }
  if (size === 'large') {
    return { ...baseStyle, fontSize: 16 };
  }
  return { ...baseStyle, fontSize: 14 };
};
