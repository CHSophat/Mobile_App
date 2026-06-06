import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

interface UploadPhotoScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
  route?: { params?: { onUpload?: (uris: string[]) => void } };
}

const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400',
];

const UploadPhotoScreen: React.FC<UploadPhotoScreenProps> = ({
  navigation,
  route,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const addDemoPhoto = () => {
    const next = DEMO_PHOTOS[photos.length % DEMO_PHOTOS.length];
    setPhotos((p) => [...p, next]);
  };

  const remove = (i: number) =>
    setPhotos((p) => p.filter((_, idx) => idx !== i));

  const upload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      route?.params?.onUpload?.(photos);
      if (navigation.canGoBack()) navigation.goBack();
    }, 700);
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
        <Text style={styles.headerTitle}>Upload photos</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sourceRow}>
          <TouchableOpacity
            style={styles.sourceCard}
            activeOpacity={0.85}
            onPress={addDemoPhoto}
          >
            <View style={styles.sourceIconWrap}>
              <Ionicons name="camera-outline" size={24} color={t.colors.primary} />
            </View>
            <Text style={styles.sourceLabel}>Camera</Text>
            <Text style={styles.sourceHint}>Take a new photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sourceCard}
            activeOpacity={0.85}
            onPress={addDemoPhoto}
          >
            <View style={styles.sourceIconWrap}>
              <Ionicons name="images-outline" size={24} color={t.colors.primary} />
            </View>
            <Text style={styles.sourceLabel}>Gallery</Text>
            <Text style={styles.sourceHint}>Pick from library</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Attached {photos.length > 0 ? `(${photos.length})` : ''}
          </Text>
          {photos.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="cloud-upload-outline"
                size={36}
                color={t.colors.textHint}
              />
              <Text style={styles.emptyText}>No photos added yet</Text>
              <Text style={styles.emptySub}>
                Add a clear shot of the problem
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {photos.map((uri, i) => (
                <View key={i} style={styles.thumbWrap}>
                  <Image source={{ uri }} style={styles.thumb} />
                  <TouchableOpacity
                    style={styles.thumbRemove}
                    onPress={() => remove(i)}
                  >
                    <Ionicons name="close" size={14} color={t.colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addTile}
                onPress={addDemoPhoto}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={28} color={t.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color={t.colors.warning} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Tips for good photos</Text>
            <Text style={styles.tipText}>
              Use bright lighting, hold steady, and capture the whole area
              around the issue.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.uploadBtn,
            (photos.length === 0 || uploading) && styles.uploadBtnDisabled,
          ]}
          activeOpacity={0.85}
          disabled={photos.length === 0 || uploading}
          onPress={upload}
        >
          <Ionicons name="cloud-upload-outline" size={18} color={t.colors.white} />
          <Text style={styles.uploadBtnLabel}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Text>
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
    sourceRow: { flexDirection: 'row', gap: spacing.sm },
    sourceCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    sourceIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    sourceLabel: { fontSize: 14 * fs, fontWeight: '600', color: c.text },
    sourceHint: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    section: { marginTop: spacing.xl },
    sectionTitle: {
      fontSize: 14 * fs,
      fontWeight: '600',
      color: c.text,
      marginBottom: spacing.sm,
    },
    emptyCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      borderStyle: 'dashed',
      paddingVertical: spacing['3xl'],
      alignItems: 'center',
      gap: 6,
    },
    emptyText: { fontSize: 14 * fs, color: c.text, fontWeight: '600' },
    emptySub: { fontSize: 12 * fs, color: c.textSecondary },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    thumbWrap: { width: 96, height: 96, position: 'relative' },
    thumb: { width: 96, height: 96, borderRadius: 12 },
    thumbRemove: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(0,0,0,0.65)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    addTile: {
      width: 96,
      height: 96,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.primary,
      borderStyle: 'dashed',
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipCard: {
      flexDirection: 'row',
      gap: spacing.sm,
      backgroundColor: c.warning + '15',
      borderRadius: 14,
      padding: spacing.md,
      marginTop: spacing.xl,
      borderWidth: 1,
      borderColor: c.warning + '33',
    },
    tipTitle: { fontSize: 13 * fs, fontWeight: '600', color: c.text },
    tipText: {
      fontSize: 12 * fs,
      color: c.textSecondary,
      marginTop: 2,
      lineHeight: 17,
    },
    bottomBar: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      backgroundColor: c.surface,
    },
    uploadBtn: {
      flexDirection: 'row',
      gap: spacing.sm,
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadBtnDisabled: { opacity: 0.5 },
    uploadBtnLabel: { color: c.white, fontSize: 16 * fs, fontWeight: '700' },
  });

export default UploadPhotoScreen;
