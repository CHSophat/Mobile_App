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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

interface OtherCategoryScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
  route?: { params?: { onPick?: (label: string) => void } };
}

const SUGGESTIONS = [
  { key: 'pest', label: 'Pest control', icon: 'bug-outline' },
  { key: 'paint', label: 'Paint / wall', icon: 'color-palette-outline' },
  { key: 'window', label: 'Window / glass', icon: 'square-outline' },
  { key: 'cleaning', label: 'Cleaning', icon: 'sparkles-outline' },
  { key: 'internet', label: 'Internet / TV', icon: 'wifi-outline' },
  { key: 'noise', label: 'Noise complaint', icon: 'volume-high-outline' },
  { key: 'security', label: 'Security concern', icon: 'shield-checkmark-outline' },
  { key: 'misc', label: 'Something else', icon: 'help-circle-outline' },
];

const OtherCategoryScreen: React.FC<OtherCategoryScreenProps> = ({
  navigation,
  route,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState('');

  const finalLabel =
    selected && selected !== 'misc'
      ? SUGGESTIONS.find((s) => s.key === selected)?.label ?? ''
      : custom.trim();

  const canConfirm = finalLabel.length > 1;

  const confirm = () => {
    route?.params?.onPick?.(finalLabel);
    if (navigation.canGoBack()) navigation.goBack();
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
        <Text style={styles.headerTitle}>Other category</Text>
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
          <Text style={styles.hint}>
            Pick a common issue, or describe your own below.
          </Text>

          <View style={styles.grid}>
            {SUGGESTIONS.map((s) => {
              const active = selected === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.card, active && styles.cardActive]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSelected(s.key);
                    if (s.key !== 'misc') setCustom('');
                  }}
                >
                  <View
                    style={[
                      styles.cardIconWrap,
                      active && { backgroundColor: t.colors.primary + '22' },
                    ]}
                  >
                    <Ionicons
                      name={s.icon as any}
                      size={20}
                      color={active ? t.colors.primary : t.colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[styles.cardLabel, active && styles.cardLabelActive]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.section}>Or describe it</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="create-outline"
              size={18}
              color={t.colors.textSecondary}
            />
            <TextInput
              value={custom}
              onChangeText={(v) => {
                setCustom(v);
                if (v.length > 0) setSelected('misc');
              }}
              placeholder="e.g. Balcony door won't close"
              placeholderTextColor={t.colors.textHint}
              style={styles.input}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.cta, !canConfirm && styles.ctaDisabled]}
          activeOpacity={0.85}
          disabled={!canConfirm}
          onPress={confirm}
        >
          <Text style={styles.ctaLabel}>Use this category</Text>
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
      paddingBottom: spacing.sm,
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
    hint: { fontSize: 13 * fs, color: c.textSecondary, marginBottom: spacing.lg },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    card: {
      flexBasis: '47%',
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.surface,
      borderRadius: 14,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardActive: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    cardIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.divider,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardLabel: { flex: 1, fontSize: 13 * fs, color: c.text, fontWeight: '500' },
    cardLabelActive: { color: c.primaryDark, fontWeight: '600' },
    section: {
      fontSize: 14 * fs,
      fontWeight: '600',
      color: c.text,
      marginBottom: spacing.sm,
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
      height: 52,
    },
    input: { flex: 1, fontSize: 15 * fs, color: c.text, paddingVertical: 0 },
    bottomBar: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
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
    },
    ctaDisabled: { opacity: 0.5 },
    ctaLabel: { color: c.white, fontSize: 16 * fs, fontWeight: '700' },
  });

export default OtherCategoryScreen;
