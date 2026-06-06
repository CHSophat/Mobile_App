import React, { useState } from 'react';
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
import { authService } from '@services/api/authService';

interface ForgotPasswordScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (screen: string) => void;
  };
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!emailPattern.test(email.trim())) {
      setEmailError('Enter a valid email');
      return;
    }
    setEmailError(undefined);
    setServerError(null);
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {navigation.canGoBack() ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-back" size={26} color={t.colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}

          {sent ? (
            <View style={styles.successWrap}>
              <View style={styles.successIcon}>
                <Ionicons
                  name="mail-outline"
                  size={56}
                  color={t.colors.primary}
                />
              </View>
              <Text style={styles.title}>Check your inbox</Text>
              <Text style={styles.subtitle}>
                If an account exists for {email.trim()}, we sent a link to reset
                your password.
              </Text>
              <TouchableOpacity
                style={styles.cta}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('LoginScreen')}
              >
                <Text style={styles.ctaLabel}>Back to sign in</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Forgot password?</Text>
                <Text style={styles.subtitle}>
                  Enter the email associated with your account and we'll send
                  you a reset link.
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <View
                  style={[
                    styles.inputWrap,
                    emailError ? styles.inputWrapError : null,
                  ]}
                >
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={t.colors.textHint}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    style={styles.input}
                  />
                </View>
                {emailError ? (
                  <Text style={styles.fieldError}>{emailError}</Text>
                ) : null}
              </View>

              {serverError ? (
                <Text style={styles.serverError}>{serverError}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.cta, loading && styles.ctaDisabled]}
                disabled={loading}
                activeOpacity={0.85}
                onPress={handleSubmit}
              >
                <Text style={styles.ctaLabel}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </Text>
              </TouchableOpacity>

              <View style={styles.bottomRow}>
                <Text style={styles.bottomText}>Remembered it? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('LoginScreen')}
                >
                  <Text style={styles.bottomLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
    header: { marginTop: spacing.md, marginBottom: spacing['4xl'] },
    title: {
      fontSize: 28 * fs,
      fontWeight: '700',
      color: c.text,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14 * fs,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    field: { marginBottom: spacing.lg },
    label: {
      fontSize: 14 * fs,
      fontWeight: '500',
      color: c.text,
      marginBottom: spacing.sm,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      height: 52,
    },
    inputWrapError: { borderColor: c.error },
    input: { flex: 1, fontSize: 16 * fs, color: c.text, paddingVertical: 0 },
    fieldError: { color: c.error, fontSize: 12 * fs, marginTop: spacing.xs },
    serverError: {
      color: c.error,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    cta: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.sm,
    },
    ctaDisabled: { opacity: 0.7 },
    ctaLabel: {
      color: c.white,
      fontSize: 16 * fs,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing['4xl'],
    },
    bottomText: { color: c.textSecondary, fontSize: 14 * fs },
    bottomLink: { color: c.primaryDark, fontSize: 14 * fs, fontWeight: '600' },
    successWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: spacing['4xl'],
    },
    successIcon: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
  });

export default ForgotPasswordScreen;
