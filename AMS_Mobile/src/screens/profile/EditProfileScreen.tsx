import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@store/hooks';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';
import { useApi } from '@hooks/useApi';
import AsyncStateView from '@components/common/AsyncStateView';
import { customerService } from '@services/api/customerService';
import { launchImageLibrary } from 'react-native-image-picker';

interface EditProfileScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const { t, fonts } = useT();
  const c = theme.colors;
  const fs = theme.fontScale;
  const styles = makeStyles(c, fs);
  const user = useAppSelector((s) => s.auth.user);
  const customerId = user?.id;

  const profile = useApi(
    () => {
      if (!customerId) throw new Error('Not signed in');
      return customerService.getProfile(customerId);
    },
    [customerId],
    { enabled: !!customerId }
  );

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (profile.data) {
      setFirstName(profile.data.firstName ?? '');
      setLastName(profile.data.lastName ?? '');
      setEmail(profile.data.email ?? '');
      setPhone(profile.data.phone ?? '');
    }
  }, [profile.data]);

  const onSave = async () => {
    if (!customerId || saving) return;
    setSaving(true);
    try {
      const updated = await customerService.updateProfile(customerId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      profile.setData(updated);
      Alert.alert(t('common.success'), t('profile.profileUpdated'));
      if (navigation.canGoBack()) navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('errors.unknown'));
    } finally {
      setSaving(false);
    }
  };

  const onChangeAvatar = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        selectionLimit: 1,
      });
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      setAvatarUploading(true);
      const uploaded = await customerService.uploadAvatar({
        uri: asset.uri,
        name: asset.fileName ?? 'avatar.jpg',
        type: asset.type ?? 'image/jpeg',
      });
      profile.setData((prev) =>
        prev ? { ...prev, avatarUrl: uploaded.url } : prev
      );
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('errors.unknown'));
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
          {t('profile.personalInfo')}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <AsyncStateView
        loading={profile.loading}
        error={profile.error}
        onRetry={profile.reload}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                {profile.data?.avatarUrl ? (
                  <Image
                    source={{ uri: profile.data.avatarUrl }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <Ionicons name="person" size={36} color={c.primaryDark} />
                )}
              </View>
              <TouchableOpacity
                style={styles.changePhoto}
                onPress={onChangeAvatar}
                disabled={avatarUploading}
              >
                {avatarUploading ? (
                  <ActivityIndicator size="small" color={c.primary} />
                ) : (
                  <Ionicons name="camera-outline" size={14} color={c.primary} />
                )}
                <Text
                  style={[styles.changePhotoLabel, { fontFamily: fonts.medium }]}
                >
                  {t('profile.uploadAvatar')}
                </Text>
              </TouchableOpacity>
            </View>

            <Field
              label={t('profile.firstName')}
              value={firstName}
              onChangeText={setFirstName}
              icon="person-outline"
              c={c}
              fs={fs}
              fontFamily={fonts.regular}
            />
            <Field
              label={t('profile.lastName')}
              value={lastName}
              onChangeText={setLastName}
              icon="person-outline"
              c={c}
              fs={fs}
              fontFamily={fonts.regular}
            />
            <Field
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              c={c}
              fs={fs}
              fontFamily={fonts.regular}
            />
            <Field
              label={t('profile.phone')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon="call-outline"
              c={c}
              fs={fs}
              fontFamily={fonts.regular}
            />

            <TouchableOpacity
              style={[styles.cta, saving && styles.ctaDisabled]}
              activeOpacity={0.85}
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={c.white} />
              ) : (
                <Text style={[styles.ctaLabel, { fontFamily: fonts.bold }]}>
                  {t('common.save')}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </AsyncStateView>
    </SafeAreaView>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  icon: any;
  keyboardType?: any;
  autoCapitalize?: any;
  c: ReturnType<typeof useTheme>['colors'];
  fs: number;
  fontFamily: string;
}> = ({ label, value, onChangeText, icon, keyboardType, autoCapitalize, c, fs, fontFamily }) => (
  <View style={{ marginBottom: spacing.lg }}>
    <Text
      style={{
        fontSize: 13 * fs,
        fontWeight: '500',
        color: c.textSecondary,
        marginBottom: spacing.xs,
        fontFamily,
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
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={{
          flex: 1,
          fontSize: 16 * fs,
          color: c.text,
          paddingVertical: 0,
          fontFamily,
        }}
        placeholderTextColor={c.textHint}
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 18 * fs, color: c.text },
    scroll: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing['4xl'],
    },
    avatarRow: { alignItems: 'center', marginBottom: spacing.xl },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
      overflow: 'hidden',
    },
    avatarImg: { width: '100%', height: '100%' },
    changePhoto: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
    },
    changePhotoLabel: { color: c.primary, fontWeight: '600', fontSize: 13 * fs },
    cta: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    ctaDisabled: { opacity: 0.7 },
    ctaLabel: { color: c.white, fontSize: 16 * fs },
  });

export default EditProfileScreen;
