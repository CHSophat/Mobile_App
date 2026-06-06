import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';
import { spacing } from '@theme/index';
import ShareButton from '@components/common/ShareButton';

type Status = 'upcoming' | 'dueSoon' | 'overdue' | 'paid';

interface Props {
  amount: number;
  currency?: string;
  dueDate: string;
  daysLeft: number;
  status?: Status;
  invoiceNumber?: string;
  onPayPress?: () => void;
  showShare?: boolean;
}

const statusConfig: Record<
  Status,
  { labelKey: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  upcoming: { labelKey: 'payments.pending', color: '#1E40AF', bg: '#DBEAFE', icon: 'time-outline' },
  dueSoon: { labelKey: 'payments.pending', color: '#92400E', bg: '#FEF3C7', icon: 'alert-circle-outline' },
  overdue: { labelKey: 'payments.overdue', color: '#991B1B', bg: '#FEE2E2', icon: 'warning-outline' },
  paid: { labelKey: 'payments.paid', color: '#065F46', bg: '#D1FAE5', icon: 'checkmark-circle-outline' },
};

const inferStatus = (daysLeft: number): Status => {
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 5) return 'dueSoon';
  return 'upcoming';
};

const RentDueCard: React.FC<Props> = ({
  amount,
  currency = '$',
  dueDate,
  daysLeft,
  status,
  invoiceNumber,
  onPayPress,
  showShare = true,
}) => {
  const theme = useTheme();
  const { t, fonts } = useT();
  const s = status ?? inferStatus(daysLeft);
  const cfg = statusConfig[s];
  const styles = makeStyles(theme.colors, theme.fontScale, theme.isDark);

  return (
    <View style={styles.card}>
      <View pointerEvents="none" style={styles.bgIcon}>
        <Ionicons
          name="home"
          size={160}
          color={theme.isDark ? '#ffffff14' : '#ffffff22'}
        />
      </View>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconChip}>
            <Ionicons name="wallet" size={16} color={theme.colors.white} />
          </View>
          <Text style={[styles.title, { fontFamily: fonts.medium }]}>
            {t('home.rentDue')}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={12} color={cfg.color} />
          <Text style={[styles.badgeText, { color: cfg.color, fontFamily: fonts.medium }]}>
            {t(cfg.labelKey)}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.amount, { fontFamily: fonts.bold }]}>
          {currency}
          {amount.toLocaleString()}
        </Text>
        <Text style={[styles.due, { fontFamily: fonts.regular }]}>
          {t('home.dueOn', { date: dueDate })}
          {daysLeft >= 0 ? ` · ${daysLeft}d` : ''}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.payBtn}
          activeOpacity={0.9}
          onPress={onPayPress}
          disabled={s === 'paid'}
        >
          <Ionicons name="card" size={16} color={theme.colors.primaryDark} />
          <Text style={[styles.payBtnLabel, { fontFamily: fonts.bold, color: theme.colors.primaryDark }]}>
            {t('home.payNow')}
          </Text>
        </TouchableOpacity>
        {showShare ? (
          <ShareButton
            variant="pill"
            color={theme.colors.white}
            style={styles.shareBtn}
            payload={{
              kind: 'invoice',
              context: {
                number: invoiceNumber ?? '-',
                amount: `${currency}${amount}`,
              },
            }}
          />
        ) : null}
      </View>
    </View>
  );
};

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number,
  isDark: boolean
) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.primary,
      borderRadius: 20,
      padding: spacing.lg,
      overflow: 'hidden',
      position: 'relative',
      ...Platform.select({
        ios: {
          shadowColor: c.primary,
          shadowOpacity: isDark ? 0.4 : 0.25,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 6 },
      }),
    },
    bgIcon: {
      position: 'absolute',
      right: -20,
      bottom: -30,
      transform: [{ rotate: '-12deg' }],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconChip: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#ffffff33',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { color: c.white, fontSize: 14 * fs, opacity: 0.95 },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeText: { fontSize: 11 * fs },
    body: { marginBottom: spacing.lg },
    amount: { color: c.white, fontSize: 34 * fs, lineHeight: 40 * fs },
    due: { color: '#ffffffd9', fontSize: 13 * fs, marginTop: 4 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    payBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: c.white,
      paddingVertical: 12,
      borderRadius: 999,
    },
    payBtnLabel: { fontSize: 14 * fs },
    shareBtn: { backgroundColor: '#ffffff33' },
  });

export default RentDueCard;
