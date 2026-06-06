import { Ionicons } from '@expo/vector-icons';
import productService, {
  PaymentBreakdownDto,
  ProductDto,
  ProductStatus,
} from '@services/api/productService';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProductDetailsScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
  route?: { params?: { productId?: number } };
}

type TagLabel = 'Available' | 'Reserved' | 'Maintenance' | 'Unavailable';

function statusToTag(status: ProductStatus): TagLabel {
  const map: Record<ProductStatus, TagLabel> = {
    vacant: 'Available',
    occupied: 'Reserved',
    maintenance: 'Maintenance',
    unavailable: 'Unavailable',
  };
  return map[status];
}

function tagIcon(tag: TagLabel): any {
  if (tag === 'Available') return 'checkmark-circle';
  if (tag === 'Maintenance') return 'construct';
  return 'lock-closed';
}

const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({ navigation, route }) => {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isSmall = width < 360;
  const isLarge = width >= 414;

  const heroHeight = Math.round(Math.min(Math.max(height * 0.34, 220), width * 0.95));
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

  const productId = route?.params?.productId;

  const [product, setProduct] = useState<ProductDto | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [breakdown, setBreakdown] = useState<PaymentBreakdownDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!productId) {
      setError('No product selected.');
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, breakRes] = await Promise.allSettled([
          productService.getById(productId),
          productService.getPaymentBreakdown(productId),
        ]);

        if (cancelled) return;

        if (prodRes.status === 'fulfilled') {
          const raw = prodRes.value as any;
          const prod: ProductDto = raw?.data ?? raw;
          setProduct(prod);
          // Use embedded photos array from the product; fall back to primaryPhoto only
          const photoUrls: string[] =
            Array.isArray(prod?.photos) && prod.photos.length > 0
              ? prod.photos
              : prod?.primaryPhoto
              ? [prod.primaryPhoto]
              : [];
          setPhotos(photoUrls);
        } else {
          setError(prodRes.reason?.message ?? 'Failed to load product');
        }

        if (breakRes.status === 'fulfilled') {
          const raw = breakRes.value as any;
          setBreakdown(raw?.data ?? raw ?? null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [productId]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== photoIndex) setPhotoIndex(i);
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={t.colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', gap: spacing.md }]}>
        <Ionicons name="alert-circle-outline" size={40} color={t.colors.textHint} />
        <Text style={{ color: t.colors.textSecondary, fontSize: 15 * t.fontScale, textAlign: 'center', paddingHorizontal: spacing.xl }}>
          {error ?? 'Product not found'}
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: t.colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: 999 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: t.colors.white, fontWeight: '700', fontSize: 14 * t.fontScale }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tag = statusToTag(product.status);
  const tagColor =
    tag === 'Available' ? t.colors.success : tag === 'Maintenance' ? t.colors.warning : t.colors.textSecondary;

  const imageUrls = photos.map((p) => p.photoUrl);
  const hasPhotos = imageUrls.length > 0;

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
        <TouchableOpacity style={styles.iconBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="share-outline" size={20} color={t.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomBarHeight + spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero / photos */}
        <View style={{ width, height: heroHeight }}>
          {hasPhotos ? (
            <>
              <FlatList
                ref={listRef}
                data={imageUrls}
                keyExtractor={(_, i) => String(i)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={{ width, height: heroHeight }} resizeMode="cover" />
                )}
              />
              <View style={styles.dotsRow}>
                {imageUrls.map((_, i) => (
                  <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
                ))}
              </View>
              <View style={styles.imageCounter}>
                <Ionicons name="images-outline" size={12} color={t.colors.white} />
                <Text style={styles.imageCounterText}>
                  {photoIndex + 1} / {imageUrls.length}
                </Text>
              </View>
            </>
          ) : (
            <View style={[styles.photoPlaceholder, { height: heroHeight }]}>
              <Ionicons name="home-outline" size={56} color={t.colors.primary + '66'} />
            </View>
          )}

          <View style={[styles.tag, { top: insets.top + spacing.sm, backgroundColor: tagColor + 'EE' }]}>
            <Ionicons name={tagIcon(tag)} size={11} color={t.colors.white} />
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {product.name ?? product.code}
          </Text>
          <Text style={styles.subtitle}>
            {product.productType.charAt(0).toUpperCase() + product.productType.slice(1)}
            {product.floorNumber != null ? ` · Floor ${product.floorNumber}` : ''}
          </Text>

          <View style={styles.statsRow}>
            {product.bedrooms != null && (
              <>
                <Stat icon="bed-outline" value={`${product.bedrooms}`} label="Bedrooms" c={t.colors} fs={t.fontScale} />
                <View style={styles.statDivider} />
              </>
            )}
            {product.bathrooms != null && (
              <>
                <Stat icon="water-outline" value={`${product.bathrooms}`} label="Bathrooms" c={t.colors} fs={t.fontScale} />
                <View style={styles.statDivider} />
              </>
            )}
            {product.squareFeet != null && (
              <Stat icon="resize-outline" value={`${product.squareFeet}`} label="sq ft" c={t.colors} fs={t.fontScale} />
            )}
          </View>

          {product.description ? (
            <>
              <Text style={styles.section}>About this unit</Text>
              <Text style={styles.description}>{product.description}</Text>
            </>
          ) : null}

          {breakdown ? (
            <>
              <Text style={styles.section}>Payment breakdown</Text>
              <View style={styles.breakdownCard}>
                <BreakdownRow label="Base rent" value={breakdown.baseRent} currency={breakdown.currency} c={t.colors} fs={t.fontScale} />
                <BreakdownRow label="Taxes" value={breakdown.taxes} currency={breakdown.currency} c={t.colors} fs={t.fontScale} />
                <BreakdownRow label="Fees" value={breakdown.fees} currency={breakdown.currency} c={t.colors} fs={t.fontScale} />
                <View style={styles.breakdownDivider} />
                <BreakdownRow label="Total / month" value={breakdown.totalMonthly} currency={breakdown.currency} c={t.colors} fs={t.fontScale} bold />
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomBarPad }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.priceLabel}>Base price</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue} numberOfLines={1}>
              ${product.basePrice}
            </Text>
            <Text style={styles.priceUnit}>/ month</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={t.colors.white} />
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
    <Text style={{ fontSize: 15 * fs, fontWeight: '700', color: c.text, marginTop: 4 }} numberOfLines={1}>
      {value}
    </Text>
    <Text style={{ fontSize: 11 * fs, color: c.textSecondary, textAlign: 'center' }} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const BreakdownRow: React.FC<{
  label: string;
  value: number;
  currency: string;
  c: ReturnType<typeof useTheme>['colors'];
  fs: number;
  bold?: boolean;
}> = ({ label, value, currency, c, fs, bold }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
    <Text style={{ fontSize: 14 * fs, color: bold ? c.text : c.textSecondary, fontWeight: bold ? '700' : '400' }}>
      {label}
    </Text>
    <Text style={{ fontSize: 14 * fs, color: bold ? c.text : c.textSecondary, fontWeight: bold ? '700' : '500' }}>
      {currency} {value.toFixed(2)}
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

const makeStyles = (c: ReturnType<typeof useTheme>['colors'], fs: number, o: StyleOpts) => {
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
        ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
        android: { elevation: 3 },
      }),
    },
    photoPlaceholder: {
      width: '100%',
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
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
    dotActive: { backgroundColor: c.white, width: 9, height: 9, borderRadius: 5 },
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
    title: { fontSize: titleSize * fs, fontWeight: '700', color: c.text },
    subtitle: { fontSize: 14 * fs, color: c.textSecondary, marginTop: 2 },
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
    description: { fontSize: 14 * fs, color: c.textSecondary, lineHeight: 21 },
    breakdownCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    breakdownDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginVertical: spacing.sm,
    },
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
    bookBtnLabel: { color: c.white, fontWeight: '700', fontSize: (o.isSmall ? 13 : 14) * fs },
  });
};

export default ProductDetailsScreen;
