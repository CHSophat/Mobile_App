import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

interface PaymentsHomeScreenProps {
  navigation: { navigate: (s: string, p?: any) => void };
}

const MOCK = {
  outstanding: 450,
  upcoming: {
    title: 'May 2025 · Rent',
    amount: 450,
    dueDate: 'May 31',
  },
  history: [
    { id: '1', label: 'Apr 2025', amount: 450, status: 'Paid' },
    { id: '2', label: 'Mar 2025', amount: 450, status: 'Paid' },
    { id: '3', label: 'Feb 2025', amount: 450, status: 'Paid' },
  ],
};

const PaymentsHomeScreen: React.FC<PaymentsHomeScreenProps> = ({
  navigation,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);

  const goTo = (target: string, params?: any) => {
    const parent = (navigation as any).getParent?.();
    if (parent) parent.navigate(target, params);
    else navigation.navigate(target, params);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Payments</Text>

        <View style={styles.outstandingCard}>
          <Text style={styles.outstandingLabel}>Outstanding</Text>
          <Text style={styles.outstandingAmount}>${MOCK.outstanding}</Text>
        </View>

        <View style={styles.upcomingCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.upcomingTitle}>{MOCK.upcoming.title}</Text>
            <Text style={styles.upcomingMeta}>Due {MOCK.upcoming.dueDate}</Text>
          </View>
          <View style={styles.upcomingRight}>
            <Text style={styles.upcomingAmount}>${MOCK.upcoming.amount}</Text>
            <TouchableOpacity
              style={styles.payBtn}
              activeOpacity={0.85}
              onPress={() => goTo('PayNowScreen')}
            >
              <Text style={styles.payBtnLabel}>Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.section}>History</Text>
        <View style={styles.historyCard}>
          {MOCK.history.map((h, i) => (
            <View
              key={h.id}
              style={[
                styles.historyRow,
                i < MOCK.history.length - 1 && styles.historyRowBorder,
              ]}
            >
              <Text style={styles.historyLabel}>{h.label}</Text>
              <Text style={styles.historyStatus}>{h.status}</Text>
              <Text style={styles.historyAmount}>${h.amount}</Text>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={t.colors.success}
              />
            </View>
          ))}
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
    scroll: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing['4xl'],
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
