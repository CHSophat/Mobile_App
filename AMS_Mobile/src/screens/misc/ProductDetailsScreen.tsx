import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

interface Product {
  id: string;
  title: string;
  property: string;
  beds: number;
  baths: number;
  area: number;
  price: number;
  images: string[];
  tag: 'Available' | 'Reserved' | 'Featured';
  description?: string;
  amenities?: string[];
  address?: string;
}

interface ProductDetailsScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
  route?: { params?: { product?: Product } };
}

const DEFAULT_PRODUCT: Product = {
  id: '1',
  title: 'Riverside B-204',
  property: 'Riverside Apartments',
  beds: 2,
  baths: 1,
  area: 64,
  price: 450,
  images: [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900',
  ],
  tag: 'Available',
  description:
    'Bright two-bedroom unit on the second floor with river-facing balcony. Fully furnished, recently renovated kitchen, secured building with 24/7 concierge.',
  amenities: ['Wi-Fi', 'Parking', 'Gym', 'Pool', 'Security', 'Elevator'],
  address: 'Street 240, Daun Penh, Phnom Penh',
};

const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isSmall = width < 360;
  const isLarge = width >= 414;

  const heroHeight = Math.round(
    Math.min(Math.max(height * 0.34, 220), width * 0.95)
  );
  const bottomBarPad = Math.max(insets.bottom, spacing.md);
  const bottomBarHeight = 76 + bottomBarPad;

  const styles = makeStyles(t.colors, t.fontScale, {
    heroHeight,
    bottomBarPad,
    bottomBarHeight,
    isSmall,
    isLarge,
    topInset: insets.top,
  });

  const product = route?.params?.product ?? DEFAULT_PRODUCT;
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const tagColor =
    product.tag === 'Available'
      ? t.colors.success
      : product.tag === 'Featured'
      ? t.colors.warning
      : t.colors.textSecondary;

  return (
    <View style={styles.container}>
      <View style={[styles.headerOverlay, { top: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={22} color={t.colors.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            style={styles.iconBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="share-outline" size={20} color={t.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="heart-outline" size={22} color={t.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomBarHeight + spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width, height: heroHeight }}>
          <FlatList
            ref={listRef}
            data={product.images}
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
                style={{ width, height: heroHeight }}
                resizeMode="cover"
              />
            )}
          />
          <View
            style={[
              styles.tag,
              {
                top: insets.top + spacing.sm,
                backgroundColor: tagColor + 'EE',
              },
            ]}
          >
            <Ionicons
              name={
                product.tag === 'Available'
                  ? 'checkmark-circle'
                  : product.tag === 'Featured'
                  ? 'star'
                  : 'lock-closed'
              }
              size={11}
              color={t.colors.white}
            />
            <Text style={styles.tagText}>{product.tag}</Text>
          </View>
          <View style={styles.dotsRow}>
            {product.images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
          <View style={styles.imageCounter}>
            <Ionicons name="images-outline" size={12} color={t.colors.white} />
            <Text style={styles.imageCounterText}>
              {index + 1} / {product.images.length}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={2}>
                {product.title}
              </Text>
              <Text style={styles.subtitle}>{product.property}</Text>
            </View>
          </View>

          {product.address ? (
            <View style={styles.addrRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={t.colors.textSecondary}
              />
              <Text style={styles.addrText} numberOfLines={2}>
                {product.address}
              </Text>
            </View>
          ) : null}

          <View style={styles.statsRow}>
            <Stat
              icon="bed-outline"
              value={`${product.beds}`}
              label="Bedrooms"
              c={t.colors}
              fs={t.fontScale}
            />
            <View style={styles.statDivider} />
            <Stat
              icon="water-outline"
              value={`${product.baths}`}
              label="Bathrooms"
              c={t.colors}
              fs={t.fontScale}
            />
            <View style={styles.statDivider} />
            <Stat
              icon="resize-outline"
              value={`${product.area}`}
              label="m²"
              c={t.colors}
              fs={t.fontScale}
            />
          </View>

          {product.description ? (
            <>
              <Text style={styles.section}>About this unit</Text>
              <Text style={styles.description}>{product.description}</Text>
            </>
          ) : null}

          {product.amenities && product.amenities.length > 0 ? (
            <>
              <Text style={styles.section}>Amenities</Text>
              <View style={styles.amenityWrap}>
                {product.amenities.map((a) => (
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
            </>
          ) : null}

          <Text style={styles.section}>Location</Text>
          <View style={styles.mapCard}>
            <Ionicons
              name="map-outline"
              size={36}
              color={t.colors.textSecondary}
            />
            <Text style={styles.mapHint}>Map preview</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomBarPad }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.priceLabel}>Price</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue} numberOfLines={1}>
              ${product.price}
            </Text>
            <Text style={styles.priceUnit}>/ month</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={16}
            color={t.colors.white}
          />
          <Text style={styles.bookBtnLabel}>Contact agent</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Stat: React.FC<{
  icon: any;
  value: string;
  label: string;
  c: ReturnType<typeof useTheme>['colors'];
  fs: number;
}> = ({ icon, value, label, c, fs }) => (
  <View style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
    <Ionicons name={icon} size={18} color={c.primary} />
    <Text
      style={{
        fontSize: 15 * fs,
        fontWeight: '700',
        color: c.text,
        marginTop: 4,
      }}
      numberOfLines={1}
    >
      {value}
    </Text>
    <Text
      style={{ fontSize: 11 * fs, color: c.textSecondary, textAlign: 'center' }}
      numberOfLines={1}
    >
      {label}
    </Text>
  </View>
);

interface StyleOpts {
  heroHeight: number;
  bottomBarPad: number;
  bottomBarHeight: number;
  isSmall: boolean;
  isLarge: boolean;
  topInset: number;
}

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number,
  o: StyleOpts
) => {
  const bodyPad = o.isSmall ? spacing.lg : spacing.xl;
  const titleSize = o.isLarge ? 24 : o.isSmall ? 20 : 22;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    headerOverlay: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      zIndex: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255,255,255,0.94)',
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        },
        android: { elevation: 3 },
      }),
    },
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
    dotActive: {
      backgroundColor: c.white,
      width: 9,
      height: 9,
      borderRadius: 5,
    },
    tag: {
      position: 'absolute',
      left: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
      borderRadius: 999,
    },
    tagText: { color: c.white, fontSize: 11 * fs, fontWeight: '700' },
    imageCounter: {
      position: 'absolute',
      bottom: spacing.md,
      right: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: 999,
    },
    imageCounterText: { color: c.white, fontSize: 11 * fs, fontWeight: '600' },
    body: { padding: bodyPad },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
    title: { fontSize: titleSize * fs, fontWeight: '700', color: c.text },
    subtitle: {
      fontSize: 14 * fs,
      color: c.textSecondary,
      marginTop: 2,
    },
    addrRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing.sm,
    },
    addrText: { flex: 1, fontSize: 13 * fs, color: c.textSecondary },
    statsRow: {
      flexDirection: 'row',
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: spacing.md,
      marginTop: spacing.xl,
    },
    statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: c.border },
    section: {
      fontSize: 15 * fs,
      fontWeight: '600',
      color: c.text,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: 14 * fs,
      color: c.textSecondary,
      lineHeight: 21,
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
    mapCard: {
      height: 140,
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    mapHint: { fontSize: 12 * fs, color: c.textSecondary },
    bottomBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: bodyPad,
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      backgroundColor: c.surface,
    },
    priceLabel: { fontSize: 12 * fs, color: c.textSecondary },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    priceValue: { fontSize: (o.isSmall ? 20 : 22) * fs, fontWeight: '700', color: c.text },
    priceUnit: { fontSize: 12 * fs, color: c.textSecondary },
    bookBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.md,
      paddingHorizontal: o.isSmall ? spacing.lg : spacing.xl,
      alignSelf: 'stretch',
      justifyContent: 'center',
    },
    bookBtnLabel: {
      color: c.white,
      fontWeight: '700',
      fontSize: (o.isSmall ? 13 : 14) * fs,
    },
  });
};

export default ProductDetailsScreen;
