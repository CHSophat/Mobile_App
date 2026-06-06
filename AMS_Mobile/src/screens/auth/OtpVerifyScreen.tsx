import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 42;

interface OtpVerifyScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
    replace: (s: string, p?: any) => void;
  };
  route?: { params?: { phone?: string } };
}

const formatPhoneMask = (raw?: string) => {
  if (!raw) return '+855 12 *** 456';
  return raw.replace(/(\+\d{2,3})(\d{2})(\d+)(\d{3})/, '$1 $2 *** $4');
};

const OtpVerifyScreen: React.FC<OtpVerifyScreenProps> = ({
  navigation,
  route,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const onChange = (text: string, i: number) => {
    const clean = text.replace(/\D/g, '').slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < OTP_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyPress = (e: any, i: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const code = digits.join('');
  const codeComplete = code.length === OTP_LENGTH;

  const handleVerify = async () => {
    if (!codeComplete) {
      setError('Enter the 6-digit code');
      return;
    }
    setError(null);
    setVerifying(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      navigation.replace('LoginScreen');
    } catch (e: any) {
      setError(e?.message ?? 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
  };

  const mm = String(Math.floor(secondsLeft / 60));
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {navigation.canGoBack() ? (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-back" size={26} color={t.colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}

          <Text style={styles.title}>Verify your phone</Text>
          <Text style={styles.subtitle}>
            Sent to {formatPhoneMask(route?.params?.phone)}
          </Text>

          <View style={styles.otpRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(r) => {
                  inputs.current[i] = r;
                }}
                value={d}
                onChangeText={(text) => onChange(text, i)}
                onKeyPress={(e) => onKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.otpCell,
                  d ? styles.otpCellFilled : null,
                  error ? styles.otpCellError : null,
                ]}
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            onPress={handleResend}
            disabled={secondsLeft > 0}
            style={styles.resendWrap}
          >
            <Text
              style={[
                styles.resendText,
                secondsLeft === 0 && styles.resendTextActive,
              ]}
            >
              {secondsLeft > 0 ? `Resend in ${mm}:${ss}` : 'Resend code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cta,
              (!codeComplete || verifying) && styles.ctaDisabled,
            ]}
            disabled={!codeComplete || verifying}
            activeOpacity={0.85}
            onPress={handleVerify}
          >
            <Text style={styles.ctaLabel}>
              {verifying ? 'Verifying...' : 'Verify'}
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
    flex: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing['4xl'],
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: 'flex-start',
      justifyContent: 'center',
      marginTop: spacing.md,
    },
    title: {
      fontSize: 26 * fs,
      fontWeight: '700',
      color: c.text,
      marginTop: spacing.md,
    },
    subtitle: {
      fontSize: 14 * fs,
      color: c.textSecondary,
      marginTop: spacing.xs,
      marginBottom: spacing['4xl'],
    },
    otpRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
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
    otpCellError: { borderColor: c.error },
    errorText: {
      color: c.error,
      fontSize: 13 * fs,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    resendWrap: { alignItems: 'center', marginBottom: spacing.xl },
    resendText: { color: c.textSecondary, fontSize: 14 * fs },
    resendTextActive: { color: c.primaryDark, fontWeight: '600' },
    cta: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaDisabled: { opacity: 0.5 },
    ctaLabel: {
      color: c.white,
      fontSize: 16 * fs,
      fontWeight: '600',
    },
  });

export default OtpVerifyScreen;
