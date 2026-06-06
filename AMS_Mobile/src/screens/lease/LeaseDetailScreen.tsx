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

interface LeaseDetailScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
  route?: { params?: { leaseId?: string } };
}

const MOCK = {
  number: 'L-9821',
  unit: 'B-204',
  property: 'Riverside Apts',
  start: 'Mar 1 2025',
  end: 'Feb 28 2026',
  rent: 450,
  status: 'Active',
  actionRequired: 'Review & sign addendum',
  documents: [
    { id: '1', label: 'Lease agreement', kind: 'pdf' },
    { id: '2', label: 'Addendum #1', kind: 'pdf' },
    { id: '3', label: 'Move-in checklist', kind: 'link' },
  ] as { id: string; label: string; kind: 'pdf' | 'link' }[],
};

const LeaseDetailScreen: React.FC<LeaseDetailScreenProps> = ({
  navigation,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={26} color={t.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 26 }} />
        )}
        <Text style={styles.headerTitle}>Lease #{MOCK.number}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryUnit}>
            Unit {MOCK.unit} · {MOCK.property}
          </Text>
          <Text style={styles.summaryPeriod}>
            {MOCK.start} → {MOCK.end}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryRent}>${MOCK.rent}/mo</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{MOCK.status}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.section}>Documents</Text>
        <View style={styles.docCard}>
          {MOCK.documents.map((d, i) => (
            <TouchableOpacity
              key={d.id}
              activeOpacity={0.8}
              style={[
                styles.docRow,
                i < MOCK.documents.length - 1 && styles.docRowBorder,
              ]}
              onPress={() =>
                d.kind === 'link'
                  ? navigation.navigate('MoveInChecklistScreen')
                  : navigation.navigate('DocumentViewerScreen', { id: d.id })
              }
            >
              <Ionicons
                name={d.kind === 'pdf' ? 'document-text-outline' : 'checkbox-outline'}
                size={20}
                color={t.colors.primary}
              />
              <Text style={styles.docLabel}>
                {d.label}
                {d.kind === 'pdf' ? ' (PDF)' : ''}
              </Text>
              <Ionicons
                name={d.kind === 'pdf' ? 'download-outline' : 'chevron-forward'}
                size={18}
                color={t.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Ionicons name="warning-outline" size={18} color={t.colors.warning} />
            <Text style={styles.alertTitle}>Action required</Text>
          </View>
          <TouchableOpacity
            style={styles.alertCta}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SignLeaseScreen')}
          >
            <Text style={styles.alertCtaLabel}>{MOCK.actionRequired}</Text>
          </TouchableOpacity>
        </View>
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
    summaryCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.primarySoft,
    },
    summaryUnit: { fontSize: 16 * fs, fontWeight: '600', color: c.text },
    summaryPeriod: {
      fontSize: 13 * fs,
      color: c.textSecondary,
      marginTop: spacing.xs,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    summaryRent: { fontSize: 20 * fs, fontWeight: '700', color: c.text },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.primarySoft,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.primary,
    },
    statusText: { color: c.primaryDark, fontSize: 12 * fs, fontWeight: '600' },
    section: {
      fontSize: 15 * fs,
      fontWeight: '600',
      color: c.text,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    docCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    docRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    docRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    docLabel: { flex: 1, fontSize: 14 * fs, color: c.text },
    alertCard: {
      backgroundColor: c.warning + '20',
      borderRadius: 14,
      padding: spacing.lg,
      marginTop: spacing.xl,
      borderWidth: 1,
      borderColor: c.warning + '55',
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: spacing.md,
    },
    alertTitle: { color: c.text, fontSize: 14 * fs, fontWeight: '600' },
    alertCta: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    alertCtaLabel: { color: c.white, fontWeight: '600', fontSize: 14 * fs },
  });

export default LeaseDetailScreen;
