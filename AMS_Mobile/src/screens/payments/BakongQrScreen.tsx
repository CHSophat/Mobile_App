import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'qrcode';
import Svg, { Path } from 'react-native-svg';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

interface BakongQrScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
  route?: { params?: { amount?: number; reference?: string } };
}

const MOCK = {
  amount: 450,
  currency: 'USD',
  reference: 'RENT-2025-05',
  recipient: 'AMS Property · Riverside',
  bakongAccount: 'sopheak@aclb',
};

const BakongQrScreen: React.FC<BakongQrScreenProps> = ({
  navigation,
  route,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const amount = route?.params?.amount ?? MOCK.amount;
  const reference = route?.params?.reference ?? MOCK.reference;

  const [qrPath, setQrPath] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(300);

  useEffect(() => {
    const payload = `bakong://pay?to=${encodeURIComponent(
      MOCK.bakongAccount
    )}&amount=${amount}&currency=${MOCK.currency}&ref=${encodeURIComponent(
      reference
    )}`;

    QRCode.toString(payload, {
      type: 'svg',
      margin: 1,
      width: 220,
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then((svg: string) => {
        const m = svg.match(/<path[^>]+d="([^"]+)"/);
        if (m) setQrPath(m[1]);
      })
      .catch(() => setQrPath(null));
  }, [amount, reference]);

  useEffect(() => {
    if (expiresIn <= 0) return;
    const id = setTimeout(() => setExpiresIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [expiresIn]);

  const mm = Math.floor(expiresIn / 60);
  const ss = String(expiresIn % 60).padStart(2, '0');

  const Step: React.FC<{ n: number; label: string; icon: any }> = ({
    n,
    label,
    icon,
  }) => (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{n}</Text>
      </View>
      <Ionicons name={icon} size={18} color={t.colors.primary} />
      <Text style={styles.stepLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={t.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bakong QR</Text>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name="share-social-outline"
            size={22}
            color={t.colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>
            ${amount.toFixed(2)}
            <Text style={styles.amountCurrency}> {MOCK.currency}</Text>
          </Text>
          <Text style={styles.reference}>Ref · {reference}</Text>
        </View>

        <View style={styles.qrCard}>
          <View style={styles.qrBox}>
            {qrPath ? (
              <Svg width={220} height={220} viewBox="0 0 29 29">
                <Path d={qrPath} fill="#000000" />
              </Svg>
            ) : (
              <View style={styles.qrFallback}>
                <Ionicons
                  name="qr-code-outline"
                  size={120}
                  color={t.colors.text}
                />
              </View>
            )}
          </View>

          <View style={styles.countdownRow}>
            <Ionicons name="time-outline" size={14} color={t.colors.warning} />
            <Text style={styles.countdownText}>
              {expiresIn > 0
                ? `Expires in ${mm}:${ss}`
                : 'QR expired — refresh'}
            </Text>
          </View>

          <Text style={styles.recipient}>{MOCK.recipient}</Text>
          <Text style={styles.account}>{MOCK.bakongAccount}</Text>
        </View>

        <View style={styles.steps}>
          <Step
            n={1}
            label="Open the Bakong app on your phone"
            icon="phone-portrait-outline"
          />
          <Step n={2} label="Tap Scan QR" icon="scan-outline" />
          <Step
            n={3}
            label="Confirm the amount and reference"
            icon="checkmark-circle-outline"
          />
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          activeOpacity={0.85}
          onPress={() => setExpiresIn(300)}
        >
          <Ionicons name="refresh-outline" size={18} color={t.colors.primary} />
          <Text style={styles.refreshBtnLabel}>Refresh QR</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
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
      paddingTop: spacing.lg,
      paddingBottom: spacing['4xl'],
    },
    amountCard: {
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 14,
      paddingVertical: spacing.lg,
      borderWidth: 1,
      borderColor: c.primarySoft,
      marginBottom: spacing.md,
    },
    amountLabel: { fontSize: 12 * fs, color: c.textSecondary },
    amountValue: {
      fontSize: 32 * fs,
      fontWeight: '700',
      color: c.text,
      marginTop: 2,
    },
    amountCurrency: { fontSize: 16 * fs, color: c.textSecondary },
    reference: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 6 },
    qrCard: {
      backgroundColor: c.surface,
      borderRadius: 18,
      padding: spacing.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    qrBox: {
      width: 220,
      height: 220,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.sm,
      marginBottom: spacing.md,
    },
    qrFallback: { alignItems: 'center', justifyContent: 'center' },
    countdownRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: spacing.sm,
    },
    countdownText: { fontSize: 12 * fs, color: c.warning, fontWeight: '600' },
    recipient: { fontSize: 14 * fs, fontWeight: '600', color: c.text },
    account: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    steps: { marginTop: spacing.xl, gap: spacing.sm },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    stepBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBadgeText: {
      color: c.primaryDark,
      fontSize: 11 * fs,
      fontWeight: '700',
    },
    stepLabel: { flex: 1, fontSize: 13 * fs, color: c.text },
    refreshBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.surface,
      borderRadius: 999,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: c.primary,
      marginTop: spacing.lg,
    },
    refreshBtnLabel: { color: c.primary, fontSize: 14 * fs, fontWeight: '600' },
  });

export default BakongQrScreen;
