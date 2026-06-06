import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

interface Lease {
  id: string;
  number: string;
  unit: string;
  property: string;
  start: string;
  end: string;
  rent: number;
  status: 'Active' | 'Expired' | 'Upcoming';
  actionRequired?: boolean;
}

const MOCK: Lease[] = [
  {
    id: '1',
    number: 'L-9821',
    unit: 'B-204',
    property: 'Riverside Apts',
    start: 'Mar 1 2025',
    end: 'Feb 28 2026',
    rent: 450,
    status: 'Active',
    actionRequired: true,
  },
  {
    id: '2',
    number: 'L-8754',
    unit: 'A-112',
    property: 'Bayon Residences',
    start: 'Jan 1 2024',
    end: 'Dec 31 2024',
    rent: 380,
    status: 'Expired',
  },
];

interface MyLeasesScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
}

const MyLeasesScreen: React.FC<MyLeasesScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);

  const statusColor = (s: Lease['status']) => {
    if (s === 'Active') return t.colors.primary;
    if (s === 'Upcoming') return t.colors.warning;
    return t.colors.textSecondary;
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
        <Text style={styles.headerTitle}>My leases & documents</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {MOCK.map((l) => {
          const sc = statusColor(l.status);
          return (
            <TouchableOpacity
              key={l.id}
              activeOpacity={0.85}
              style={styles.card}
              onPress={() =>
                navigation.navigate('LeaseDetailScreen', { leaseId: l.id })
              }
            >
              <View style={styles.cardHead}>
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={t.colors.primary}
                />
                <Text style={styles.cardNumber}>#{l.number}</Text>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: sc + '22' },
                  ]}
                >
                  <View
                    style={[styles.statusDot, { backgroundColor: sc }]}
                  />
                  <Text style={[styles.statusText, { color: sc }]}>
                    {l.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardUnit}>
                Unit {l.unit} · {l.property}
              </Text>
              <Text style={styles.cardPeriod}>
                {l.start} → {l.end}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardRent}>${l.rent}/mo</Text>
                {l.actionRequired ? (
                  <View style={styles.alertRow}>
                    <Ionicons
                      name="warning-outline"
                      size={14}
                      color={t.colors.warning}
                    />
                    <Text style={styles.alertText}>Action required</Text>
                  </View>
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={t.colors.textSecondary}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
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
    scroll: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing['4xl'],
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.md,
    },
    cardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    cardNumber: {
      flex: 1,
      fontSize: 16 * fs,
      fontWeight: '700',
      color: c.text,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: 999,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11 * fs, fontWeight: '600' },
    cardUnit: { fontSize: 14 * fs, color: c.text, marginTop: 2 },
    cardPeriod: {
      fontSize: 12 * fs,
      color: c.textSecondary,
      marginTop: 2,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    cardRent: { fontSize: 16 * fs, fontWeight: '700', color: c.text },
    alertRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    alertText: { color: c.warning, fontSize: 12 * fs, fontWeight: '600' },
  });

export default MyLeasesScreen;
