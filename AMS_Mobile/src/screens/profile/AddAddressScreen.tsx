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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';
import { useAppSelector } from '@store/hooks';
import { customerService, type AddressDto } from '@services/api/customerService';

interface AddAddressScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
  route?: { params?: { address?: AddressDto } };
}

type LabelKey = 'home' | 'work' | 'other';
const LABELS: { key: LabelKey; label: string; icon: any }[] = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'work', label: 'Work', icon: 'briefcase-outline' },
  { key: 'other', label: 'Other', icon: 'bookmark-outline' },
];

const AddAddressScreen: React.FC<AddAddressScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { t: tr, fonts } = useT();
  const t = theme;
  const styles = makeStyles(t.colors, t.fontScale);
  const user = useAppSelector((s) => s.auth.user);
  const customerId = user?.id;
  const existing = route?.params?.address;

  const inferLabel = (raw?: string | null): LabelKey => {
    if (!raw) return 'home';
    const low = raw.toLowerCase();
    if (low.includes('home')) return 'home';
    if (low.includes('work') || low.includes('office')) return 'work';
    return 'other';
  };

  const [label, setLabel] = useState<LabelKey>(inferLabel(existing?.label));
  const [customLabel, setCustomLabel] = useState(
    inferLabel(existing?.label) === 'other' ? existing?.label ?? '' : ''
  );
  const [line1, setLine1] = useState(existing?.line1 ?? '');
  const [line2, setLine2] = useState(existing?.line2 ?? '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [postal, setPostal] = useState(existing?.postalCode ?? '');
  const [country, setCountry] = useState(existing?.country ?? 'Cambodia');
  const [primary, setPrimary] = useState(existing?.isPrimary ?? false);
  const [saving, setSaving] = useState(false);

  const canSubmit =
    !!customerId &&
    line1.trim().length > 2 &&
    city.trim().length > 1 &&
    (label !== 'other' || customLabel.trim().length > 0);

  const submit = async () => {
    if (!customerId || saving) return;
    setSaving(true);
    try {
      const payload = {
        label: label === 'other' ? customLabel.trim() : LABELS.find((l) => l.key === label)?.label,
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim() || undefined,
        postalCode: postal.trim() || undefined,
        country: country.trim() || undefined,
        isPrimary: primary,
      };
      if (existing) {
        await customerService.updateAddress(existing.id, payload);
      } else {
        await customerService.addAddress(customerId, payload);
      }
      if (navigation.canGoBack()) navigation.goBack();
    } catch (err: any) {
      Alert.alert(tr('common.error'), err?.message || tr('errors.unknown'));
    } finally {
      setSaving(false);
    }
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
        <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
          {existing ? tr('common.edit') : tr('profile.addAddress')}
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
          <Text style={styles.section}>Label</Text>
          <View style={styles.labelRow}>
            {LABELS.map((l) => {
              const active = label === l.key;
              return (
                <TouchableOpacity
                  key={l.key}
                  style={[styles.labelChip, active && styles.labelChipActive]}
                  activeOpacity={0.85}
                  onPress={() => setLabel(l.key)}
                >
                  <Ionicons
                    name={l.icon}
                    size={16}
                    color={active ? t.colors.primaryDark : t.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.labelChipText,
                      active && styles.labelChipTextActive,
                    ]}
                  >
                    {l.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {label === 'other' ? (
            <Field
              label="Custom label"
              value={customLabel}
              onChangeText={setCustomLabel}
              icon="bookmark-outline"
              placeholder="e.g. Parents' house"
              c={t.colors}
              fs={t.fontScale}
            />
          ) : null}

          <Field
            label="Address line 1"
            value={line1}
            onChangeText={setLine1}
            icon="location-outline"
            placeholder="Street, building, unit"
            c={t.colors}
            fs={t.fontScale}
          />
          <Field
            label="Address line 2 (optional)"
            value={line2}
            onChangeText={setLine2}
            icon="navigate-outline"
            placeholder="Apt, suite, landmark"
            c={t.colors}
            fs={t.fontScale}
          />
          <Field
            label="City"
            value={city}
            onChangeText={setCity}
            icon="business-outline"
            placeholder="Phnom Penh"
            c={t.colors}
            fs={t.fontScale}
          />
          <Field
            label="Postal code"
            value={postal}
            onChangeText={setPostal}
            icon="mail-open-outline"
            placeholder="12000"
            keyboardType="number-pad"
            c={t.colors}
            fs={t.fontScale}
          />
          <Field
            label="Country"
            value={country}
            onChangeText={setCountry}
            icon="globe-outline"
            c={t.colors}
            fs={t.fontScale}
          />

          <View style={styles.primaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.primaryLabel}>Set as primary</Text>
              <Text style={styles.primaryHint}>
                Use this address for billing & deliveries
              </Text>
            </View>
            <Switch
              value={primary}
              onValueChange={setPrimary}
              trackColor={{ true: t.colors.primary, false: t.colors.border }}
              thumbColor={t.colors.white}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.createBtn, (!canSubmit || saving) && styles.createBtnDisabled]}
          activeOpacity={0.85}
          disabled={!canSubmit || saving}
          onPress={submit}
        >
          {saving ? (
            <ActivityIndicator color={t.colors.white} />
          ) : (
            <Text style={[styles.createBtnLabel, { fontFamily: fonts.bold }]}>
              {existing ? tr('common.save') : tr('common.addNew')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  icon: any;
  placeholder?: string;
  keyboardType?: any;
  c: ReturnType<typeof useTheme>['colors'];
  fs: number;
}> = ({ label, value, onChangeText, icon, placeholder, keyboardType, c, fs }) => (
  <View style={{ marginBottom: spacing.lg }}>
    <Text
      style={{
        fontSize: 13 * fs,
        fontWeight: '500',
        color: c.textSecondary,
        marginBottom: spacing.xs,
      }}
    >
      {label}
    </Text>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 12,
        backgroundColor: c.surface,
        paddingHorizontal: spacing.md,
        height: 52,
      }}
    >
      <Ionicons name={icon} size={18} color={c.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textHint}
        keyboardType={keyboardType}
        style={{ flex: 1, fontSize: 15 * fs, color: c.text, paddingVertical: 0 }}
      />
    </View>
  </View>
);

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    headerRow: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
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
    section: {
      fontSize: 14 * fs,
      fontWeight: '600',
      color: c.text,
      marginBottom: spacing.sm,
    },
    labelRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    labelChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    labelChipActive: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    labelChipText: {
      fontSize: 13 * fs,
      color: c.textSecondary,
      fontWeight: '500',
    },
    labelChipTextActive: { color: c.primaryDark, fontWeight: '600' },
    primaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      marginTop: spacing.sm,
    },
    primaryLabel: { fontSize: 14 * fs, color: c.text, fontWeight: '600' },
    primaryHint: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    bottomBar: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      backgroundColor: c.surface,
    },
    createBtn: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },
    createBtnDisabled: { opacity: 0.5 },
    createBtnLabel: { color: c.white, fontSize: 16 * fs, fontWeight: '700' },
  });

export default AddAddressScreen;
