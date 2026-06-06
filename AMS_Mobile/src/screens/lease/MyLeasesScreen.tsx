import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  customerService,
  LeaseHistoryDto,
  LeaseStatus,
} from '@services/api/customerService';

interface MyLeasesScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
}

const statusLabel = (s: LeaseStatus): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
};

const money = (amount: number, currency: string) =>
  currency === 'USD'
    ? `$${amount.toFixed(0)}`
    : `${amount.toFixed(0)} ${currency}`;

const MyLeasesScreen: React.FC<MyLeasesScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const { user } = useAuth();
  const customerId = user?.userId;

  const [leases, setLeases] = useState<LeaseHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!customerId) {
      setError('You need to be signed in to view leases.');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      setLeases(await customerService.getLeaseHistory(customerId));
    } catch (e: any) {
      setError(e?.message || 'Failed to load leases.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const statusColor = (s: LeaseStatus) => {
    if (s === 'active') return t.colors.primary;
    if (s === 'upcoming' || s === 'pending') return t.colors.warning;
    return t.colors.textSecondary;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={t.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My leases & documents</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {error ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={18} color={t.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {!error && leases.length === 0 ? (
            <View style={styles.center}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={t.colors.textSecondary}
              />
              <Text style={styles.emptyText}>No leases on record yet.</Text>
            </View>
          ) : null}

          {leases.map((l) => {
            const sc = statusColor(l.status);
            return (
              <TouchableOpacity
                key={l.id}
                activeOpacity={0.85}
                style={styles.card}
                onPress={() =>
                  navigation.navigate('LeaseDetailScreen', {
                    leaseId: l.id,
                    lease: l,
                  })
                }
              >
                <View style={styles.cardHead}>
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={t.colors.primary}
                  />
                  <Text style={styles.cardNumber}>#{l.leaseNumber}</Text>
                  <View
                    style={[styles.statusPill, { backgroundColor: sc + '22' }]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: sc }]} />
                    <Text style={[styles.statusText, { color: sc }]}>
                      {statusLabel(l.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardUnit}>
                  {l.unitLabel ? `Unit ${l.unitLabel}` : 'Unit —'}
                  {l.propertyName ? ` · ${l.propertyName}` : ''}
                </Text>
                <Text style={styles.cardPeriod}>
                  {fmtDate(l.startDate)} → {fmtDate(l.endDate)}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardRent}>
                    {money(l.monthlyRent, l.currency)}/mo
                  </Text>
                  {l.requiresSignature ? (
                    <View style={styles.alertRow}>
                      <Ionicons
                        name="warning-outline"
                        size={14}
                        color={t.colors.warning}
                      />
                      <Text style={styles.alertText}>Action required</Text>
                    </View>
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={t.colors.textSecondary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing['4xl'],
    },
    errorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.error + '14',
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    errorText: { flex: 1, color: c.error, fontSize: 13 * fs },
    emptyText: { color: c.textSecondary, fontSize: 14 * fs },
    headerRow: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 18 * fs, fontWeight: '700', color: c.text },
    scroll: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing['4xl'],
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.md,
    },
    cardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    cardNumber: {
      flex: 1,
      fontSize: 16 * fs,
      fontWeight: '700',
      color: c.text,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: 999,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11 * fs, fontWeight: '600' },
    cardUnit: { fontSize: 14 * fs, color: c.text, marginTop: 2 },
    cardPeriod: {
      fontSize: 12 * fs,
      color: c.textSecondary,
      marginTop: 2,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    cardRent: { fontSize: 16 * fs, fontWeight: '700', color: c.text },
    alertRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    alertText: { color: c.warning, fontSize: 12 * fs, fontWeight: '600' },
  });

export default MyLeasesScreen;
