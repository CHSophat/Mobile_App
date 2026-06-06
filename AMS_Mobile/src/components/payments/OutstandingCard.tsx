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

interface OutstandingItem {
  id: string;
  label: string;
  amount: number;
}

interface Props {
  total: number;
  currency?: string;
  items?: OutstandingItem[];
  invoiceNumber?: string;
  onViewPress?: () => void;
  onPayPress?: () => void;
  showShare?: boolean;
}

const OutstandingCard: React.FC<Props> = ({
  total,
  currency = '$',
  items,
  invoiceNumber,
  onViewPress,
  onPayPress,
  showShare = true,
}) => {
  const theme = useTheme();
  const { t, fonts } = useT();
  const styles = makeStyles(theme.colors, theme.fontScale);
  const hasOutstanding = total > 0;

  return (
    <View style={styles.card}>
      <View pointerEvents="none" style={styles.bgIcon}>
        <Ionicons
          name={hasOutstanding ? 'receipt' : 'checkmark-circle'}
          size={140}
          color={theme.colors.primary + '14'}
        />
      </View>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconChip,
              {
                backgroundColor: hasOutstanding
                  ? theme.colors.warning + '20'
                  : theme.colors.success + '20',
              },
            ]}
          >
            <Ionicons
              name={hasOutstanding ? 'alert-circle' : 'checkmark-circle'}
              size={16}
              color={hasOutstanding ? theme.colors.warning : theme.colors.success}
            />
          </View>
          <Text style={[styles.title, { fontFamily: fonts.medium }]}>
            {t('home.outstanding')}
          </Text>
        </View>
        {showShare && hasOutstanding ? (
          <ShareButton
            payload={{
              kind: 'invoice',
              context: {
                number: invoiceNumber ?? 'outstanding',
                amount: `${currency}${total}`,
              },
            }}
          />
        ) : null}
      </View>

      <View style={styles.body}>
        <Text
          style={[
            styles.amount,
            { fontFamily: fonts.bold, color: hasOutstanding ? theme.colors.text : theme.colors.success },
          ]}
        >
          {currency}
          {total.toLocaleString()}
        </Text>
        {items && items.length > 0 ? (
          <View style={styles.itemList}>
            {items.slice(0, 3).map((it, i) => (
              <View
                key={it.id}
                style={[
                  styles.itemRow,
                  i < Math.min(items.length, 3) - 1 && styles.itemRowBorder,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.itemLabel, { fontFamily: fonts.regular }]}
                >
                  {it.label}
                </Text>
                <Text
                  style={[styles.itemAmount, { fontFamily: fonts.medium }]}
                >
                  {currency}
                  {it.amount.toLocaleString()}
                </Text>
              </View>
            ))}
            {items.length > 3 ? (
              <Text style={[styles.moreText, { fontFamily: fonts.regular }]}>
                +{items.length - 3}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {hasOutstanding ? (
        <View style={styles.actions}>
          {onViewPress ? (
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              activeOpacity={0.85}
              onPress={onViewPress}
            >
              <Text
                style={[
                  styles.btnLabel,
                  { color: theme.colors.primary, fontFamily: fonts.medium },
                ]}
              >
                {t('common.seeAll')}
              </Text>
            </TouchableOpacity>
          ) : null}
          {onPayPress ? (
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              activeOpacity={0.85}
              onPress={onPayPress}
            >
              <Text
                style={[
                  styles.btnLabel,
                  { color: theme.colors.white, fontFamily: fonts.bold },
                ]}
              >
                {t('home.payNow')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number
) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
      position: 'relative',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
        android: { elevation: 2 },
      }),
    },
    bgIcon: {
      position: 'absolute',
      right: -20,
      bottom: -25,
      transform: [{ rotate: '10deg' }],
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { color: c.textSecondary, fontSize: 13 * fs },
    body: { marginBottom: spacing.md },
    amount: { fontSize: 28 * fs, lineHeight: 34 * fs },
    itemList: { marginTop: spacing.md },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    itemRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    itemLabel: { flex: 1, fontSize: 13 * fs, color: c.text },
    itemAmount: { fontSize: 13 * fs, color: c.text },
    moreText: {
      fontSize: 12 * fs,
      color: c.textSecondary,
      paddingTop: 6,
      textAlign: 'right',
    },
    actions: { flexDirection: 'row', gap: spacing.sm },
    btn: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnGhost: {
      backgroundColor: c.primarySoft,
    },
    btnPrimary: { backgroundColor: c.primary },
    btnLabel: { fontSize: 13 * fs },
  });

export default OutstandingCard;
