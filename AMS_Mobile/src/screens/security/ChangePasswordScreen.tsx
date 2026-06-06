import React, { useMemo, useState } from 'react';
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
import { useT } from '@i18n/useT';
import { customerService } from '@services/api/customerService';
import { ActivityIndicator } from 'react-native';

interface ChangePasswordScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
}

const requirements = (pwd: string) => ({
  length: pwd.length >= 8,
  number: /\d/.test(pwd),
  letter: /[a-zA-Z]/.test(pwd),
  symbol: /[^\w\s]/.test(pwd),
});

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const { t: tr, fonts } = useT();
  const t = theme;
  const styles = makeStyles(t.colors, t.fontScale);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const reqs = useMemo(() => requirements(next), [next]);
  const score = Object.values(reqs).filter(Boolean).length;
  const meetsAll = score === 4;
  const matches = next.length > 0 && next === confirm;

  const handleSave = async () => {
    if (!current) return setError(tr('common.required'));
    if (!meetsAll) return setError(tr('errors.validation'));
    if (!matches) return setError(tr('errors.validation'));
    setError(null);
    setSaving(true);
    try {
      await customerService.changePassword({
        currentPassword: current,
        newPassword: next,
      });
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err: any) {
      setError(err?.message || tr('errors.unknown'));
    } finally {
      setSaving(false);
    }
  };

  const PwdField: React.FC<{
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    visible: boolean;
    onToggle: () => void;
  }> = ({ label, value, onChangeText, visible, onToggle }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="lock-closed-outline" size={18} color={t.colors.textSecondary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor={t.colors.textHint}
        />
        <TouchableOpacity onPress={onToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={t.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const Req: React.FC<{ met: boolean; label: string }> = ({ met, label }) => (
    <View style={styles.reqRow}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={14}
        color={met ? t.colors.success : t.colors.textSecondary}
      />
      <Text
        style={[
          styles.reqLabel,
          { color: met ? t.colors.text : t.colors.textSecondary },
        ]}
      >
        {label}
      </Text>
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
          {tr('profile.changePassword')}
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
          {done ? (
            <View style={styles.successCard}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={40} color={t.colors.success} />
              </View>
              <Text style={styles.successTitle}>Password updated</Text>
              <Text style={styles.successDesc}>
                Use your new password the next time you sign in.
              </Text>
              <TouchableOpacity
                style={styles.cta}
                activeOpacity={0.85}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.ctaLabel}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <PwdField
                label="Current password"
                value={current}
                onChangeText={setCurrent}
                visible={showCurrent}
                onToggle={() => setShowCurrent((v) => !v)}
              />
              <PwdField
                label="New password"
                value={next}
                onChangeText={setNext}
                visible={showNext}
                onToggle={() => setShowNext((v) => !v)}
              />

              <View style={styles.strengthBar}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      i < score && {
                        backgroundColor:
                          score === 4
                            ? t.colors.success
                            : score >= 3
                            ? t.colors.primary
                            : t.colors.warning,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.reqList}>
                <Req met={reqs.length} label="At least 8 characters" />
                <Req met={reqs.letter} label="Contains a letter" />
                <Req met={reqs.number} label="Contains a number" />
                <Req met={reqs.symbol} label="Contains a symbol" />
              </View>

              <PwdField
                label="Confirm new password"
                value={confirm}
                onChangeText={setConfirm}
                visible={showNext}
                onToggle={() => setShowNext((v) => !v)}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.cta, saving && styles.ctaDisabled]}
                activeOpacity={0.85}
                disabled={saving}
                onPress={handleSave}
              >
                {saving ? (
                  <ActivityIndicator color={t.colors.white} />
                ) : (
                  <Text style={[styles.ctaLabel, { fontFamily: fonts.bold }]}>
                    {tr('common.save')}
                  </Text>
                )}
              </TouchableOpacity>
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
    field: { marginBottom: spacing.lg },
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
      height: 52,
    },
    input: { flex: 1, fontSize: 16 * fs, color: c.text, paddingVertical: 0 },
    strengthBar: {
      flexDirection: 'row',
      gap: 4,
      marginTop: -spacing.xs,
      marginBottom: spacing.sm,
    },
    strengthSegment: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
    },
    reqList: { marginBottom: spacing.lg, gap: 6 },
    reqRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    reqLabel: { fontSize: 13 * fs },
    errorText: {
      color: c.error,
      fontSize: 13 * fs,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    cta: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    ctaDisabled: { opacity: 0.7 },
    ctaLabel: { color: c.white, fontSize: 16 * fs, fontWeight: '600' },
    successCard: { alignItems: 'center', paddingTop: spacing['4xl'] },
    successIcon: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: c.success + '22',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    successTitle: {
      fontSize: 20 * fs,
      fontWeight: '700',
      color: c.text,
      marginBottom: spacing.xs,
    },
    successDesc: {
      textAlign: 'center',
      color: c.textSecondary,
      fontSize: 14 * fs,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
  });

export default ChangePasswordScreen;
