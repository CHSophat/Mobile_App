import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

interface TwoFactorSetupScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
}

type Step = 'overview' | 'setup' | 'verify' | 'done';

const SECRET = 'JBSWY3DPEHPK3PXP';
const BACKUP_CODES = [
  'a1b2-c3d4',
  'e5f6-g7h8',
  'i9j0-k1l2',
  'm3n4-o5p6',
  'q7r8-s9t0',
  'u1v2-w3x4',
];

const TwoFactorSetupScreen: React.FC<TwoFactorSetupScreenProps> = ({
  navigation,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState<Step>('overview');
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputs = useRef<Array<TextInput | null>>([]);

  const code = digits.join('');
  const codeComplete = code.length === 6;

  const startSetup = () => setStep('setup');

  const onChangeDigit = (text: string, i: number) => {
    const clean = text.replace(/\D/g, '').slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKeyPress = (e: any, i: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const verify = () => {
    if (!codeComplete) return;
    setEnabled(true);
    setStep('done');
  };

  const disable = () => {
    setEnabled(false);
    setStep('overview');
    setDigits(Array(6).fill(''));
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
        <Text style={styles.headerTitle}>Two-factor auth</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {step === 'overview' && (
          <>
            <View style={styles.heroIcon}>
              <Ionicons
                name={enabled ? 'shield-checkmark' : 'shield-half-outline'}
                size={56}
                color={enabled ? t.colors.success : t.colors.primary}
              />
            </View>
            <Text style={styles.heroTitle}>
              {enabled ? '2FA is on' : 'Add an extra layer'}
            </Text>
            <Text style={styles.heroDesc}>
              {enabled
                ? 'Sign-ins require a code from your authenticator app.'
                : 'Use an authenticator app like Google Authenticator or Authy to generate a code each time you sign in.'}
            </Text>

            <View style={styles.toggleCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Authenticator app</Text>
                <Text style={styles.toggleDesc}>
                  {enabled ? 'Connected and active' : 'Not configured'}
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={(v) => (v ? startSetup() : disable())}
                trackColor={{ true: t.colors.primary, false: t.colors.border }}
                thumbColor={t.colors.white}
              />
            </View>

            {enabled ? (
              <TouchableOpacity
                style={styles.outlineBtn}
                activeOpacity={0.85}
                onPress={disable}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={t.colors.error}
                />
                <Text style={[styles.outlineBtnLabel, { color: t.colors.error }]}>
                  Disable 2FA
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.cta}
                activeOpacity={0.85}
                onPress={startSetup}
              >
                <Text style={styles.ctaLabel}>Set up 2FA</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {step === 'setup' && (
          <>
            <Text style={styles.sectionLg}>Scan with your authenticator</Text>
            <View style={styles.qrCard}>
              <View style={styles.qrBox}>
                <Ionicons
                  name="qr-code-outline"
                  size={140}
                  color={t.colors.text}
                />
              </View>
              <Text style={styles.secretLabel}>Or enter this key manually</Text>
              <Text selectable style={styles.secretValue}>
                {SECRET}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.85}
              onPress={() => setStep('verify')}
            >
              <Text style={styles.ctaLabel}>I've added the account</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'verify' && (
          <>
            <Text style={styles.sectionLg}>Enter the 6-digit code</Text>
            <Text style={styles.heroDesc}>
              Open your authenticator app and type the code shown for AMS.
            </Text>
            <View style={styles.otpRow}>
              {digits.map((d, i) => (
                <TextInput
                  key={i}
                  ref={(r) => {
                    inputs.current[i] = r;
                  }}
                  value={d}
                  onChangeText={(text) => onChangeDigit(text, i)}
                  onKeyPress={(e) => onKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[styles.otpCell, d ? styles.otpCellFilled : null]}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.cta, !codeComplete && styles.ctaDisabled]}
              disabled={!codeComplete}
              activeOpacity={0.85}
              onPress={verify}
            >
              <Text style={styles.ctaLabel}>Verify & enable</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'done' && (
          <>
            <View style={styles.heroIcon}>
              <Ionicons
                name="shield-checkmark"
                size={56}
                color={t.colors.success}
              />
            </View>
            <Text style={styles.heroTitle}>2FA enabled</Text>
            <Text style={styles.heroDesc}>
              Save your backup codes. Each can be used once if you lose your
              authenticator.
            </Text>

            <View style={styles.codesCard}>
              {BACKUP_CODES.map((c) => (
                <Text key={c} selectable style={styles.codeText}>
                  {c}
                </Text>
              ))}
            </View>

            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.85}>
              <Ionicons name="copy-outline" size={18} color={t.colors.primary} />
              <Text style={styles.outlineBtnLabel}>Copy codes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cta}
              activeOpacity={0.85}
              onPress={() => setStep('overview')}
            >
              <Text style={styles.ctaLabel}>Done</Text>
            </TouchableOpacity>
          </>
        )}
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
      paddingTop: spacing.xl,
      paddingBottom: spacing['4xl'],
    },
    heroIcon: {
      alignSelf: 'center',
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    heroTitle: {
      fontSize: 22 * fs,
      fontWeight: '700',
      color: c.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    heroDesc: {
      fontSize: 14 * fs,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: spacing.xl,
    },
    toggleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 14,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    toggleLabel: { fontSize: 15 * fs, fontWeight: '600', color: c.text },
    toggleDesc: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    cta: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    ctaDisabled: { opacity: 0.5 },
    ctaLabel: { color: c.white, fontSize: 16 * fs, fontWeight: '600' },
    outlineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.surface,
      borderRadius: 999,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.sm,
    },
    outlineBtnLabel: { color: c.primary, fontWeight: '600', fontSize: 14 * fs },
    sectionLg: {
      fontSize: 18 * fs,
      fontWeight: '700',
      color: c.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    qrCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    qrBox: {
      width: 160,
      height: 160,
      backgroundColor: c.background,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    secretLabel: { fontSize: 12 * fs, color: c.textSecondary, marginBottom: 4 },
    secretValue: {
      fontSize: 16 * fs,
      fontWeight: '600',
      letterSpacing: 2,
      color: c.text,
    },
    otpRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: spacing.lg,
    },
    otpCell: {
      width: 48,
      height: 56,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      textAlign: 'center',
      fontSize: 22 * fs,
      fontWeight: '600',
      color: c.text,
    },
    otpCellFilled: { borderColor: c.primary },
    codesCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.md,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    codeText: {
      flexBasis: '45%',
      fontSize: 14 * fs,
      fontWeight: '600',
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) as any,
      color: c.text,
      paddingVertical: 4,
    } as any,
  });

export default TwoFactorSetupScreen;
