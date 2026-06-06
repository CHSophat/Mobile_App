import { Ionicons } from '@expo/vector-icons';
import productService, { ProductDto, ProductStatus } from '@services/api/productService';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DEFAULT_FILTERS } from './ProductFilterScreen';
import type { ProductFilters } from './ProductFilterScreen';

interface ProductScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
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

function extractItems(res: unknown): ProductDto[] {
  const r = res as any;
  if (Array.isArray(r?.data?.products)) return r.data.products;
  if (Array.isArray(r?.data?.items)) return r.data.items;
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r?.products)) return r.products;
  if (Array.isArray(r?.items)) return r.items;
  if (Array.isArray(r)) return r;
  return [];
}

function filterToApiStatus(status: ProductFilters['status']): ProductStatus | undefined {
  if (status === 'available') return 'vacant';
  if (status === 'reserved') return 'occupied';
  if (status === 'maintenance') return 'maintenance';
  return undefined;
}

const ProductScreen: React.FC<ProductScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const activeCount =
    (filters.status !== 'all' ? 1 : 0) +
    (filters.beds !== null ? 1 : 0) +
    (filters.baths !== null ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice < 9999 ? 1 : 0);

  const tagColor = (tag: TagLabel) => {
    if (tag === 'Available') return t.colors.success;
    if (tag === 'Maintenance') return t.colors.warning;
    return t.colors.textSecondary;
  };

  const loadProducts = useCallback(async (q: string, f: ProductFilters, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const apiStatus = filterToApiStatus(f.status);
      const baseFilter = {
        page: 1,
        pageSize: 50,
        ...(apiStatus ? { status: apiStatus } : {}),
        ...(f.minPrice > 0 ? { minPrice: f.minPrice } : {}),
        ...(f.maxPrice < 9999 ? { maxPrice: f.maxPrice } : {}),
        ...(f.beds !== null ? { bedrooms: f.beds } : {}),
      };

      console.log('[ProductScreen] calling:', q.trim() ? 'search' : 'listUnits', baseFilter);

      const res = q.trim()
        ? await productService.search(q.trim(), baseFilter)
        : await productService.listUnits(baseFilter);

      console.log('[ProductScreen] raw response keys:', Object.keys(res as any));
      console.log('[ProductScreen] full response:', JSON.stringify(res, null, 2));

      let items: ProductDto[] = extractItems(res);
      console.log('[ProductScreen] extracted items count:', items.length);

      if (f.sort === 'priceLow') items = [...items].sort((a, b) => a.basePrice - b.basePrice);
      else if (f.sort === 'priceHigh') items = [...items].sort((a, b) => b.basePrice - a.basePrice);
      else if (f.sort === 'areaHigh')
        items = [...items].sort((a, b) => (b.squareFeet ?? 0) - (a.squareFeet ?? 0));

      setProducts(items);
    } catch (e: any) {
      console.log('[ProductScreen] ERROR status:', e?.response?.status);
      console.log('[ProductScreen] ERROR message:', e?.message);
      console.log('[ProductScreen] ERROR response data:', JSON.stringify(e?.response?.data));
      console.log('[ProductScreen] ERROR config url:', e?.config?.url);
      console.log('[ProductScreen] ERROR config baseURL:', e?.config?.baseURL);
      setError(e?.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      loadProducts(query, filters);
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [query, filters, loadProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts(query, filters, true);
  };

  const openFilter = () => {
    navigation.navigate('ProductFilterScreen', {
      initial: filters,
      onApply: (f: ProductFilters) => setFilters(f),
    });
  };

  const openDetails = (product: ProductDto) => {
    navigation.navigate('ProductDetailsScreen', { productId: product.id });
  };

  const typeIcon = (type: ProductDto['productType']): any => {
    const map: Record<string, any> = {
      unit: 'home-outline',
      parking: 'car-outline',
      storage: 'cube-outline',
      amenity: 'star-outline',
    };
    return map[type] ?? 'business-outline';
  };

  const typeLabel = (type: ProductDto['productType']): string => {
    const map: Record<string, string> = {
      unit: 'Unit',
      parking: 'Parking',
      storage: 'Storage',
      amenity: 'Amenity',
    };
    return map[type] ?? type;
  };

  const renderCard = ({ item: p }: { item: ProductDto }) => {
    const tag = statusToTag(p.status);
    const color = tagColor(tag);
    const sqft = p.squareFeet ? `${p.squareFeet} sqft` : '—';

    return (
      <View style={styles.card}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => openDetails(p)}>
          {p.primaryPhoto ? (
            <Image source={{ uri: p.primaryPhoto }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name={typeIcon(p.productType)} size={40} color={t.colors.primary + '88'} />
            </View>
          )}
          <View style={[styles.tag, { backgroundColor: color + '22' }]}>
            <Text style={[styles.tagText, { color }]}>{tag}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {p.name ?? p.code}
          </Text>
          <Text style={styles.subtitle}>
            {typeLabel(p.productType)}
            {p.floorNumber != null ? ` · Floor ${p.floorNumber}` : ''}
          </Text>
          <View style={styles.metaRow}>
            {p.bedrooms != null && (
              <MetaItem icon="bed-outline" label={`${p.bedrooms} bed`} t={t} styles={styles} />
            )}
            {p.bathrooms != null && (
              <MetaItem icon="water-outline" label={`${p.bathrooms} bath`} t={t} styles={styles} />
            )}
            <MetaItem icon="resize-outline" label={sqft} t={t} styles={styles} />
          </View>
          <View style={styles.footRow}>
            <View style={styles.priceCol}>
              <Text style={styles.price}>${p.basePrice}</Text>
              <Text style={styles.priceUnit}>/ month</Text>
            </View>
            <TouchableOpacity
              style={styles.detailsBtn}
              activeOpacity={0.85}
              onPress={() => openDetails(p)}
            >
              <Text style={styles.detailsBtnLabel}>Details</Text>
              <Ionicons name="arrow-forward" size={14} color={t.colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.empty}>
          <Ionicons name="cloud-offline-outline" size={36} color={t.colors.textHint} />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadProducts(query, filters)}
          >
            <Text style={styles.retryLabel}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.empty}>
        <Ionicons name="cube-outline" size={36} color={t.colors.textHint} />
        <Text style={styles.emptyText}>No products found</Text>
      </View>
    );
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
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={openFilter}
        >
          <View>
            <Ionicons name="options-outline" size={22} color={t.colors.text} />
            {activeCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeCount}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={t.colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search units, properties..."
          placeholderTextColor={t.colors.textHint}
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.filterPill} activeOpacity={0.85} onPress={openFilter}>
          <Ionicons name="options-outline" size={14} color={t.colors.white} />
          <Text style={styles.filterPillLabel}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultRow}>
        <Text style={styles.resultText}>
          {loading ? 'Loading…' : `${products.length} result${products.length === 1 ? '' : 's'}`}
        </Text>
        {activeCount > 0 ? (
          <TouchableOpacity onPress={() => setFilters(DEFAULT_FILTERS)}>
            <Text style={styles.clearText}>Clear filters</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={t.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={t.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const MetaItem: React.FC<{
  icon: any;
  label: string;
  t: ReturnType<typeof useTheme>;
  styles: ReturnType<typeof makeStyles>;
}> = ({ icon, label, t, styles }) => (
  <View style={styles.metaItem}>
    <Ionicons name={icon} size={13} color={t.colors.textSecondary} />
    <Text style={styles.metaLabel}>{label}</Text>
  </View>
);

const makeStyles = (c: ReturnType<typeof useTheme>['colors'], fs: number) =>
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
    filterBadge: {
      position: 'absolute',
      top: -4,
      right: -6,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: 8,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadgeText: { color: c.white, fontSize: 10 * fs, fontWeight: '700' },
    searchWrap: {
      marginHorizontal: spacing.xl,
      marginTop: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingLeft: spacing.md,
      paddingRight: 4,
      height: 44,
      borderRadius: 12,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    searchInput: { flex: 1, fontSize: 14 * fs, color: c.text, paddingVertical: 0 },
    filterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    filterPillLabel: { color: c.white, fontSize: 12 * fs, fontWeight: '600' },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    resultText: { fontSize: 13 * fs, color: c.textSecondary },
    clearText: { fontSize: 13 * fs, color: c.primary, fontWeight: '600' },
    loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
    card: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    cardImage: { width: '100%', height: 160 },
    imagePlaceholder: {
      width: '100%',
      height: 160,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tag: {
      position: 'absolute',
      top: spacing.sm,
      left: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: 999,
    },
    tagText: { fontSize: 11 * fs, fontWeight: '600' },
    body: { padding: spacing.md },
    title: { fontSize: 16 * fs, fontWeight: '700', color: c.text },
    subtitle: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaLabel: { fontSize: 12 * fs, color: c.textSecondary },
    footRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    priceCol: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    price: { fontSize: 18 * fs, fontWeight: '700', color: c.text },
    priceUnit: { fontSize: 12 * fs, color: c.textSecondary },
    detailsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 999,
    },
    detailsBtnLabel: { color: c.white, fontSize: 13 * fs, fontWeight: '700' },
    empty: { alignItems: 'center', paddingVertical: spacing['4xl'], gap: spacing.sm },
    emptyText: { color: c.textSecondary, fontSize: 14 * fs, textAlign: 'center' },
    retryBtn: {
      marginTop: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      backgroundColor: c.primary,
    },
    retryLabel: { color: c.white, fontSize: 13 * fs, fontWeight: '600' },
  });

export default ProductScreen;
