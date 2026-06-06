import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import type { ProductFilters } from './ProductFilterScreen';

interface ProductScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
}

interface Product {
  id: string;
  title: string;
  property: string;
  beds: number;
  baths: number;
  area: number;
  price: number;
  image: string;
  images: string[];
  tag: 'Available' | 'Reserved' | 'Featured';
  amenities: string[];
  description: string;
  address: string;
}

const MOCK: Product[] = [
  {
    id: '1',
    title: 'Riverside B-204',
    property: 'Riverside Apartments',
    beds: 2,
    baths: 1,
    area: 64,
    price: 450,
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600',
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900',
    ],
    tag: 'Available',
    amenities: ['Wi-Fi', 'Parking', 'Gym', 'Pool', 'Security'],
    description:
      'Bright two-bedroom unit on the second floor with river-facing balcony.',
    address: 'Street 240, Daun Penh, Phnom Penh',
  },
  {
    id: '2',
    title: 'Bayon A-112',
    property: 'Bayon Residences',
    beds: 1,
    baths: 1,
    area: 42,
    price: 320,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900',
    ],
    tag: 'Featured',
    amenities: ['Wi-Fi', 'Elevator', 'Security'],
    description: 'Cozy studio steps from the Royal Palace.',
    address: 'Street 178, Phnom Penh',
  },
  {
    id: '3',
    title: 'Sky Tower C-901',
    property: 'Sky Tower',
    beds: 3,
    baths: 2,
    area: 98,
    price: 720,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600',
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900',
    ],
    tag: 'Available',
    amenities: ['Wi-Fi', 'Parking', 'Gym', 'Pool', 'Security', 'Elevator', 'Pet friendly'],
    description: 'Penthouse with panoramic city views.',
    address: 'BKK1, Phnom Penh',
  },
  {
    id: '4',
    title: 'Garden View D-15',
    property: 'Garden Court',
    beds: 2,
    baths: 2,
    area: 76,
    price: 530,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900',
    ],
    tag: 'Reserved',
    amenities: ['Wi-Fi', 'Parking', 'Security'],
    description: 'Quiet ground-floor unit with private garden.',
    address: 'Tuol Kork, Phnom Penh',
  },
];

const DEFAULT_FILTERS: ProductFilters = {
  status: 'all',
  minPrice: 200,
  maxPrice: 1000,
  beds: null,
  baths: null,
  amenities: [],
  sort: 'newest',
};

const ProductScreen: React.FC<ProductScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);

  const activeCount =
    (filters.status !== 'all' ? 1 : 0) +
    (filters.beds !== null ? 1 : 0) +
    (filters.baths !== null ? 1 : 0) +
    (filters.amenities.length > 0 ? 1 : 0) +
    (filters.minPrice !== DEFAULT_FILTERS.minPrice ||
    filters.maxPrice !== DEFAULT_FILTERS.maxPrice
      ? 1
      : 0);

  const tagColor = (tag: Product['tag']) => {
    if (tag === 'Available') return t.colors.success;
    if (tag === 'Featured') return t.colors.warning;
    return t.colors.textSecondary;
  };

  const items = useMemo(() => {
    let result = MOCK.filter((p) => {
      if (filters.status !== 'all') {
        const want =
          filters.status === 'available'
            ? 'Available'
            : filters.status === 'featured'
            ? 'Featured'
            : 'Reserved';
        if (p.tag !== want) return false;
      }
      if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
      if (filters.beds !== null && p.beds < filters.beds) return false;
      if (filters.baths !== null && p.baths < filters.baths) return false;
      if (
        filters.amenities.length > 0 &&
        !filters.amenities.every((a) => p.amenities.includes(a))
      )
        return false;
      if (
        query &&
        !`${p.title} ${p.property}`.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      return true;
    });

    if (filters.sort === 'priceLow') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'priceHigh') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'areaHigh') {
      result = [...result].sort((a, b) => b.area - a.area);
    }

    return result;
  }, [query, filters]);

  const openFilter = () => {
    navigation.navigate('ProductFilterScreen', {
      initial: filters,
      onApply: (f: ProductFilters) => setFilters(f),
    });
  };

  const openDetails = (p: Product) => {
    navigation.navigate('ProductDetailsScreen', {
      product: {
        id: p.id,
        title: p.title,
        property: p.property,
        beds: p.beds,
        baths: p.baths,
        area: p.area,
        price: p.price,
        images: p.images,
        tag: p.tag,
        description: p.description,
        amenities: p.amenities,
        address: p.address,
      },
    });
  };

  const Meta: React.FC<{ icon: any; label: string }> = ({ icon, label }) => (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={t.colors.textSecondary} />
      <Text style={styles.metaLabel}>{label}</Text>
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
        <TouchableOpacity
          style={styles.filterPill}
          activeOpacity={0.85}
          onPress={openFilter}
        >
          <Ionicons name="options-outline" size={14} color={t.colors.white} />
          <Text style={styles.filterPillLabel}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultRow}>
        <Text style={styles.resultText}>{items.length} result{items.length === 1 ? '' : 's'}</Text>
        {activeCount > 0 ? (
          <TouchableOpacity onPress={() => setFilters(DEFAULT_FILTERS)}>
            <Text style={styles.clearText}>Clear filters</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={36} color={t.colors.textHint} />
            <Text style={styles.emptyText}>No matches</Text>
          </View>
        ) : (
          items.map((p) => (
            <View key={p.id} style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => openDetails(p)}
              >
                <Image source={{ uri: p.image }} style={styles.image} />
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: tagColor(p.tag) + '22' },
                  ]}
                >
                  <Text style={[styles.tagText, { color: tagColor(p.tag) }]}>
                    {p.tag}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.body}>
                <Text style={styles.title}>{p.title}</Text>
                <Text style={styles.subtitle}>{p.property}</Text>
                <View style={styles.metaRow}>
                  <Meta icon="bed-outline" label={`${p.beds} bed`} />
                  <Meta icon="water-outline" label={`${p.baths} bath`} />
                  <Meta icon="resize-outline" label={`${p.area} m²`} />
                </View>
                <View style={styles.footRow}>
                  <View style={styles.priceCol}>
                    <Text style={styles.price}>${p.price}</Text>
                    <Text style={styles.priceUnit}>/ month</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.detailsBtn}
                    activeOpacity={0.85}
                    onPress={() => openDetails(p)}
                  >
                    <Text style={styles.detailsBtnLabel}>Details</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={t.colors.white}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    searchInput: {
      flex: 1,
      fontSize: 14 * fs,
      color: c.text,
      paddingVertical: 0,
    },
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
    list: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing['4xl'],
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    image: { width: '100%', height: 160 },
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
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
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
    empty: {
      alignItems: 'center',
      paddingVertical: spacing['4xl'],
      gap: spacing.sm,
    },
    emptyText: { color: c.textSecondary, fontSize: 14 * fs },
  });

export default ProductScreen;
