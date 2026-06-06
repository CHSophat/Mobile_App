import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import ShareButton from '@components/common/ShareButton';
import {
  paymentServiceV2,
  PaymentMethod,
  PaymentKind,
} from '@services/api/paymentServiceV2';

interface PayNowScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
  route?: {
    params?: { amount?: number; reference?: string; invoiceId?: number };
  };
}

interface DisplayMethod {
  id: string;
  kind: PaymentKind;
  paymentMethodId?: number;
  label: string;
  meta: string;
  icon: any;
  tint: string;
}

const ICONS: Record<PaymentKind, any> = {
  card: 'card-outline',
  bakong: 'qr-code-outline',
  bank: 'business-outline',
  cash: 'cash-outline',
  wallet: 'wallet-outline',
};

const PayNowScreen: React.FC<PayNowScreenProps> = ({ navigation, route }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const amount = route?.params?.amount ?? 0;
  const reference = route?.params?.reference ?? 'Payment';
  const invoiceId = route?.params?.invoiceId;

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    paymentServiceV2
      .listMethods()
      .then((list) => {
        if (active) setMethods(list);
      })
      .catch(() => {
        // Non-fatal: tenant can still pay with the always-available Bakong QR.
      })
      .finally(() => {
        if (active) setLoadingMethods(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Saved methods plus the always-available Bakong QR option.
  const displayMethods = useMemo<DisplayMethod[]>(() => {
    const saved: DisplayMethod[] = methods.map((m) => ({
      id: `pm-${m.id}`,
      kind: m.kind,
      paymentMethodId: m.id,
      label: m.label || `${m.kind.toUpperCase()} ${m.masked ?? ''}`.trim(),
      meta: m.isDefault ? 'Primary' : m.masked || '',
      icon: ICONS[m.kind] ?? 'card-outline',
      tint: m.kind === 'card' ? t.colors.primaryDark : t.colors.textSecondary,
    }));
    return [
      ...saved,
      {
        id: 'bakong',
        kind: 'bakong',
        label: 'Bakong QR',
        meta: 'Scan to pay from any Bakong app',
        icon: ICONS.bakong,
        tint: t.colors.primary,
      },
    ];
  }, [methods, t.colors]);

  useEffect(() => {
    if (!selectedId && displayMethods.length) {
      const def = displayMethods.find((m) => m.paymentMethodId) ?? displayMethods[0];
      setSelectedId(def.id);
    }
  }, [displayMethods, selectedId]);

  const selected =
    displayMethods.find((m) => m.id === selectedId) ?? displayMethods[0];

  const fee = 0;
  const total = amount + fee;

  const onPay = async () => {
    if (paying || !selected) return;
    if (selected.kind === 'bakong') {
      navigation.navigate('BakongQrScreen', { amount, reference, invoiceId });
      return;
    }
    setPaying(true);
    try {
      const payment = await paymentServiceV2.create({
        invoiceId,
        methodKind: selected.kind,
        paymentMethodId: selected.paymentMethodId,
        amount: total,
      });
      await paymentServiceV2.confirm(payment.id);
      setSuccess(true);
    } catch (err: any) {
      Alert.alert('Payment failed', err?.message || 'Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const SummaryRow: React.FC<{
    label: string;
    value: string;
    emphasize?: boolean;
  }> = ({ label, value, emphasize }) => (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, emphasize && styles.summaryEmph]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, emphasize && styles.summaryEmph]}>
        {value}
      </Text>
    </View>
  );

  const ReceiptRow: React.FC<{ label: string; value: string }> = ({
    label,
    value,
  }) => (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={styles.receiptValue}>{value}</Text>
    </View>
  );

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={48} color={t.colors.success} />
          </View>
          <Text style={styles.successTitle}>Payment successful</Text>
          <Text style={styles.successDesc}>
            ${total.toFixed(2)} sent for {reference}.
          </Text>
          <View style={styles.receiptCard}>
            <ReceiptRow label="Amount" value={`$${total.toFixed(2)}`} />
            <ReceiptRow label="Method" value={selected?.label ?? ''} />
            <ReceiptRow label="Reference" value={reference} />
            <ReceiptRow label="Date" value={new Date().toLocaleString()} />
          </View>
          <TouchableOpacity
            style={styles.cta}
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.ctaLabel}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={t.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay</Text>
        <ShareButton
          payload={{
            kind: 'invoice',
            context: { number: reference, amount: `$${amount.toFixed(2)}` },
          }}
          size={22}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount due</Text>
          <Text style={styles.amountValue}>${amount.toFixed(2)}</Text>
          <Text style={styles.amountRef}>{reference}</Text>
        </View>

        <Text style={styles.section}>Choose payment method</Text>
        <View style={styles.list}>
          {loadingMethods ? (
            <View style={styles.methodLoading}>
              <ActivityIndicator color={t.colors.primary} />
            </View>
          ) : null}
          {displayMethods.map((m) => {
            const active = selectedId === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodRow, active && styles.methodRowActive]}
                activeOpacity={0.85}
                onPress={() => setSelectedId(m.id)}
              >
                <View
                  style={[
                    styles.methodIconWrap,
                    { backgroundColor: m.tint + '22' },
                  ]}
                >
                  <Ionicons name={m.icon} size={20} color={m.tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodLabel}>{m.label}</Text>
                  <Text style={styles.methodMeta}>{m.meta}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.addRow}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddPaymentMethodScreen')}
          >
            <Ionicons name="add-circle-outline" size={20} color={t.colors.primary} />
            <Text style={styles.addLabel}>Add another method</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <SummaryRow label="Subtotal" value={`$${amount.toFixed(2)}`} />
          <SummaryRow label="Fee" value={`$${fee.toFixed(2)}`} />
          <View style={styles.summaryDivider} />
          <SummaryRow
            label="Total"
            value={`$${total.toFixed(2)}`}
            emphasize
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, paying && styles.ctaDisabled]}
          activeOpacity={0.85}
          disabled={paying || !selected}
          onPress={onPay}
        >
          {paying ? (
            <ActivityIndicator color={t.colors.white} />
          ) : (
            <Text style={styles.ctaLabel}>
              {selected?.kind === 'bakong'
                ? 'Show Bakong QR'
                : `Pay $${total.toFixed(2)}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
      backgroundColor: c.primary,
      borderRadius: 14,
      paddingVertical: spacing.xl,
      marginBottom: spacing.xl,
    },
    amountLabel: { color: c.primarySoft, fontSize: 13 * fs },
    amountValue: {
      color: c.white,
      fontSize: 34 * fs,
      fontWeight: '700',
      marginTop: 2,
    },
    amountRef: { color: c.primarySoft, fontSize: 12 * fs, marginTop: 4 },
    section: {
      fontSize: 13 * fs,
      fontWeight: '600',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: spacing.sm,
    },
    list: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.xl,
    },
    methodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    methodRowActive: { backgroundColor: c.primarySoft },
    methodLoading: { padding: spacing.lg, alignItems: 'center' },
    methodIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    methodLabel: { fontSize: 14 * fs, fontWeight: '600', color: c.text },
    methodMeta: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioActive: { borderColor: c.primary },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.primary,
    },
    addRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
    },
    addLabel: { color: c.primary, fontSize: 14 * fs, fontWeight: '600' },
    summary: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    summaryLabel: { color: c.textSecondary, fontSize: 13 * fs },
    summaryValue: { color: c.text, fontSize: 13 * fs, fontWeight: '500' },
    summaryEmph: { color: c.text, fontSize: 15 * fs, fontWeight: '700' },
    summaryDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginVertical: spacing.sm,
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      backgroundColor: c.surface,
    },
    cta: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaDisabled: { opacity: 0.7 },
    ctaLabel: { color: c.white, fontSize: 16 * fs, fontWeight: '600' },
    successWrap: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing['4xl'],
      alignItems: 'center',
    },
    successIcon: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: c.success + '22',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    successTitle: {
      fontSize: 22 * fs,
      fontWeight: '700',
      color: c.text,
      marginBottom: spacing.xs,
    },
    successDesc: {
      fontSize: 14 * fs,
      color: c.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    receiptCard: {
      width: '100%',
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.xl,
    },
    receiptRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    receiptLabel: { color: c.textSecondary, fontSize: 13 * fs },
    receiptValue: {
      color: c.text,
      fontSize: 13 * fs,
      fontWeight: '600',
      flexShrink: 1,
      textAlign: 'right',
      marginLeft: spacing.md,
    },
  });

export default PayNowScreen;
