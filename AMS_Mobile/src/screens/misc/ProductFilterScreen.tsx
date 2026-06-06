import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

export interface ProductFilters {
  status: 'all' | 'available' | 'featured' | 'reserved';
  minPrice: number;
  maxPrice: number;
  beds: number | null;
  baths: number | null;
  amenities: string[];
  sort: 'newest' | 'priceLow' | 'priceHigh' | 'areaHigh';
}

interface ProductFilterScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
  route?: {
    params?: {
      initial?: ProductFilters;
      onApply?: (f: ProductFilters) => void;
    };
  };
}

const DEFAULT_FILTERS: ProductFilters = {
  status: 'all',
  minPrice: 200,
  maxPrice: 1000,
  beds: null,
  baths: null,
  amenities: [],
  sort: 'newest',
};

const STATUSES: { key: ProductFilters['status']; label: string; icon: any }[] = [
  { key: 'all', label: 'All', icon: 'apps-outline' },
  { key: 'available', label: 'Available', icon: 'checkmark-circle-outline' },
  { key: 'featured', label: 'Featured', icon: 'star-outline' },
  { key: 'reserved', label: 'Reserved', icon: 'lock-closed-outline' },
];

const SORTS: { key: ProductFilters['sort']; label: string; icon: any }[] = [
  { key: 'newest', label: 'Newest', icon: 'sparkles-outline' },
  { key: 'priceLow', label: 'Price · low to high', icon: 'arrow-down-outline' },
  { key: 'priceHigh', label: 'Price · high to low', icon: 'arrow-up-outline' },
  { key: 'areaHigh', label: 'Largest area', icon: 'resize-outline' },
];

const AMENITIES = ['Wi-Fi', 'Parking', 'Gym', 'Pool', 'Security', 'Elevator', 'Pet friendly'];

const ProductFilterScreen: React.FC<ProductFilterScreenProps> = ({
  navigation,
  route,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);

  const [filters, setFilters] = useState<ProductFilters>(
    route?.params?.initial ?? DEFAULT_FILTERS
  );

  const toggleAmenity = (a: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const reset = () => setFilters(DEFAULT_FILTERS);

  const apply = () => {
    route?.params?.onApply?.(filters);
    if (navigation.canGoBack()) navigation.goBack();
  };

  const NumPicker: React.FC<{
    label: string;
    value: number | null;
    onChange: (n: number | null) => void;
  }> = ({ label, value, onChange }) => (
    <View style={{ flex: 1 }}>
      <Text style={styles.subLabel}>{label}</Text>
      <View style={styles.numRow}>
        <TouchableOpacity
          style={[styles.numChip, value === null && styles.numChipActive]}
          onPress={() => onChange(null)}
        >
          <Text
            style={[
              styles.numChipLabel,
              value === null && styles.numChipLabelActive,
            ]}
          >
            Any
          </Text>
        </TouchableOpacity>
        {[1, 2, 3].map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.numChip, value === n && styles.numChipActive]}
            onPress={() => onChange(n)}
          >
            <Text
              style={[
                styles.numChipLabel,
                value === n && styles.numChipLabelActive,
              ]}
            >
              {n}+
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={reset} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>Status</Text>
        <View style={styles.statusGrid}>
          {STATUSES.map((s) => {
            const active = filters.status === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.statusChip, active && styles.statusChipActive]}
                activeOpacity={0.85}
                onPress={() => setFilters((p) => ({ ...p, status: s.key }))}
              >
                <Ionicons
                  name={s.icon}
                  size={16}
                  color={active ? t.colors.primaryDark : t.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.statusChipLabel,
                    active && styles.statusChipLabelActive,
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.section}>Price range</Text>
        <View style={styles.priceRow}>
          <View style={styles.priceField}>
            <Text style={styles.subLabel}>Min</Text>
            <View style={styles.priceBox}>
              <Text style={styles.priceBoxText}>${filters.minPrice}</Text>
            </View>
          </View>
          <Text style={styles.priceDash}>—</Text>
          <View style={styles.priceField}>
            <Text style={styles.subLabel}>Max</Text>
            <View style={styles.priceBox}>
              <Text style={styles.priceBoxText}>${filters.maxPrice}</Text>
            </View>
          </View>
        </View>
        <View style={styles.priceQuickRow}>
          {[
            { min: 200, max: 400, label: '< $400' },
            { min: 400, max: 700, label: '$400–700' },
            { min: 700, max: 1200, label: '$700+' },
          ].map((p) => {
            const active =
              filters.minPrice === p.min && filters.maxPrice === p.max;
            return (
              <TouchableOpacity
                key={p.label}
                style={[styles.quickChip, active && styles.quickChipActive]}
                onPress={() =>
                  setFilters((prev) => ({
                    ...prev,
                    minPrice: p.min,
                    maxPrice: p.max,
                  }))
                }
              >
                <Text
                  style={[
                    styles.quickChipLabel,
                    active && styles.quickChipLabelActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.section}>Layout</Text>
        <View style={styles.layoutRow}>
          <NumPicker
            label="Beds"
            value={filters.beds}
            onChange={(n) => setFilters((p) => ({ ...p, beds: n }))}
          />
          <View style={{ width: spacing.md }} />
          <NumPicker
            label="Baths"
            value={filters.baths}
            onChange={(n) => setFilters((p) => ({ ...p, baths: n }))}
          />
        </View>

        <Text style={styles.section}>Amenities</Text>
        <View style={styles.amenWrap}>
          {AMENITIES.map((a) => {
            const active = filters.amenities.includes(a);
            return (
              <TouchableOpacity
                key={a}
                style={[styles.amenChip, active && styles.amenChipActive]}
                onPress={() => toggleAmenity(a)}
                activeOpacity={0.85}
              >
                {active ? (
                  <Ionicons name="checkmark" size={14} color={t.colors.primaryDark} />
                ) : null}
                <Text
                  style={[styles.amenLabel, active && styles.amenLabelActive]}
                >
                  {a}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.section}>Sort by</Text>
        <View style={styles.sortCard}>
          {SORTS.map((s, i) => {
            const active = filters.sort === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                style={[
                  styles.sortRow,
                  i < SORTS.length - 1 && styles.sortRowBorder,
                ]}
                onPress={() => setFilters((p) => ({ ...p, sort: s.key }))}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={s.icon}
                  size={18}
                  color={active ? t.colors.primary : t.colors.textSecondary}
                />
                <Text style={styles.sortLabel}>{s.label}</Text>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.applyBtn}
          activeOpacity={0.85}
          onPress={apply}
        >
          <Text style={styles.applyBtnLabel}>Apply filters</Text>
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
    resetText: { color: c.primary, fontSize: 14 * fs, fontWeight: '600' },
    scroll: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing['4xl'],
    },
    section: {
      fontSize: 13 * fs,
      fontWeight: '600',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    subLabel: {
      fontSize: 12 * fs,
      color: c.textSecondary,
      marginBottom: 4,
    },
    statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    statusChip: {
      flexBasis: '47%',
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    statusChipActive: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    statusChipLabel: { fontSize: 13 * fs, color: c.text, fontWeight: '500' },
    statusChipLabelActive: { color: c.primaryDark, fontWeight: '600' },
    priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
    priceField: { flex: 1 },
    priceDash: { color: c.textSecondary, paddingBottom: spacing.md },
    priceBox: {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      height: 44,
      justifyContent: 'center',
    },
    priceBoxText: { fontSize: 15 * fs, fontWeight: '600', color: c.text },
    priceQuickRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    quickChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    quickChipActive: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    quickChipLabel: { fontSize: 12 * fs, color: c.text, fontWeight: '500' },
    quickChipLabelActive: { color: c.primaryDark, fontWeight: '600' },
    layoutRow: { flexDirection: 'row' },
    numRow: { flexDirection: 'row', gap: spacing.xs },
    numChip: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      alignItems: 'center',
    },
    numChipActive: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    numChipLabel: { fontSize: 13 * fs, color: c.text, fontWeight: '500' },
    numChipLabelActive: { color: c.primaryDark, fontWeight: '600' },
    amenWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    amenChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    amenChipActive: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    amenLabel: { fontSize: 12 * fs, color: c.text, fontWeight: '500' },
    amenLabelActive: { color: c.primaryDark, fontWeight: '600' },
    sortCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    sortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    sortRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    sortLabel: { flex: 1, fontSize: 14 * fs, color: c.text },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioActive: { borderColor: c.primary },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.primary,
    },
    bottomBar: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      backgroundColor: c.surface,
    },
    applyBtn: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },
    applyBtnLabel: { color: c.white, fontSize: 16 * fs, fontWeight: '700' },
  });

export default ProductFilterScreen;
