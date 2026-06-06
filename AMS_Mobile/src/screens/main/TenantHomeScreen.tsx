import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';
import { useAppSelector } from '@store/hooks';
import RentDueCard from '@components/payments/RentDueCard';
import OutstandingCard from '@components/payments/OutstandingCard';
import {
  announcementService,
  Announcement,
} from '@services/api/announcementService';
import { invoiceService, Invoice } from '@services/api/invoiceService';
import { customerService } from '@services/api/customerService';
import { paymentServiceV2 } from '@services/api/paymentServiceV2';
import { maintenanceServiceV2 } from '@services/api/maintenanceServiceV2';

interface TenantHomeScreenProps {
  navigation: {
    navigate: (s: string, p?: any) => void;
  };
}

const QUICK_ACTIONS = [
  { key: 'report', label: 'Report', icon: 'construct-outline', target: 'NewMaintenanceRequestScreen' },
  { key: 'lease', label: 'Lease', icon: 'document-text-outline', target: 'LeaseDetailScreen' },
  { key: 'msg', label: 'Message', icon: 'chatbubbles-outline', target: 'InboxScreen' },
];

// ----- view-model types built from the API responses -----
interface RentDueVM {
  amount: number;
  currency: string;
  dueDate: string;
  daysLeft: number;
  invoiceNumber: string;
}
interface OutstandingVM {
  total: number;
  currency: string;
  invoiceNumber?: string;
  items: { id: string; label: string; amount: number }[];
}
interface ActivityVM {
  id: string;
  icon: string;
  text: string;
  onPress?: () => void;
}

// ----- small formatting helpers -----
const currencySymbol = (code?: string): string =>
  !code || code === 'USD' ? '$' : code === 'KHR' ? '៛' : `${code} `;

const daysUntil = (iso: string): number =>
  Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);

const shortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const invoiceBalance = (inv: Invoice): number =>
  Math.max(0, (inv.total ?? 0) - (inv.amountPaid ?? 0));

const titleCase = (s: string): string =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const TenantHomeScreen: React.FC<TenantHomeScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const { t: tr, fonts } = useT();
  const styles = makeStyles(t.colors, t.fontScale);

  const user = useAppSelector((s) => s.auth.user);
  // The customer-scoped endpoints key off a numeric customer id. We treat the
  // authenticated user's id as the customer id; non-numeric (e.g. demo) skips fetch.
  const customerId = Number(user?.id);
  const hasCustomer = Number.isFinite(customerId) && customerId > 0;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [displayName, setDisplayName] = useState<string>('');
  const [unitLabel, setUnitLabel] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string | null>(null);
  const [rentDue, setRentDue] = useState<RentDueVM | null>(null);
  const [outstanding, setOutstanding] = useState<OutstandingVM | null>(null);
  const [activity, setActivity] = useState<ActivityVM[]>([]);

  const goTo = (target: string, params?: any) => {
    const parent = (navigation as any).getParent?.();
    if (parent) parent.navigate(target, params);
    else navigation.navigate(target, params);
  };

  const goPay = () =>
    (navigation as any).jumpTo?.('PaymentsTab') ?? goTo('PaymentsTab');

  const load = useCallback(async () => {
    if (!hasCustomer) {
      setLoading(false);
      return;
    }

    // Each section is independent — one failing must not blank the whole screen.
    const [profileRes, leasesRes, invoicesRes, announcementsRes, maintRes, paymentsRes] =
      await Promise.allSettled([
        customerService.getProfile(customerId),
        customerService.getLeaseHistory(customerId),
        invoiceService.outstanding(customerId),
        announcementService.list(),
        maintenanceServiceV2.list({ customerId, pageSize: 3 }),
        paymentServiceV2.list({ customerId, limit: 3 }),
      ]);

    // --- greeting / unit / property ---
    if (profileRes.status === 'fulfilled') {
      const p = profileRes.value;
      setDisplayName(p.firstName || p.lastName || (p.email ?? '').split('@')[0]);
    }
    if (leasesRes.status === 'fulfilled') {
      const active =
        leasesRes.value.find((l) => l.status === 'active') ?? leasesRes.value[0];
      setUnitLabel(active?.unitLabel ?? null);
      setPropertyName(active?.propertyName ?? null);
    }

    // --- rent due (soonest) + outstanding (the rest) ---
    if (invoicesRes.status === 'fulfilled') {
      const unpaid = [...invoicesRes.value]
        .filter((inv) => invoiceBalance(inv) > 0)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      const [next, ...rest] = unpaid;
      if (next) {
        setRentDue({
          amount: invoiceBalance(next),
          currency: currencySymbol(next.currency),
          dueDate: shortDate(next.dueDate),
          daysLeft: daysUntil(next.dueDate),
          invoiceNumber: next.invoiceNumber,
        });
      } else {
        setRentDue(null);
      }

      setOutstanding({
        total: rest.reduce((sum, inv) => sum + invoiceBalance(inv), 0),
        currency: currencySymbol(rest[0]?.currency ?? next?.currency),
        invoiceNumber: rest[0]?.invoiceNumber,
        items: rest.map((inv) => ({
          id: String(inv.id),
          label: inv.notes?.trim() || `Invoice ${inv.invoiceNumber}`,
          amount: invoiceBalance(inv),
        })),
      });
    }

    // --- recent activity (announcement + maintenance + payments) ---
    const acts: ActivityVM[] = [];

    if (announcementsRes.status === 'fulfilled' && announcementsRes.value?.length) {
      const newest = [...announcementsRes.value].sort(
        (a, b) =>
          new Date(b.sentAt ?? b.createdAt).getTime() -
          new Date(a.sentAt ?? a.createdAt).getTime()
      )[0] as Announcement;
      acts.push({
        id: `ann-${newest.id}`,
        icon: 'megaphone-outline',
        text: newest.title,
        onPress: () =>
          goTo('AnnouncementDetailScreen', { id: newest.id, announcement: newest }),
      });
    }

    if (maintRes.status === 'fulfilled') {
      maintRes.value.items.slice(0, 2).forEach((m) =>
        acts.push({
          id: `mnt-${m.id}`,
          icon: 'construct-outline',
          text: `${m.title || 'Maintenance'} #${m.id} — ${titleCase(m.status)}`,
          onPress: () => goTo('MaintenanceDetailScreen', { id: m.id }),
        })
      );
    }

    if (paymentsRes.status === 'fulfilled') {
      paymentsRes.value.slice(0, 2).forEach((p) =>
        acts.push({
          id: `pay-${p.id}`,
          icon: 'cash-outline',
          text: `Payment ${titleCase(p.status)} — ${shortDate(p.paidAt ?? p.createdAt)}`,
        })
      );
    }

    setActivity(acts.slice(0, 4));
  }, [customerId, hasCustomer]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    load().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  const subtitle = [unitLabel, propertyName].filter(Boolean).join(' · ');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.primary} />
        }
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.greetingRow}>
              <Text style={[styles.greeting, { fontFamily: fonts.bold }]}>
                {displayName
                  ? tr('home.greeting', { name: displayName })
                  : tr('home.greeting', { name: '' }).trim()}
              </Text>
              <Ionicons
                name="hand-left-outline"
                size={20}
                color={t.colors.warning}
                style={styles.waveIcon}
              />
            </View>
            {subtitle ? (
              <Text style={[styles.subtitle, { fontFamily: fonts.regular }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            color={t.colors.primary}
            style={{ marginTop: spacing['4xl'] }}
          />
        ) : (
          <>
            {rentDue ? (
              <>
                <RentDueCard
                  amount={rentDue.amount}
                  currency={rentDue.currency}
                  dueDate={rentDue.dueDate}
                  daysLeft={rentDue.daysLeft}
                  invoiceNumber={rentDue.invoiceNumber}
                  onPayPress={goPay}
                />
                <View style={{ height: spacing.md }} />
              </>
            ) : null}

            {outstanding ? (
              <OutstandingCard
                total={outstanding.total}
                currency={outstanding.currency}
                items={outstanding.items}
                invoiceNumber={outstanding.invoiceNumber}
                onViewPress={goPay}
                onPayPress={goPay}
              />
            ) : null}

            <Text style={[styles.sectionTitle, { fontFamily: fonts.medium }]}>
              {tr('home.quickActions')}
            </Text>
            <View style={styles.quickRow}>
              {QUICK_ACTIONS.map((a) => (
                <TouchableOpacity
                  key={a.key}
                  style={styles.quickCard}
                  activeOpacity={0.85}
                  onPress={() => goTo(a.target)}
                >
                  <View style={styles.quickIconWrap}>
                    <Ionicons name={a.icon as any} size={22} color={t.colors.primary} />
                  </View>
                  <Text style={[styles.quickLabel, { fontFamily: fonts.regular }]}>
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { fontFamily: fonts.medium }]}>
              {tr('home.recentActivity')}
            </Text>
            <View style={styles.activityCard}>
              {activity.length ? (
                activity.map((a, i) => {
                  const Row = a.onPress ? TouchableOpacity : View;
                  return (
                    <Row
                      key={a.id}
                      activeOpacity={0.7}
                      onPress={a.onPress}
                      style={[
                        styles.activityRow,
                        i < activity.length - 1 && styles.activityRowBorder,
                      ]}
                    >
                      <Ionicons
                        name={a.icon as any}
                        size={18}
                        color={t.colors.primaryDark}
                      />
                      <Text style={styles.activityText} numberOfLines={1}>
                        {a.text}
                      </Text>
                      {a.onPress ? (
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={t.colors.textSecondary}
                        />
                      ) : null}
                    </Row>
                  );
                })
              ) : (
                <View style={styles.activityRow}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={t.colors.textSecondary}
                  />
                  <Text style={[styles.activityText, { color: t.colors.textSecondary }]}>
                    {tr('common.noData')}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
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
    scroll: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing['4xl'],
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    greetingRow: { flexDirection: 'row', alignItems: 'center' },
    greeting: { fontSize: 22 * fs, fontWeight: '700', color: c.text },
    waveIcon: { marginLeft: spacing.xs },
    subtitle: { fontSize: 13 * fs, color: c.textSecondary, marginTop: 2 },
    sectionTitle: {
      fontSize: 15 * fs,
      fontWeight: '600',
      color: c.text,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    quickRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    quickCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 14,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    quickIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    quickLabel: { fontSize: 13 * fs, color: c.text, fontWeight: '500' },
    activityCard: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
    },
    activityRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    activityText: { flex: 1, fontSize: 14 * fs, color: c.text },
  });

export default TenantHomeScreen;
