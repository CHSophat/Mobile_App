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
import { useAppDispatch } from '@store/hooks';
import { setUser } from '@store/slices/authSlice';

interface RegisterScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (screen: string, params?: any) => void;
    replace: (screen: string, params?: any) => void;
  };
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string | undefined }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const next: typeof errors = {};
    if (!emailPattern.test(email.trim())) next.email = 'Enter a valid email';
    if (password.length < 6) next.password = 'Min 6 characters';
    if (confirm !== password) next.confirm = 'Passwords do not match';
    if (!agreed) next.agreed = 'You must accept the terms';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setServerError(null);
    dispatch(
      setUser({
        id: 'demo',
        email: email.trim() || 'demo@example.com',
        phone: phone.trim() || undefined,
        emailVerified: true,
      })
    );
  };

  interface FieldProps {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: any;
    autoComplete?: any;
    trailingIcon?: any;
    onTrailingPress?: () => void;
  }

  const Field: React.FC<FieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    keyboardType,
    autoComplete,
    trailingIcon,
    onTrailingPress,
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.colors.textHint}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          autoCapitalize="none"
          style={styles.input}
        />
        {trailingIcon ? (
          <TouchableOpacity
            onPress={onTrailingPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={trailingIcon} size={20} color={t.colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <Field
            label="Email *"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={errors.email}
            autoComplete="email"
          />
          <Field
            label="Phone (optional)"
            value={phone}
            onChangeText={setPhone}
            placeholder="+855 12 345 678"
            keyboardType="phone-pad"
          />
          <Field
            label="Password *"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry={!showPwd}
            trailingIcon={showPwd ? 'eye-off-outline' : 'eye-outline'}
            onTrailingPress={() => setShowPwd((s) => !s)}
            error={errors.password}
          />
          <Field
            label="Confirm password *"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repeat password"
            secureTextEntry={!showPwd}
            error={errors.confirm}
          />

          <TouchableOpacity
            style={styles.termsRow}
            activeOpacity={0.8}
            onPress={() => setAgreed((v) => !v)}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
              {agreed ? (
                <Ionicons name="checkmark" size={14} color={t.colors.white} />
              ) : null}
            </View>
            <Text style={styles.termsText}>
              I agree to the Terms & Privacy Policy
            </Text>
          </TouchableOpacity>
          {errors.agreed ? (
            <Text style={styles.fieldError}>{errors.agreed}</Text>
          ) : null}

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
              {loading ? 'Creating account...' : 'Create account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.bottomLink}>Sign in</Text>
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
    header: { marginTop: spacing.md, marginBottom: spacing['4xl'] },
    title: {
      fontSize: 28 * fs,
      fontWeight: '700',
      color: c.text,
      marginBottom: spacing.xs,
    },
    subtitle: { fontSize: 14 * fs, color: c.textSecondary },
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
    termsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: c.border,
      marginRight: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxOn: { backgroundColor: c.primary, borderColor: c.primary },
    termsText: { fontSize: 14 * fs, color: c.text, flexShrink: 1 },
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
  });

export default RegisterScreen;
