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
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setUser, setError } from '@store/slices/authSlice';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (screen: string) => void;
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const validate = (): boolean => {
    let ok = true;
    if (!emailPattern.test(email.trim())) {
      setEmailError('Enter a valid email address');
      ok = false;
    } else {
      setEmailError(undefined);
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      ok = false;
    } else {
      setPasswordError(undefined);
    }
    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    dispatch(setError(null));
    dispatch(
      setUser({
        id: 'demo',
        email: email.trim() || 'demo@example.com',
        emailVerified: true,
      })
    );
  };

  const handleSocialLogin = (
    provider: 'google' | 'whatsapp' | 'facebook' | 'instagram'
  ) => {
    dispatch(
      setUser({
        id: `demo-${provider}`,
        email: `demo@${provider}.example`,
        emailVerified: true,
      })
    );
  };

  const SocialButton: React.FC<{
    icon: any;
    iconColor: string;
    label: string;
    onPress: () => void;
  }> = ({ icon, iconColor, label, onPress }) => (
    <TouchableOpacity
      style={styles.socialBtn}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
      <Text style={styles.socialLabel}>{label}</Text>
    </TouchableOpacity>
  );

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

          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
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
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputWrap,
                passwordError ? styles.inputWrapError : null,
              ]}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={t.colors.textHint}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                style={[styles.input, styles.inputWithIcon]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((s) => !s)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={t.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.fieldError}>{passwordError}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => navigation.navigate('ForgotPasswordScreen')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.serverError}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.signInBtn, isLoading && styles.signInBtnDisabled]}
            disabled={isLoading}
            activeOpacity={0.85}
            onPress={handleSubmit}
          >
            <Text style={styles.signInLabel}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Text>
          </TouchableOpacity>

          {/* Social login temporarily hidden — keep for later re-enable
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <SocialButton
            icon="logo-google"
            iconColor="#DB4437"
            label="Continue with Google"
            onPress={() => handleSocialLogin('google')}
          />
          <SocialButton
            icon="logo-whatsapp"
            iconColor="#25D366"
            label="Sign in with WhatsApp"
            onPress={() => handleSocialLogin('whatsapp')}
          />
          <SocialButton
            icon="logo-facebook"
            iconColor="#1877F2"
            label="Sign in with Facebook"
            onPress={() => handleSocialLogin('facebook')}
          />
          <SocialButton
            icon="logo-instagram"
            iconColor="#E1306C"
            label="Sign in with Instagram"
            onPress={() => handleSocialLogin('instagram')}
          />
          */}

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('RegisterScreen')}
            >
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
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
    header: {
      marginTop: spacing.md,
      marginBottom: spacing['4xl'],
    },
    title: {
      fontSize: 28 * fs,
      fontWeight: '700',
      color: c.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: 14 * fs,
      color: c.textSecondary,
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
    input: {
      flex: 1,
      fontSize: 16 * fs,
      color: c.text,
      paddingVertical: 0,
    },
    inputWithIcon: { paddingRight: spacing.sm },
    fieldError: {
      color: c.error,
      fontSize: 12 * fs,
      marginTop: spacing.xs,
    },
    forgotWrap: { alignSelf: 'flex-start', marginBottom: spacing.lg },
    forgotText: {
      color: c.primaryDark,
      fontWeight: '500',
      fontSize: 14 * fs,
    },
    serverError: {
      color: c.error,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    signInBtn: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signInBtnDisabled: { opacity: 0.7 },
    signInLabel: {
      color: c.white,
      fontSize: 16 * fs,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.xl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.border,
    },
    dividerText: {
      marginHorizontal: spacing.md,
      color: c.textSecondary,
      fontSize: 13 * fs,
    },
    socialBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 999,
      paddingVertical: spacing.md,
      marginBottom: spacing.sm,
    },
    socialLabel: {
      color: c.text,
      fontSize: 15 * fs,
      fontWeight: '500',
    },
    signupRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing['4xl'],
    },
    signupText: {
      color: c.textSecondary,
      fontSize: 14 * fs,
    },
    signupLink: {
      color: c.primaryDark,
      fontSize: 14 * fs,
      fontWeight: '600',
    },
  });

export default LoginScreen;
