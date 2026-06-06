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
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useAppSelector } from '@store/hooks';
import { paymentServiceV2, Payment } from '@services/api/paymentServiceV2';
import { invoiceService, Invoice } from '@services/api/invoiceService';

interface PaymentsHomeScreenProps {
  navigation: { navigate: (s: string, p?: any) => void };
}

const money = (amount: number, currency = 'USD') => {
  const symbol = currency === 'USD' ? '$' : '';
  const suffix = currency === 'USD' ? '' : ` ${currency}`;
  return `${symbol}${amount.toFixed(2)}${suffix}`;
};

const formatDue = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const periodLabel = (inv: Invoice) =>
  inv.periodStart
    ? new Date(inv.periodStart).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : inv.invoiceNumber;

const PaymentsHomeScreen: React.FC<PaymentsHomeScreenProps> = ({
  navigation,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  // Auth lives in the Redux store (see authSlice); the user id doubles as the
  // customer id for the customer-scoped payment/invoice endpoints.
  const user = useAppSelector((s) => s.auth.user);
  const parsedId = Number(user?.id);
  const customerId =
    Number.isFinite(parsedId) && parsedId > 0 ? parsedId : undefined;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outstanding, setOutstanding] = useState<Invoice[]>([]);
  const [history, setHistory] = useState<Payment[]>([]);

  const load = useCallback(async () => {
    if (!customerId) {
      setError('You need to be signed in to view payments.');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const [invoices, payments] = await Promise.all([
        invoiceService.outstanding(customerId),
        paymentServiceV2.history(customerId),
      ]);
      setOutstanding(invoices);
      setHistory(payments);
    } catch (e: any) {
      setError(e?.message || 'Failed to load payments.');
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

  const goTo = (target: string, params?: any) => {
    const parent = (navigation as any).getParent?.();
    if (parent) parent.navigate(target, params);
    else navigation.navigate(target, params);
  };

  const outstandingTotal = outstanding.reduce(
    (sum, inv) => sum + (inv.total - inv.amountPaid),
    0
  );
  const currency = outstanding[0]?.currency || history[0]?.currency || 'USD';
  const upcoming = [...outstanding].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={t.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Payments</Text>

        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={18} color={t.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.outstandingCard}>
          <Text style={styles.outstandingLabel}>Outstanding</Text>
          <Text style={styles.outstandingAmount}>
            {money(outstandingTotal, currency)}
          </Text>
        </View>

        {upcoming ? (
          <View style={styles.upcomingCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.upcomingTitle}>{periodLabel(upcoming)}</Text>
              <Text style={styles.upcomingMeta}>
                Due {formatDue(upcoming.dueDate)}
              </Text>
            </View>
            <View style={styles.upcomingRight}>
              <Text style={styles.upcomingAmount}>
                {money(upcoming.total - upcoming.amountPaid, upcoming.currency)}
              </Text>
              <TouchableOpacity
                style={styles.payBtn}
                activeOpacity={0.85}
                onPress={() =>
                  goTo('PayNowScreen', {
                    amount: upcoming.total - upcoming.amountPaid,
                    reference: periodLabel(upcoming),
                    invoiceId: upcoming.id,
                  })
                }
              >
                <Text style={styles.payBtnLabel}>Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.upcomingCard}>
            <Text style={styles.upcomingMeta}>You're all caught up 🎉</Text>
          </View>
        )}

        <Text style={styles.section}>History</Text>
        <View style={styles.historyCard}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No payments yet.</Text>
          ) : (
            history.map((p, i) => (
              <View
                key={p.id}
                style={[
                  styles.historyRow,
                  i < history.length - 1 && styles.historyRowBorder,
                ]}
              >
                <Text style={styles.historyLabel}>
                  {p.paidAt
                    ? new Date(p.paidAt).toLocaleDateString(undefined, {
                        month: 'short',
                        year: 'numeric',
                      })
                    : new Date(p.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.historyStatus}>{p.status}</Text>
                <Text style={styles.historyAmount}>
                  {money(p.amount, p.currency)}
                </Text>
                <Ionicons
                  name={
                    p.status === 'succeeded'
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={18}
                  color={
                    p.status === 'succeeded'
                      ? t.colors.success
                      : t.colors.textSecondary
                  }
                />
              </View>
            ))
          )}
        </View>

        <Text style={styles.section}>Methods</Text>
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => goTo('AddPaymentMethodScreen')}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="add" size={20} color={t.colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Add card</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={t.colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => goTo('BakongQrScreen')}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="qr-code-outline" size={20} color={t.colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Bakong QR pay</Text>
          <View style={styles.qrBtn}>
            <Text style={styles.qrBtnLabel}>Show QR</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    center: { alignItems: 'center', justifyContent: 'center' },
    scroll: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing['4xl'],
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
    emptyText: {
      color: c.textSecondary,
      fontSize: 14 * fs,
      textAlign: 'center',
      padding: spacing.lg,
    },
    title: {
      fontSize: 24 * fs,
      fontWeight: '700',
      color: c.text,
      marginBottom: spacing.lg,
    },
    outstandingCard: {
      backgroundColor: c.primary,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    outstandingLabel: {
      color: c.primarySoft,
      fontSize: 13 * fs,
      marginBottom: spacing.xs,
    },
    outstandingAmount: { color: c.white, fontSize: 32 * fs, fontWeight: '700' },
    upcomingCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    upcomingTitle: { fontSize: 15 * fs, fontWeight: '600', color: c.text },
    upcomingMeta: { fontSize: 13 * fs, color: c.textSecondary, marginTop: 2 },
    upcomingRight: { alignItems: 'flex-end' },
    upcomingAmount: { fontSize: 17 * fs, fontWeight: '700', color: c.text },
    payBtn: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xs,
    },
    payBtnLabel: { color: c.white, fontWeight: '600', fontSize: 13 * fs },
    section: {
      fontSize: 15 * fs,
      fontWeight: '600',
      color: c.text,
      marginBottom: spacing.sm,
    },
    historyCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.xl,
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    historyRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    historyLabel: { flex: 1, fontSize: 14 * fs, color: c.text },
    historyStatus: { fontSize: 12 * fs, color: c.success, fontWeight: '600' },
    historyAmount: {
      fontSize: 14 * fs,
      fontWeight: '600',
      color: c.text,
      minWidth: 60,
      textAlign: 'right',
    },
    actionCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    actionIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: { flex: 1, fontSize: 14 * fs, color: c.text, fontWeight: '500' },
    qrBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      backgroundColor: c.primarySoft,
      borderRadius: 999,
    },
    qrBtnLabel: { color: c.primaryDark, fontSize: 12 * fs, fontWeight: '600' },
  });

export default PaymentsHomeScreen;
