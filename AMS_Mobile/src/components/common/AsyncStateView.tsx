import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';
import { spacing } from '@theme/index';

interface Props {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  loadingSkeleton?: ReactNode;
  children: ReactNode;
}

const AsyncStateView: React.FC<Props> = ({
  loading,
  error,
  isEmpty,
  onRetry,
  emptyTitle,
  emptySubtitle,
  emptyIcon = 'document-text-outline',
  loadingSkeleton,
  children,
}) => {
  const theme = useTheme();
  const { t, fonts } = useT();
  const c = theme.colors;
  const fs = theme.fontScale;

  if (loading) {
    if (loadingSkeleton) return <>{loadingSkeleton}</>;
    return (
      <View style={styles.center}>
        <ActivityIndicator color={c.primary} size="large" />
        <Text
          style={{
            marginTop: spacing.md,
            color: c.textSecondary,
            fontFamily: fonts.regular,
          }}
        >
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <View
          style={[styles.iconCircle, { backgroundColor: c.error + '14' }]}
        >
          <Ionicons name="cloud-offline-outline" size={32} color={c.error} />
        </View>
        <Text
          style={[
            styles.title,
            { color: c.text, fontFamily: fonts.bold, fontSize: 16 * fs },
          ]}
        >
          {t('common.errorTitle')}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: c.textSecondary, fontFamily: fonts.regular, fontSize: 13 * fs },
          ]}
        >
          {error}
        </Text>
        {onRetry ? (
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: c.primary }]}
            onPress={onRetry}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={16} color={c.white} />
            <Text
              style={{
                color: c.white,
                fontFamily: fonts.bold,
                fontSize: 13 * fs,
              }}
            >
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.center}>
        <View
          style={[styles.iconCircle, { backgroundColor: c.primarySoft }]}
        >
          <Ionicons name={emptyIcon} size={32} color={c.primary} />
        </View>
        <Text
          style={[
            styles.title,
            { color: c.text, fontFamily: fonts.bold, fontSize: 16 * fs },
          ]}
        >
          {emptyTitle ?? t('common.emptyTitle')}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: c.textSecondary, fontFamily: fonts.regular, fontSize: 13 * fs },
          ]}
        >
          {emptySubtitle ?? t('common.emptySubtitle')}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { textAlign: 'center', maxWidth: 280 },
  retryBtn: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: 999,
  },
});

export default AsyncStateView;
