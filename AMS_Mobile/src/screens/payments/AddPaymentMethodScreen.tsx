import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';
import { paymentServiceV2 } from '@services/api/paymentServiceV2';
import { tokenizeCard, luhnValid } from '@utils/cardTokenization';

interface AddPaymentMethodScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
}

const formatCardNumber = (raw: string) =>
  raw
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const formatExpiry = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const brandFor = (
  number: string,
  fallback: string
): { name: string; icon: any; color: string } => {
  const d = number.replace(/\s/g, '');
  if (/^4/.test(d)) return { name: 'Visa', icon: 'card-outline', color: '#1A1F71' };
  if (/^5[1-5]/.test(d))
    return { name: 'Mastercard', icon: 'card-outline', color: '#EB001B' };
  if (/^3[47]/.test(d))
    return { name: 'Amex', icon: 'card-outline', color: '#2E77BB' };
  return { name: 'Card', icon: 'card-outline', color: fallback };
};

const AddPaymentMethodScreen: React.FC<AddPaymentMethodScreenProps> = ({
  navigation,
}) => {
  const t = useTheme();
  const { t: tr, fonts } = useT();
  const styles = makeStyles(t.colors, t.fontScale);
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [setPrimary, setSetPrimary] = useState(true);
  const [saving, setSaving] = useState(false);

  const brand = brandFor(number, t.colors.primary);
  const numberDigits = number.replace(/\s/g, '');
  const isValid =
    numberDigits.length >= 13 &&
    luhnValid(numberDigits) &&
    name.trim().length >= 3 &&
    expiry.length === 5 &&
    cvc.length >= 3;

  const last4 = numberDigits.slice(-4).padStart(4, '•');

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const [mm, yy] = expiry.split('/');
      const tokenized = await tokenizeCard({
        number: numberDigits,
        cvv: cvc,
        expMonth: parseInt(mm, 10),
        expYear: 2000 + parseInt(yy, 10),
        holderName: name.trim(),
      });
      // Discard the raw inputs from memory ASAP.
      setCvc('');
      setNumber('');

      await paymentServiceV2.addMethod({
        kind: 'card',
        label: name.trim() || `${tokenized.brand.toUpperCase()} ····${tokenized.last4}`,
        masked: `•••• •••• •••• ${tokenized.last4}`,
        isDefault: setPrimary,
        // The backend should accept these extra fields on the DTO. Until then
        // they pass through harmlessly via the open-shape Partial<PaymentMethod>.
        ...({
          token: tokenized.token,
          fingerprint: tokenized.fingerprint,
          brand: tokenized.brand,
          expMonth: tokenized.expMonth,
          expYear: tokenized.expYear,
        } as any),
      });

      if (navigation.canGoBack()) navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        tr('common.error'),
        err?.message || tr('errors.unknown')
      );
    } finally {
      setSaving(false);
    }
  };

  const Field: React.FC<{
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
    keyboardType?: any;
    autoCapitalize?: any;
    icon: any;
    secureTextEntry?: boolean;
  }> = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    autoCapitalize,
    icon,
    secureTextEntry,
  }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color={t.colors.textSecondary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.colors.textHint}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          style={styles.input}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={t.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
          {tr('payments.addCard')}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardPreview}>
            <View style={styles.cardTopRow}>
              <Ionicons name="card" size={22} color={t.colors.white} />
              <Text style={styles.cardBrand}>{brand.name}</Text>
            </View>
            <Text style={styles.cardNumberText}>
              {`•••• •••• •••• ${last4}`}
            </Text>
            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardMetaLabel}>Card holder</Text>
                <Text style={styles.cardMetaValue}>
                  {name.toUpperCase() || 'YOUR NAME'}
                </Text>
              </View>
              <View>
                <Text style={styles.cardMetaLabel}>Expires</Text>
                <Text style={styles.cardMetaValue}>{expiry || 'MM/YY'}</Text>
              </View>
            </View>
          </View>

          <Field
            label="Card number"
            value={number}
            onChangeText={(v) => setNumber(formatCardNumber(v))}
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            icon="card-outline"
          />

          <Field
            label="Cardholder name"
            value={name}
            onChangeText={setName}
            placeholder="As shown on card"
            autoCapitalize="characters"
            icon="person-outline"
          />

          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Field
                label="Expiry"
                value={expiry}
                onChangeText={(v) => setExpiry(formatExpiry(v))}
                placeholder="MM/YY"
                keyboardType="number-pad"
                icon="calendar-outline"
              />
            </View>
            <View style={{ width: spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Field
                label="CVC"
                value={cvc}
                onChangeText={(v) =>
                  setCvc(v.replace(/\D/g, '').slice(0, 4))
                }
                placeholder="123"
                keyboardType="number-pad"
                icon="lock-closed-outline"
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.toggleCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Set as primary</Text>
              <Text style={styles.toggleDesc}>
                Use this card by default for rent
              </Text>
            </View>
            <Switch
              value={setPrimary}
              onValueChange={setSetPrimary}
              trackColor={{ true: t.colors.primary, false: t.colors.border }}
              thumbColor={t.colors.white}
            />
          </View>

          <View style={styles.secureRow}>
            <Ionicons
              name="shield-checkmark"
              size={14}
              color={t.colors.success}
            />
            <Text style={styles.secureText}>
              Card details are encrypted and never stored on this device.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.cta, (!isValid || saving) && styles.ctaDisabled]}
            disabled={!isValid || saving}
            activeOpacity={0.85}
            onPress={onSave}
          >
            <Text style={[styles.ctaLabel, { fontFamily: fonts.bold }]}>
              {saving ? tr('common.loading') : tr('payments.saveCard')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    cardPreview: {
      height: 180,
      borderRadius: 18,
      backgroundColor: c.primaryDark,
      padding: spacing.lg,
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
    },
    cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    cardBrand: { color: c.white, fontSize: 14 * fs, fontWeight: '600' },
    cardNumberText: {
      color: c.white,
      fontSize: 22 * fs,
      fontWeight: '600',
      letterSpacing: 3,
    },
    cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
    cardMetaLabel: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 10 * fs,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    cardMetaValue: { color: c.white, fontSize: 13 * fs, fontWeight: '600' },
    field: { marginBottom: spacing.md },
    fieldLabel: {
      fontSize: 13 * fs,
      fontWeight: '500',
      color: c.textSecondary,
      marginBottom: spacing.xs,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.surface,
      paddingHorizontal: spacing.md,
      height: 50,
    },
    input: { flex: 1, fontSize: 15 * fs, color: c.text, paddingVertical: 0 },
    rowFields: { flexDirection: 'row' },
    toggleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 14,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    toggleLabel: { fontSize: 14 * fs, fontWeight: '600', color: c.text },
    toggleDesc: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    secureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    secureText: { color: c.textSecondary, fontSize: 12 * fs, flex: 1 },
    cta: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    ctaDisabled: { opacity: 0.5 },
    ctaLabel: { color: c.white, fontSize: 16 * fs, fontWeight: '600' },
  });

export default AddPaymentMethodScreen;
