import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';
import ShareButton from '@components/common/ShareButton';
import AsyncStateView from '@components/common/AsyncStateView';
import { ListSkeleton } from '@components/common/LoadingSkeleton';
import { usePaginatedList } from '@hooks/usePaginatedList';
import { useAppSelector } from '@store/hooks';
import {
  maintenanceServiceV2,
  type MaintenanceRequest,
  type MaintenanceStatus,
} from '@services/api/maintenanceServiceV2';
import { maintenanceRealtime } from '@services/realtime/maintenanceRealtime';
import { formatDistanceToNow } from 'date-fns';

type FilterKey = 'all' | MaintenanceStatus;

interface Props {
  navigation: { navigate: (s: string, p?: any) => void };
}

const MaintenanceListScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { t, fonts } = useT();
  const c = theme.colors;
  const fs = theme.fontScale;
  const styles = makeStyles(c, fs);
  const user = useAppSelector((s) => s.auth.user);
  const customerId = user?.id ? Number(user.id) : undefined;
  const [filter, setFilter] = useState<FilterKey>('all');

  const list = usePaginatedList<MaintenanceRequest>(
    ({ page, pageSize }) =>
      maintenanceServiceV2.list({
        page,
        pageSize,
        status: filter,
        customerId,
      }),
    [filter, customerId],
    { pageSize: 20 }
  );

  // Realtime: subscribe to status changes and merge into list.
  useEffect(() => {
    maintenanceRealtime.connect().catch(() => undefined);
    const off = maintenanceRealtime.subscribe((event) => {
      if (event.type === 'status_changed') {
        list.setItems((prev) =>
          prev.map((r) =>
            r.id === event.requestId
              ? { ...r, status: event.status, updatedAt: event.updatedAt }
              : r
          )
        );
      } else if (event.type === 'response_added') {
        list.setItems((prev) =>
          prev.map((r) =>
            r.id === event.requestId
              ? { ...r, responseNote: event.note, updatedAt: event.updatedAt }
              : r
          )
        );
      } else if (event.type === 'photo_added') {
        list.setItems((prev) =>
          prev.map((r) =>
            r.id === event.requestId
              ? {
                  ...r,
                  photoUrls: [...(r.photoUrls ?? []), event.photoUrl],
                }
              : r
          )
        );
      } else if (event.type === 'created') {
        list.setItems((prev) => [event.request, ...prev]);
      }
    });
    return () => {
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const FILTERS: { key: FilterKey; labelKey: string; icon: any; tint: string }[] = useMemo(
    () => [
      { key: 'all', labelKey: 'common.seeAll', icon: 'apps-outline', tint: c.textSecondary },
      { key: 'pending', labelKey: 'maintenance.status.pending', icon: 'time-outline', tint: c.warning },
      { key: 'in_progress', labelKey: 'maintenance.status.inProgress', icon: 'sync-outline', tint: c.primary },
      { key: 'completed', labelKey: 'maintenance.status.completed', icon: 'checkmark-done-outline', tint: c.success },
      { key: 'rejected', labelKey: 'maintenance.status.rejected', icon: 'close-circle-outline', tint: c.error },
    ],
    [c]
  );

  const statusMeta = (s: MaintenanceStatus) => {
    switch (s) {
      case 'pending':
        return { label: t('maintenance.status.pending'), color: c.warning, bg: c.warning + '22' };
      case 'in_progress':
        return { label: t('maintenance.status.inProgress'), color: c.primaryDark, bg: c.primarySoft };
      case 'completed':
        return { label: t('maintenance.status.completed'), color: c.success, bg: c.success + '22' };
      case 'rejected':
        return { label: t('maintenance.status.rejected'), color: c.error, bg: c.error + '22' };
    }
  };

  const goTo = (target: string, params?: any) => {
    const parent = (navigation as any).getParent?.();
    if (parent) parent.navigate(target, params);
    else navigation.navigate(target, params);
  };

  const ageLabel = (iso: string): string => {
    try {
      return formatDistanceToNow(new Date(iso), { addSuffix: true });
    } catch {
      return iso;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { fontFamily: fonts.bold }]}>
          {t('maintenance.title')}
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.85}
          onPress={() => goTo('NewMaintenanceRequestScreen')}
        >
          <Ionicons name="add" size={22} color={c.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={styles.tab}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={f.icon}
                  size={14}
                  color={active ? c.primary : c.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    active && styles.tabLabelActive,
                    { fontFamily: fonts.medium },
                  ]}
                  numberOfLines={1}
                >
                  {t(f.labelKey)}
                </Text>
              </View>
              <View
                style={[
                  styles.tabIndicator,
                  active && styles.tabIndicatorActive,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <AsyncStateView
        loading={list.loading && list.items.length === 0}
        loadingSkeleton={<ListSkeleton rows={4} rowHeight={88} />}
        error={list.error}
        onRetry={list.refresh}
        isEmpty={!list.loading && list.items.length === 0}
        emptyIcon="checkmark-done-outline"
        emptyTitle={t('common.emptyTitle')}
        emptySubtitle={t('common.emptySubtitle')}
      >
        <FlatList
          data={list.items}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          refreshControl={
            <RefreshControl
              refreshing={list.refreshing}
              onRefresh={list.refresh}
              tintColor={c.primary}
              colors={[c.primary]}
            />
          }
          onEndReachedThreshold={0.4}
          onEndReached={list.loadMore}
          ListFooterComponent={
            list.loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator color={c.primary} />
                <Text
                  style={{
                    color: c.textSecondary,
                    fontSize: 12 * fs,
                    fontFamily: fonts.regular,
                  }}
                >
                  {t('common.loadingMore')}
                </Text>
              </View>
            ) : !list.hasMore && list.items.length > 0 ? (
              <Text
                style={{
                  textAlign: 'center',
                  paddingVertical: spacing.lg,
                  color: c.textHint,
                  fontSize: 12 * fs,
                  fontFamily: fonts.regular,
                }}
              >
                {t('common.endOfList')}
              </Text>
            ) : null
          }
          renderItem={({ item }) => {
            const meta = statusMeta(item.status);
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => goTo('MaintenanceDetailScreen', { id: item.id })}
              >
                <View style={styles.cardHead}>
                  <Text
                    style={[styles.cardTitle, { fontFamily: fonts.medium }]}
                    numberOfLines={1}
                  >
                    {item.title || item.description}
                  </Text>
                  <View
                    style={[styles.statusPill, { backgroundColor: meta.bg }]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: meta.color, fontFamily: fonts.medium },
                      ]}
                    >
                      {meta.label}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardFoot}>
                  <Text
                    style={[styles.cardMeta, { fontFamily: fonts.regular }]}
                  >
                    #{item.id} · {ageLabel(item.updatedAt || item.createdAt)}
                  </Text>
                  <ShareButton
                    payload={{
                      kind: 'maintenance',
                      context: { title: item.title || item.description },
                    }}
                    size={18}
                  />
                </View>
                {item.responseNote ? (
                  <View
                    style={[
                      styles.responseBox,
                      { backgroundColor: c.primarySoft },
                    ]}
                  >
                    <Ionicons
                      name="chatbox-ellipses"
                      size={14}
                      color={c.primaryDark}
                    />
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.responseText,
                        { color: c.primaryDark, fontFamily: fonts.regular },
                      ]}
                    >
                      {item.responseNote}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      </AsyncStateView>
    </View>
  );
};

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
    },
    title: { fontSize: 24 * fs, color: c.text },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabBar: {
      flexDirection: 'row',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      backgroundColor: c.surface,
    },
    tab: { flex: 1, paddingTop: spacing.md, alignItems: 'center' },
    tabContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingBottom: spacing.sm,
      paddingHorizontal: 4,
    },
    tabLabel: { fontSize: 11 * fs, color: c.textSecondary },
    tabLabelActive: { color: c.primary },
    tabIndicator: {
      width: '60%',
      height: 2,
      borderRadius: 1,
      backgroundColor: 'transparent',
    },
    tabIndicatorActive: { backgroundColor: c.primary },
    listContent: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing['4xl'],
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: {
      fontSize: 15 * fs,
      color: c.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    cardFoot: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    cardMeta: { fontSize: 12 * fs, color: c.textSecondary },
    statusPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusText: { fontSize: 11 * fs },
    responseBox: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'flex-start',
      marginTop: spacing.sm,
      padding: spacing.sm,
      borderRadius: 10,
    },
    responseText: { flex: 1, fontSize: 12 * fs },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: spacing.lg,
    },
  });

export default MaintenanceListScreen;
