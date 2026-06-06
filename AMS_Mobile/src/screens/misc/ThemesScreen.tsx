import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import {
  useTheme,
  ACCENTS,
  AccentKey,
  ThemeMode,
  FontSizeKey,
} from '@theme/ThemeContext';

interface ThemesScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
}

const MODES: { key: ThemeMode; label: string; description: string; icon: any }[] = [
  { key: 'light', label: 'Light', description: 'Always light theme', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark', description: 'Always dark theme', icon: 'moon-outline' },
  { key: 'system', label: 'System', description: 'Match device setting', icon: 'phone-portrait-outline' },
];

const FONT_SIZES: { key: FontSizeKey; label: string; sample: number }[] = [
  { key: 'sm', label: 'Small', sample: 13 },
  { key: 'md', label: 'Medium', sample: 15 },
  { key: 'lg', label: 'Large', sample: 17 },
];

const ThemesScreen: React.FC<ThemesScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const fs = t.fontScale;

  const styles = makeStyles(t.colors, fs);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={t.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Themes</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <Text style={styles.section}>Appearance</Text>
        <View style={styles.modeRow}>
          {MODES.map((m) => {
            const active = t.mode === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.modeCard, active && styles.modeCardActive]}
                activeOpacity={0.85}
                onPress={() => t.setMode(m.key)}
              >
                <View
                  style={[
                    styles.modeIconWrap,
                    active && { backgroundColor: t.colors.primary },
                  ]}
                >
                  <Ionicons
                    name={m.icon}
                    size={20}
                    color={active ? t.colors.white : t.colors.primary}
                  />
                </View>
                <Text style={styles.modeLabel}>{m.label}</Text>
                <Text style={styles.modeDesc}>{m.description}</Text>
                {active ? (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color={t.colors.white} />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Accent */}
        <Text style={styles.section}>Accent color</Text>
        <View style={styles.paletteGrid}>
          {(Object.keys(ACCENTS) as AccentKey[]).map((key) => {
            const p = ACCENTS[key];
            const active = t.accent === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.paletteCard, active && styles.paletteCardActive]}
                activeOpacity={0.85}
                onPress={() => t.setAccent(key)}
              >
                <View style={styles.swatchRow}>
                  <View
                    style={[styles.swatchMain, { backgroundColor: p.primary }]}
                  />
                  <View
                    style={[
                      styles.swatchAccent,
                      { backgroundColor: p.primarySoft },
                    ]}
                  />
                </View>
                <Text style={styles.paletteName}>{p.name}</Text>
                {active ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={t.colors.primary}
                    style={styles.paletteCheck}
                  />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Text size */}
        <Text style={styles.section}>Text size</Text>
        <View style={styles.sizeRow}>
          {FONT_SIZES.map((f) => {
            const active = t.fontSize === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.sizeCard, active && styles.sizeCardActive]}
                activeOpacity={0.85}
                onPress={() => t.setFontSize(f.key)}
              >
                <Text style={[styles.sizeSample, { fontSize: f.sample * fs }]}>
                  Aa
                </Text>
                <Text style={styles.sizeLabel}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Live preview */}
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Live preview</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewHeading}>Rent due</Text>
            <Text style={styles.previewBody}>
              $450 — due May 31. Tap Pay now to settle.
            </Text>
            <View style={styles.previewBtn}>
              <Text style={styles.previewBtnLabel}>Pay now</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (c: ReturnType<typeof useTheme>['colors'], fs: number) =>
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
      paddingTop: spacing.xl,
      paddingBottom: spacing['4xl'],
    },
    section: {
      fontSize: 13 * fs,
      fontWeight: '600',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    modeRow: { flexDirection: 'row', gap: spacing.sm },
    modeCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'flex-start',
    },
    modeCardActive: { borderColor: c.primary, backgroundColor: c.primarySoft },
    modeIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    modeLabel: { fontSize: 14 * fs, fontWeight: '600', color: c.text },
    modeDesc: { fontSize: 11 * fs, color: c.textSecondary, marginTop: 2 },
    checkBadge: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    paletteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    paletteCard: {
      flexBasis: '31%',
      flexGrow: 1,
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    paletteCardActive: { borderColor: c.primary, backgroundColor: c.primarySoft },
    swatchRow: { flexDirection: 'row', gap: 4, marginBottom: spacing.xs },
    swatchMain: { flex: 2, height: 24, borderRadius: 6 },
    swatchAccent: { flex: 1, height: 24, borderRadius: 6 },
    paletteName: { fontSize: 12 * fs, color: c.text, fontWeight: '500' },
    paletteCheck: { position: 'absolute', top: spacing.xs, right: spacing.xs },
    sizeRow: { flexDirection: 'row', gap: spacing.sm },
    sizeCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 14,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    sizeCardActive: { borderColor: c.primary, backgroundColor: c.primarySoft },
    sizeSample: { fontWeight: '700', color: c.text },
    sizeLabel: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    preview: { marginTop: spacing.xl },
    previewTitle: {
      fontSize: 13 * fs,
      fontWeight: '600',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: spacing.sm,
    },
    previewCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.primarySoft,
    },
    previewHeading: { fontSize: 18 * fs, fontWeight: '700', color: c.text },
    previewBody: {
      fontSize: 13 * fs,
      color: c.textSecondary,
      marginTop: 4,
      marginBottom: spacing.md,
    },
    previewBtn: {
      backgroundColor: c.primary,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      alignItems: 'center',
    },
    previewBtnLabel: {
      color: c.white,
      fontWeight: '600',
      fontSize: 13 * fs,
    },
  });

export default ThemesScreen;
