import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@theme/ThemeContext';

interface Props {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export const SkeletonBlock: React.FC<Props> = ({
  width = '100%',
  height = 14,
  radius = 8,
  style,
}) => {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface ListSkeletonProps {
  rows?: number;
  rowHeight?: number;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  rows = 4,
  rowHeight = 76,
}) => {
  const theme = useTheme();
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.row,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              height: rowHeight,
            },
          ]}
        >
          <SkeletonBlock width={48} height={48} radius={24} />
          <View style={styles.lines}>
            <SkeletonBlock width="60%" height={14} />
            <SkeletonBlock width="40%" height={12} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  lines: { flex: 1 },
});
