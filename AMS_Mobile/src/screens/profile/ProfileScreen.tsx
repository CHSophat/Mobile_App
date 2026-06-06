import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { logout } from '@store/slices/authSlice';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProfileScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
}

interface MenuItem {
  key: string;
  labelKey: string;
  icon: string;
  target?: string;
  danger?: boolean;
  children?: MenuItem[];
}

const MENU: MenuItem[] = [
  { key: 'info', labelKey: 'profile.personalInfo', icon: 'person-outline', target: 'EditProfileScreen' },
  { key: 'addr', labelKey: 'profile.addresses', icon: 'location-outline', target: 'AddressesScreen' },
  { key: 'lease', labelKey: 'profile.title', icon: 'document-text-outline', target: 'MyLeasesScreen' },
  { key: 'checklist', labelKey: 'checklist.title', icon: 'checkbox-outline', target: 'MoveInChecklistScreen' },
  {
    key: 'security',
    labelKey: 'profile.security',
    icon: 'shield-checkmark-outline',
    children: [
      { key: 'pwd', labelKey: 'profile.changePassword', icon: 'key-outline', target: 'ChangePasswordScreen' },
      { key: '2fa', labelKey: 'profile.security', icon: 'lock-closed-outline', target: 'TwoFactorSetupScreen' },
      { key: 'sessions', labelKey: 'profile.security', icon: 'phone-portrait-outline', target: 'SessionsScreen' },
    ],
  },
  { key: 'lang', labelKey: 'profile.language', icon: 'language-outline', target: 'LanguageScreen' },
  { key: 'notif', labelKey: 'profile.notifications', icon: 'notifications-outline', target: 'NotificationSettingsScreen' },
  { key: 'help', labelKey: 'profile.helpSupport', icon: 'help-circle-outline', target: 'HelpSupportScreen' },
];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const { t: tr, fonts } = useT();
  const styles = makeStyles(t.colors, t.fontScale, fonts.regular);
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const confirmLogout = () => {
    setLogoutOpen(false);
    dispatch(logout());
  };

  const toggleSecurity = () => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // LayoutAnimation may no-op on the new architecture — state still toggles below.
    }
    setSecurityOpen((v) => !v);
  };

  const goTo = (target?: string) => {
    if (!target) return;
    const parent = (navigation as any).getParent?.();
    if (parent) parent.navigate(target);
    else navigation.navigate(target);
  };

  const initials = (user?.displayName ?? user?.email ?? 'U')
    .split(/[\s@]/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  const TopRow: React.FC<{ item: MenuItem; onPress: () => void }> = ({
    item,
    onPress,
  }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!item.target}
    >
      <View style={styles.rowIconWrap}>
        <Ionicons name={item.icon as any} size={18} color={t.colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { fontFamily: fonts.medium }]}>
        {tr(item.labelKey)}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={t.colors.textSecondary}
      />
    </TouchableOpacity>
  );

  const NestedRow: React.FC<{ item: MenuItem; isLast: boolean }> = ({
    item,
    isLast,
  }) => (
    <TouchableOpacity
      style={[styles.nestedRow, !isLast && styles.nestedRowBorder]}
      activeOpacity={0.7}
      onPress={() => goTo(item.target)}
    >
      <View style={styles.nestedIconWrap}>
        <Ionicons name={item.icon as any} size={16} color={t.colors.primaryDark} />
      </View>
      <Text style={[styles.nestedLabel, { fontFamily: fonts.regular }]}>
        {tr(item.labelKey)}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={t.colors.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'U'}</Text>
          </View>
          <Text style={styles.name}>
            {user?.displayName ?? 'Sopheak Chhun'}
          </Text>
          <Text style={styles.meta}>
            {user?.email ?? 'sopheak@example.com'}
            {user?.phone ? ` · ${user.phone}` : ' · +855 12 …'}
          </Text>
        </View>

        {MENU.map((item) =>
          item.children ? (
            <View key={item.key} style={styles.group}>
              <TouchableOpacity
                style={[
                  styles.row,
                  securityOpen && styles.rowActive,
                  securityOpen && styles.rowAttachedToList,
                ]}
                activeOpacity={0.7}
                onPress={toggleSecurity}
              >
                <View
                  style={[
                    styles.rowIconWrap,
                    securityOpen && styles.rowIconWrapActive,
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={
                      securityOpen ? t.colors.white : t.colors.primary
                    }
                  />
                </View>
                <Text style={[styles.rowLabel, { fontFamily: fonts.medium }]}>
                  {tr(item.labelKey)}
                </Text>
                {securityOpen ? (
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>
                      {item.children.length}
                    </Text>
                  </View>
                ) : null}
                <Ionicons
                  name={securityOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={t.colors.textSecondary}
                />
              </TouchableOpacity>

              {securityOpen ? (
                <View style={styles.accordionList}>
                  {item.children.map((child, i) => (
                    <NestedRow
                      key={child.key}
                      item={child}
                      isLast={i === item.children!.length - 1}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <TopRow
              key={item.key}
              item={item}
              onPress={() => goTo(item.target)}
            />
          )
        )}

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.85}
          onPress={() => setLogoutOpen(true)}
        >
          <Ionicons name="log-out-outline" size={18} color={t.colors.error} />
          <Text style={[styles.logoutLabel, { fontFamily: fonts.medium }]}>
            {tr('auth.signOut')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={logoutOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setLogoutOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setLogoutOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.popup}>
            <View style={styles.popupIconWrap}>
              <Ionicons
                name="log-out-outline"
                size={32}
                color={t.colors.error}
              />
            </View>
            <Text style={styles.popupTitle}>Log out?</Text>
            <Text style={styles.popupMessage}>
              Are you sure you want to log out of your account? You'll need to
              sign in again to access your dashboard, payments, and maintenance
              requests.
            </Text>

            <View style={styles.popupActions}>
              <TouchableOpacity
                style={[styles.popupBtn, styles.popupBtnCancel]}
                activeOpacity={0.85}
                onPress={() => setLogoutOpen(false)}
              >
                <Text style={styles.popupBtnCancelLabel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.popupBtn, styles.popupBtnConfirm]}
                activeOpacity={0.85}
                onPress={confirmLogout}
              >
                <Text style={styles.popupBtnConfirmLabel}>OK, log out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number,
  fontFamily: string
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scroll: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing['4xl'],
    },
    identity: { alignItems: 'center', marginBottom: spacing.xl },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    avatarText: { fontSize: 28 * fs, fontWeight: '700', color: c.primaryDark },
    name: { fontSize: 18 * fs, fontWeight: '700', color: c.text },
    meta: { fontSize: 13 * fs, color: c.textSecondary, marginTop: 2 },
    group: { marginBottom: spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 14,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    rowActive: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    rowAttachedToList: {
      marginBottom: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomWidth: 0,
    },
    rowIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowIconWrapActive: { backgroundColor: c.primary },
    rowLabel: { flex: 1, fontSize: 14 * fs, color: c.text, fontWeight: '500' },
    statusPill: {
      minWidth: 22,
      height: 22,
      paddingHorizontal: 6,
      borderRadius: 11,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusPillText: { color: c.white, fontSize: 11 * fs, fontWeight: '700' },

    accordionList: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: c.primary,
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
      marginBottom: spacing.sm,
      overflow: 'hidden',
    },
    nestedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingLeft: spacing.lg + 8,
      paddingRight: spacing.lg,
      borderLeftWidth: 3,
      borderLeftColor: c.primary,
    },
    nestedRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    nestedIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nestedLabel: {
      flex: 1,
      fontSize: 13 * fs,
      color: c.text,
      fontWeight: '500',
    },

    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.lg,
      marginTop: spacing.md,
    },
    logoutLabel: { color: c.error, fontWeight: '600', fontSize: 15 * fs },

    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    popup: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: c.surface,
      borderRadius: 20,
      paddingTop: spacing.xl,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 8 },
      }),
    },
    popupIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: c.error + '1F',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    popupTitle: {
      fontSize: 18 * fs,
      fontWeight: '700',
      color: c.text,
      marginBottom: spacing.xs,
    },
    popupMessage: {
      fontSize: 13 * fs,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: spacing.lg,
    },
    popupActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      width: '100%',
    },
    popupBtn: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    popupBtnCancel: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    popupBtnCancelLabel: { color: c.text, fontWeight: '600', fontSize: 14 * fs },
    popupBtnConfirm: { backgroundColor: c.error },
    popupBtnConfirmLabel: { color: c.white, fontWeight: '700', fontSize: 14 * fs },
  });

export default ProfileScreen;
