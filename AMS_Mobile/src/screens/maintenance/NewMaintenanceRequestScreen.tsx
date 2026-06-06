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
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';
import { useAppSelector } from '@store/hooks';
import { maintenanceServiceV2 } from '@services/api/maintenanceServiceV2';

interface NewMaintenanceRequestScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
}

type Priority = 'low' | 'medium' | 'high';

const NewMaintenanceRequestScreen: React.FC<
  NewMaintenanceRequestScreenProps
> = ({ navigation }) => {
  const theme = useTheme();
  const { t: tr, fonts } = useT();
  const t = theme;
  const styles = makeStyles(t.colors, t.fontScale);
  const user = useAppSelector((s) => s.auth.user);
  const productId = (user as any)?.productId ?? 0;

  const CATEGORIES: { key: string; label: string; icon: any; tint: string }[] = [
    { key: 'plumbing', label: 'Plumbing', icon: 'water-outline', tint: '#1E88E5' },
    { key: 'electrical', label: 'Electrical', icon: 'flash-outline', tint: t.colors.warning },
    { key: 'aircon', label: 'AC / heating', icon: 'snow-outline', tint: '#42A5F5' },
    { key: 'appliance', label: 'Appliance', icon: 'tv-outline', tint: t.colors.primary },
    { key: 'door', label: 'Door / lock', icon: 'lock-closed-outline', tint: t.colors.primaryDark },
    { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline', tint: t.colors.textSecondary },
  ];

  const PRIORITIES: { key: Priority; label: string; color: string }[] = [
    { key: 'low', label: 'Low', color: t.colors.success },
    { key: 'medium', label: 'Medium', color: t.colors.warning },
    { key: 'high', label: 'High', color: t.colors.error },
  ];

  const [category, setCategory] = useState<string | null>(null);
  const [otherLabel, setOtherLabel] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    !!category && title.trim().length > 2 && description.trim().length > 4;

  const handleCategory = (key: string) => {
    if (key === 'other') {
      navigation.navigate('OtherCategoryScreen', {
        onPick: (label: string) => {
          setCategory('other');
          setOtherLabel(label);
        },
      });
    } else {
      setCategory(key);
      setOtherLabel('');
    }
  };

  const handleAddPhoto = () => {
    navigation.navigate('UploadPhotoScreen', {
      onUpload: (uris: string[]) => setPhotos(uris),
    });
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Upload any local photo URIs to the backend first.
      const remoteUrls: string[] = [];
      for (const uri of photos) {
        if (/^https?:\/\//i.test(uri)) {
          remoteUrls.push(uri);
          continue;
        }
        try {
          const name = uri.split('/').pop() || 'photo.jpg';
          const ext = name.split('.').pop()?.toLowerCase() || 'jpg';
          const type = ext === 'png' ? 'image/png' : 'image/jpeg';
          const uploaded = await maintenanceServiceV2.uploadPhoto({
            uri,
            name,
            type,
          });
          remoteUrls.push(uploaded.url);
        } catch (uploadErr) {
          // Continue with whatever uploaded; surface the error after submit.
          if (__DEV__) console.warn('Photo upload failed', uploadErr);
        }
      }

      await maintenanceServiceV2.create({
        productId,
        category: category ?? undefined,
        title: title.trim() || undefined,
        priority: priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'medium',
        description: description.trim(),
        photoUrls: remoteUrls.length ? remoteUrls : undefined,
      });

      Alert.alert(tr('common.success'), tr('maintenance.requestSubmitted'));
      if (navigation.canGoBack()) navigation.goBack();
    } catch (err: any) {
      Alert.alert(tr('common.error'), err?.message || tr('errors.unknown'));
    } finally {
      setSubmitting(false);
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
          {tr('maintenance.newRequest')}
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
          <Text style={styles.section}>Category</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((c) => {
              const active = category === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.catCard, active && styles.catCardActive]}
                  activeOpacity={0.85}
                  onPress={() => handleCategory(c.key)}
                >
                  <View
                    style={[
                      styles.catIconWrap,
                      { backgroundColor: c.tint + '22' },
                    ]}
                  >
                    <Ionicons name={c.icon} size={20} color={c.tint} />
                  </View>
                  <Text style={styles.catLabel}>
                    {c.key === 'other' && otherLabel ? otherLabel : c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.section}>Title</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Short summary, e.g. Leaking tap"
              placeholderTextColor={t.colors.textHint}
              style={styles.input}
            />
          </View>

          <Text style={styles.section}>Description</Text>
          <View style={[styles.inputWrap, styles.textareaWrap]}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the problem, where it is, how long it's been happening..."
              placeholderTextColor={t.colors.textHint}
              multiline
              style={[styles.input, styles.textarea]}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.section}>Priority</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => {
              const active = priority === p.key;
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.priorityBtn,
                    active && { backgroundColor: p.color, borderColor: p.color },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setPriority(p.key)}
                >
                  <Text
                    style={[
                      styles.priorityLabel,
                      active && styles.priorityLabelActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.photoBtn}
            activeOpacity={0.85}
            onPress={handleAddPhoto}
          >
            <Ionicons name="camera-outline" size={18} color={t.colors.primary} />
            <Text style={styles.photoBtnLabel}>
              {photos.length > 0 ? `Photos (${photos.length})` : 'Add photo'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={t.colors.textSecondary}
            />
          </TouchableOpacity>

          {photos.length > 0 ? (
            <View style={styles.thumbRow}>
              {photos.slice(0, 4).map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={styles.thumb}
                />
              ))}
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.cta, (!canSubmit || submitting) && styles.ctaDisabled]}
            disabled={!canSubmit || submitting}
            activeOpacity={0.85}
            onPress={submit}
          >
            {submitting ? (
              <ActivityIndicator color={t.colors.white} />
            ) : (
              <Text style={[styles.ctaLabel, { fontFamily: fonts.bold }]}>
                {tr('maintenance.submitRequest')}
              </Text>
            )}
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
      fontSize: 14 * fs,
      fontWeight: '600',
      color: c.text,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    catCard: {
      flexBasis: '31%',
      flexGrow: 1,
      backgroundColor: c.surface,
      borderRadius: 14,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    catCardActive: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    catIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    catLabel: { fontSize: 12 * fs, color: c.text, fontWeight: '500', textAlign: 'center' },
    inputWrap: {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      height: 52,
      justifyContent: 'center',
    },
    textareaWrap: { height: 120, paddingVertical: spacing.md },
    input: { fontSize: 15 * fs, color: c.text, padding: 0 },
    textarea: { minHeight: 96 },
    priorityRow: { flexDirection: 'row', gap: spacing.sm },
    priorityBtn: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      alignItems: 'center',
    },
    priorityLabel: { fontSize: 13 * fs, color: c.text, fontWeight: '500' },
    priorityLabelActive: { color: c.white, fontWeight: '600' },
    photoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginTop: spacing.md,
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    photoBtnLabel: { flex: 1, color: c.primary, fontWeight: '600', fontSize: 14 * fs },
    thumbRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: 10,
    },
    cta: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    ctaDisabled: { opacity: 0.5 },
    ctaLabel: { color: c.white, fontSize: 16 * fs, fontWeight: '600' },
  });

export default NewMaintenanceRequestScreen;
