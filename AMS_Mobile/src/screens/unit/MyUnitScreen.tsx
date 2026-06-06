import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

interface MyUnitScreenProps {
  navigation: { navigate: (s: string, p?: any) => void };
}

const MOCK = {
  unitCode: 'B-204',
  beds: 2,
  baths: 1,
  property: 'Riverside Apartments',
  floor: 2,
  leaseStart: 'Mar 1 2025',
  leaseEnd: 'Feb 28 2026',
  rent: 450,
  amenities: ['Wi-Fi', 'Parking', 'Gym', 'Pool', 'Security'],
  photos: [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900',
  ],
};

const HERO_HEIGHT = 240;

const MyUnitScreen: React.FC<MyUnitScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const goTo = (target: string) => {
    const parent = (navigation as any).getParent?.();
    if (parent) parent.navigate(target);
    else navigation.navigate(target);
  };

  const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: spacing['4xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <FlatList
            ref={listRef}
            data={MOCK.photos}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, i) => ({
              length: width,
              offset: width * i,
              index: i,
            })}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width, height: HERO_HEIGHT }}
                resizeMode="cover"
              />
            )}
          />
          <View style={styles.dotsRow}>
            {MOCK.photos.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.unitTitle}>
            {MOCK.unitCode} · {MOCK.beds} bed · {MOCK.baths} bath
          </Text>
          <Text style={styles.unitSub}>
            {MOCK.property} · Floor {MOCK.floor}
          </Text>

          <View style={styles.infoCard}>
            <InfoRow label="Lease" value={`${MOCK.leaseStart} → ${MOCK.leaseEnd}`} />
            <View style={styles.divider} />
            <InfoRow label="Rent" value={`$${MOCK.rent} / month`} />
          </View>

          <Text style={styles.section}>Amenities</Text>
          <View style={styles.amenityWrap}>
            {MOCK.amenities.map((a) => (
              <View key={a} style={styles.amenityChip}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={t.colors.primary}
                />
                <Text style={styles.amenityLabel}>{a}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => goTo('NewMaintenanceRequestScreen')}
          >
            <Ionicons name="construct-outline" size={18} color={t.colors.white} />
            <Text style={styles.primaryBtnLabel}>Report a problem</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            activeOpacity={0.85}
            onPress={() => goTo('LeaseDetailScreen')}
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color={t.colors.primary}
            />
            <Text style={styles.outlineBtnLabel}>View lease documents</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    dotsRow: {
      position: 'absolute',
      bottom: spacing.md,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.6)',
      marginHorizontal: 3,
    },
    dotActive: { backgroundColor: c.white, width: 9, height: 9, borderRadius: 5 },
    body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
    unitTitle: { fontSize: 22 * fs, fontWeight: '700', color: c.text },
    unitSub: { fontSize: 14 * fs, color: c.textSecondary, marginTop: 4 },
    infoCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      marginTop: spacing.xl,
    },
    infoRow: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoLabel: { color: c.textSecondary, fontSize: 13 * fs },
    infoValue: { color: c.text, fontSize: 14 * fs, fontWeight: '600' },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border },
    section: {
      fontSize: 15 * fs,
      fontWeight: '600',
      color: c.text,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    amenityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    amenityChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.primarySoft,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: 999,
    },
    amenityLabel: { color: c.primaryDark, fontSize: 12 * fs, fontWeight: '500' },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      marginTop: spacing.xl,
    },
    primaryBtnLabel: { color: c.white, fontWeight: '600', fontSize: 15 * fs },
    outlineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.surface,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: c.primary,
    },
    outlineBtnLabel: { color: c.primary, fontWeight: '600', fontSize: 15 * fs },
  });

export default MyUnitScreen;
