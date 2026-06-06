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
import { useT } from '@i18n/useT';
import RentDueCard from '@components/payments/RentDueCard';
import OutstandingCard from '@components/payments/OutstandingCard';

interface TenantHomeScreenProps {
  navigation: {
    navigate: (s: string, p?: any) => void;
  };
}

const MOCK = {
  userName: 'Sopheak',
  unit: 'Unit B-204',
  property: 'Riverside Apts',
  unreadNotifications: 3,
  rentDue: {
    amount: 450,
    dueDate: 'May 31',
    daysLeft: 13,
    invoiceNumber: 'INV-1042',
  },
  outstanding: {
    total: 125,
    invoiceNumber: 'INV-1041',
    items: [
      { id: 'a', label: 'Water — April', amount: 45 },
      { id: 'b', label: 'Late fee', amount: 30 },
      { id: 'c', label: 'Parking', amount: 50 },
    ],
  },
  activity: [
    { id: '1', icon: 'construct-outline', text: 'Maintenance #312 — In progress' },
    { id: '2', icon: 'cash-outline', text: 'Payment received — Apr 30' },
    { id: '3', icon: 'megaphone-outline', text: 'New announcement — May 12' },
  ],
};

const QUICK_ACTIONS = [
  { key: 'report', label: 'Report', icon: 'construct-outline', target: 'NewMaintenanceRequestScreen' },
  { key: 'lease', label: 'Lease', icon: 'document-text-outline', target: 'LeaseDetailScreen' },
  { key: 'msg', label: 'Message', icon: 'chatbubbles-outline', target: 'InboxScreen' },
];

const TenantHomeScreen: React.FC<TenantHomeScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const { t: tr, fonts } = useT();
  const styles = makeStyles(t.colors, t.fontScale);

  const goTo = (target: string) => {
    const parent = (navigation as any).getParent?.();
    if (parent) parent.navigate(target);
    else navigation.navigate(target);
  };

  const goPay = () =>
    (navigation as any).jumpTo?.('PaymentsTab') ?? goTo('PaymentsTab');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.greetingRow}>
              <Text style={[styles.greeting, { fontFamily: fonts.bold }]}>
                {tr('home.greeting', { name: MOCK.userName })}
              </Text>
              <Ionicons
                name="hand-left-outline"
                size={20}
                color={t.colors.warning}
                style={styles.waveIcon}
              />
            </View>
            <Text style={[styles.subtitle, { fontFamily: fonts.regular }]}>
              {MOCK.unit} · {MOCK.property}
            </Text>
          </View>
        </View>

        <RentDueCard
          amount={MOCK.rentDue.amount}
          dueDate={MOCK.rentDue.dueDate}
          daysLeft={MOCK.rentDue.daysLeft}
          invoiceNumber={MOCK.rentDue.invoiceNumber}
          onPayPress={goPay}
        />

        <View style={{ height: spacing.md }} />

        <OutstandingCard
          total={MOCK.outstanding.total}
          items={MOCK.outstanding.items}
          invoiceNumber={MOCK.outstanding.invoiceNumber}
          onViewPress={goPay}
          onPayPress={goPay}
        />

        <Text style={[styles.sectionTitle, { fontFamily: fonts.medium }]}>
          {tr('home.quickActions')}
        </Text>
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.key}
              style={styles.quickCard}
              activeOpacity={0.85}
              onPress={() => goTo(a.target)}
            >
              <View style={styles.quickIconWrap}>
                <Ionicons name={a.icon as any} size={22} color={t.colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { fontFamily: fonts.regular }]}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { fontFamily: fonts.medium }]}>
          {tr('home.recentActivity')}
        </Text>
        <View style={styles.activityCard}>
          {MOCK.activity.map((a, i) => (
            <View
              key={a.id}
              style={[
                styles.activityRow,
                i < MOCK.activity.length - 1 && styles.activityRowBorder,
              ]}
            >
              <Ionicons
                name={a.icon as any}
                size={18}
                color={t.colors.primaryDark}
              />
              <Text style={styles.activityText}>{a.text}</Text>
            </View>
          ))}
        </View>
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
      paddingTop: spacing.md,
      paddingBottom: spacing['4xl'],
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    greetingRow: { flexDirection: 'row', alignItems: 'center' },
    greeting: { fontSize: 22 * fs, fontWeight: '700', color: c.text },
    waveIcon: { marginLeft: spacing.xs },
    subtitle: { fontSize: 13 * fs, color: c.textSecondary, marginTop: 2 },
    rentCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.primarySoft,
    },
    rentCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    rentCardTitle: { fontSize: 13 * fs, color: c.textSecondary, fontWeight: '500' },
    rentCardBody: { marginBottom: spacing.md },
    rentAmount: { fontSize: 30 * fs, fontWeight: '700', color: c.text },
    rentMeta: { fontSize: 13 * fs, color: c.textSecondary, marginTop: 2 },
    payBtn: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    payBtnLabel: { color: c.white, fontWeight: '600', fontSize: 14 * fs },
    sectionTitle: {
      fontSize: 15 * fs,
      fontWeight: '600',
      color: c.text,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    quickRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    quickCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 14,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    quickIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    quickLabel: { fontSize: 13 * fs, color: c.text, fontWeight: '500' },
    activityCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
    },
    activityRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    activityText: { flex: 1, fontSize: 14 * fs, color: c.text },
  });

export default TenantHomeScreen;
