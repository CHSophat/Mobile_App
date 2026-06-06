import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useAppSelector } from '@store/hooks';
import {
  customerService,
  LeaseDocumentDto,
  LeaseHistoryDto,
} from '@services/api/customerService';

interface LeaseDetailScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
  route?: { params?: { leaseId?: number | string; lease?: LeaseHistoryDto } };
}

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
};

const money = (amount: number, currency: string) =>
  currency === 'USD'
    ? `$${amount.toFixed(0)}`
    : `${amount.toFixed(0)} ${currency}`;

const LeaseDetailScreen: React.FC<LeaseDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const user = useAppSelector((s) => s.auth.user);

  const leaseId = route?.params?.leaseId;
  const [lease, setLease] = useState<LeaseHistoryDto | undefined>(
    route?.params?.lease
  );
  const [documents, setDocuments] = useState<LeaseDocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  const load = useCallback(async () => {
    if (leaseId == null) {
      setError('Missing lease reference.');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      setDocuments(await customerService.getLeaseDocuments(leaseId));
    } catch (e: any) {
      setError(e?.message || 'Failed to load lease documents.');
    } finally {
      setLoading(false);
    }
  }, [leaseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDocument = async (doc: LeaseDocumentDto) => {
    try {
      const ok = await Linking.canOpenURL(doc.url);
      if (ok) await Linking.openURL(doc.url);
      else Alert.alert('Cannot open', 'This document link is not available.');
    } catch {
      Alert.alert('Cannot open', 'This document link is not available.');
    }
  };

  const confirmSign = () => {
    if (leaseId == null) return;
    const signedName = user?.email ?? 'Tenant';
    Alert.alert(
      'Sign lease',
      `By tapping Agree you sign this lease as "${signedName}" and accept its terms.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Agree & sign',
          onPress: async () => {
            setSigning(true);
            try {
              const updated = await customerService.signLease(leaseId, {
                signedName,
                agreedToTerms: true,
              });
              setLease(updated);
              await load();
              Alert.alert('Signed', 'Your lease has been signed.');
            } catch (e: any) {
              Alert.alert('Sign failed', e?.message || 'Please try again.');
            } finally {
              setSigning(false);
            }
          },
        },
      ]
    );
  };

  const title = lease ? `Lease #${lease.leaseNumber}` : 'Lease';

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
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {lease ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryUnit}>
              {lease.unitLabel ? `Unit ${lease.unitLabel}` : 'Unit —'}
              {lease.propertyName ? ` · ${lease.propertyName}` : ''}
            </Text>
            <Text style={styles.summaryPeriod}>
              {fmtDate(lease.startDate)} → {fmtDate(lease.endDate)}
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryRent}>
                {money(lease.monthlyRent, lease.currency)}/mo
              </Text>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <Text style={styles.section}>Documents</Text>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={t.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={18} color={t.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.docCard}>
            <Text style={styles.emptyText}>No documents attached.</Text>
          </View>
        ) : (
          <View style={styles.docCard}>
            {documents.map((d, i) => (
              <TouchableOpacity
                key={d.id}
                activeOpacity={0.8}
                style={[
                  styles.docRow,
                  i < documents.length - 1 && styles.docRowBorder,
                ]}
                onPress={() => openDocument(d)}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={t.colors.primary}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docLabel}>{d.fileName}</Text>
                  {d.documentType ? (
                    <Text style={styles.docMeta}>
                      {d.documentType}
                      {d.signed ? ' · Signed' : ''}
                    </Text>
                  ) : d.signed ? (
                    <Text style={styles.docMeta}>Signed</Text>
                  ) : null}
                </View>
                <Ionicons
                  name="open-outline"
                  size={18}
                  color={t.colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.checklistLink}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('MoveInChecklistScreen', { leaseId })
          }
        >
          <Ionicons name="checkbox-outline" size={20} color={t.colors.primary} />
          <Text style={styles.checklistLabel}>Move-in checklist</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={t.colors.textSecondary}
          />
        </TouchableOpacity>

        {lease?.requiresSignature ? (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons
                name="warning-outline"
                size={18}
                color={t.colors.warning}
              />
              <Text style={styles.alertTitle}>Action required</Text>
            </View>
            <TouchableOpacity
              style={[styles.alertCta, signing && styles.alertCtaDisabled]}
              activeOpacity={0.85}
              disabled={signing}
              onPress={confirmSign}
            >
              {signing ? (
                <ActivityIndicator color={t.colors.white} />
              ) : (
                <Text style={styles.alertCtaLabel}>Review & sign lease</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
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
    loadingBox: {
      paddingVertical: spacing.xl,
      alignItems: 'center',
    },
    errorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.error + '14',
      borderRadius: 12,
      padding: spacing.md,
    },
    errorText: { flex: 1, color: c.error, fontSize: 13 * fs },
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
    docLabel: { fontSize: 14 * fs, color: c.text },
    docMeta: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    emptyText: {
      color: c.textSecondary,
      fontSize: 13 * fs,
      padding: spacing.lg,
      textAlign: 'center',
    },
    checklistLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginTop: spacing.md,
    },
    checklistLabel: { flex: 1, fontSize: 14 * fs, color: c.text },
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
    alertCtaDisabled: { opacity: 0.7 },
    alertCtaLabel: { color: c.white, fontWeight: '600', fontSize: 14 * fs },
  });

export default LeaseDetailScreen;
