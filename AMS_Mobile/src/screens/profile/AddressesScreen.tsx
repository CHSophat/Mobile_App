import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';
import { useAppSelector } from '@store/hooks';
import { useApi } from '@hooks/useApi';
import AsyncStateView from '@components/common/AsyncStateView';
import {
  customerService,
  type AddressDto,
} from '@services/api/customerService';

interface Props {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
}

const AddressesScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { t, fonts } = useT();
  const c = theme.colors;
  const fs = theme.fontScale;
  const styles = makeStyles(c, fs);
  const user = useAppSelector((s) => s.auth.user);
  const customerId = user?.id;
  const [pendingId, setPendingId] = React.useState<number | null>(null);

  const addresses = useApi<AddressDto[]>(
    () => {
      if (!customerId) throw new Error('Not signed in');
      return customerService.listAddresses(customerId);
    },
    [customerId],
    { enabled: !!customerId, initialData: [] }
  );

  useFocusEffect(
    React.useCallback(() => {
      addresses.refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId])
  );

  const handleSetPrimary = async (id: number) => {
    setPendingId(id);
    try {
      await customerService.setPrimaryAddress(id);
      addresses.setData((prev) =>
        (prev ?? []).map((a) => ({ ...a, isPrimary: a.id === id }))
      );
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('errors.unknown'));
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = (a: AddressDto) => {
    Alert.alert(
      t('common.confirm'),
      `${t('common.delete')}: ${a.line1}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setPendingId(a.id);
            try {
              await customerService.deleteAddress(a.id);
              addresses.setData((prev) =>
                (prev ?? []).filter((x) => x.id !== a.id)
              );
            } catch (err: any) {
              Alert.alert(t('common.error'), err?.message || t('errors.unknown'));
            } finally {
              setPendingId(null);
            }
          },
        },
      ]
    );
  };

  const goAdd = () => navigation.navigate('AddAddressScreen');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
          {t('profile.addresses')}
        </Text>
        <TouchableOpacity style={styles.addBtn} onPress={goAdd}>
          <Ionicons name="add" size={20} color={c.white} />
        </TouchableOpacity>
      </View>

      <AsyncStateView
        loading={addresses.loading && (addresses.data?.length ?? 0) === 0}
        error={addresses.error}
        onRetry={addresses.reload}
        isEmpty={!addresses.loading && (addresses.data?.length ?? 0) === 0}
        emptyIcon="location-outline"
        emptyTitle={t('profile.addresses')}
        emptySubtitle={t('common.emptySubtitle')}
      >
        <FlatList
          data={addresses.data ?? []}
          keyExtractor={(a) => String(a.id)}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={addresses.refreshing}
              onRefresh={addresses.refresh}
              tintColor={c.primary}
              colors={[c.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item: a }) => {
            const isPending = pendingId === a.id;
            return (
              <View style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name={
                        a.label === 'Work' ? 'briefcase-outline' : 'home-outline'
                      }
                      size={18}
                      color={c.primary}
                    />
                  </View>
                  <Text
                    style={[styles.cardLabel, { fontFamily: fonts.medium }]}
                  >
                    {a.label || t('profile.addresses')}
                  </Text>
                  {a.isPrimary ? (
                    <View style={styles.primaryPill}>
                      <Text
                        style={[
                          styles.primaryPillText,
                          { fontFamily: fonts.medium },
                        ]}
                      >
                        {t('profile.defaultAddress')}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.line1, { fontFamily: fonts.regular }]}>
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ''}
                </Text>
                <Text style={[styles.line2, { fontFamily: fonts.regular }]}>
                  {[a.city, a.postalCode, a.country].filter(Boolean).join(', ')}
                </Text>
                <View style={styles.actionsRow}>
                  {!a.isPrimary ? (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleSetPrimary(a.id)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <ActivityIndicator size="small" color={c.primary} />
                      ) : (
                        <Text
                          style={[
                            styles.actionBtnLabel,
                            { fontFamily: fonts.medium },
                          ]}
                        >
                          {t('profile.defaultAddress')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      navigation.navigate('AddAddressScreen', { address: a })
                    }
                  >
                    <Ionicons name="create-outline" size={14} color={c.primary} />
                    <Text
                      style={[
                        styles.actionBtnLabel,
                        { fontFamily: fonts.medium },
                      ]}
                    >
                      {t('common.edit')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDelete(a)}
                    disabled={isPending}
                  >
                    <Ionicons name="trash-outline" size={14} color={c.error} />
                    <Text
                      style={[
                        styles.actionBtnLabel,
                        { color: c.error, fontFamily: fonts.medium },
                      ]}
                    >
                      {t('common.delete')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addCard}
              activeOpacity={0.85}
              onPress={goAdd}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={c.primary}
              />
              <Text
                style={[styles.addCardLabel, { fontFamily: fonts.medium }]}
              >
                {t('profile.addAddress')}
              </Text>
            </TouchableOpacity>
          }
        />
      </AsyncStateView>
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
    headerTitle: { fontSize: 18 * fs, color: c.text },
    addBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
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
    },
    cardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardLabel: { flex: 1, fontSize: 15 * fs, color: c.text, fontWeight: '600' },
    primaryPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      backgroundColor: c.primarySoft,
      borderRadius: 999,
    },
    primaryPillText: {
      color: c.primaryDark,
      fontSize: 11 * fs,
      fontWeight: '600',
    },
    line1: { fontSize: 14 * fs, color: c.text, marginLeft: 40 },
    line2: {
      fontSize: 13 * fs,
      color: c.textSecondary,
      marginLeft: 40,
      marginTop: 2,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.md,
      marginLeft: 40,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionBtnLabel: { color: c.primary, fontSize: 13 * fs, fontWeight: '500' },
    addCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.lg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.primary,
      borderStyle: 'dashed',
      marginTop: spacing.lg,
    },
    addCardLabel: { color: c.primary, fontWeight: '600', fontSize: 14 * fs },
  });

export default AddressesScreen;
