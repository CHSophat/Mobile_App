import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import Flag, { LangCode } from '@components/common/Flag';

export type ThemeMode = 'light' | 'dark';

interface MenuItem {
  key: string;
  label: string;
  icon: any;
  tint?: string;
}

const buildMenu = (
  primary: string,
  success: string
): MenuItem[] => [
  { key: 'chatbot', label: 'AI Chatbot', icon: 'sparkles-outline', tint: '#7C3AED' },
  { key: 'themes', label: 'Themes', icon: 'color-palette-outline', tint: primary },
  { key: 'product', label: 'Product', icon: 'cube-outline', tint: success },
];

const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'kh', label: 'Khmer', native: 'ខ្មែរ' },
  { code: 'cn', label: 'Chinese', native: '中文' },
];

interface HomeSidebarProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  language: LangCode;
  onChangeLanguage: (code: LangCode) => void;
  onMenuPress: (key: string) => void;
  onProfilePress: () => void;
}

const HomeSidebar: React.FC<HomeSidebarProps> = ({
  visible,
  onClose,
  userName,
  userEmail,
  themeMode,
  onToggleTheme,
  language,
  onChangeLanguage,
  onMenuPress,
  onProfilePress,
}) => {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.82, 320);
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const MENU = buildMenu(t.colors.primary, t.colors.success);
  const slide = useRef(new Animated.Value(-drawerWidth)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: -drawerWidth,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, drawerWidth, slide, fade]);

  const initials = (userName || userEmail || 'U')
    .split(/[\s@]/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <Pressable style={styles.backdrop} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            transform: [{ translateX: slide }],
          },
        ]}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          {/* Top bar: theme toggle (left) + profile (right) */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.themeBtn}
              onPress={onToggleTheme}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={themeMode === 'dark' ? 'moon' : 'sunny'}
                size={20}
                color={
                  themeMode === 'dark' ? t.colors.primary : t.colors.warning
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileBtn}
              onPress={onProfilePress}
              activeOpacity={0.8}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.userName} numberOfLines={1}>
                  {userName}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {userEmail}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Menu */}
          <View style={styles.section}>
            {MENU.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.menuRow}
                activeOpacity={0.7}
                onPress={() => onMenuPress(item.key)}
              >
                <View
                  style={[
                    styles.menuIconWrap,
                    { backgroundColor: (item.tint ?? t.colors.primary) + '22' },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={item.tint ?? t.colors.primary}
                  />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={t.colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Language */}
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.langList}>
            {LANGUAGES.map((l) => {
              const active = language === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  style={[
                    styles.langRow,
                    active && styles.langRowActive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => onChangeLanguage(l.code)}
                >
                  <Flag code={l.code} size={26} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.langLabel}>{l.label}</Text>
                    {l.native !== l.label ? (
                      <Text style={styles.langNative}>{l.native}</Text>
                    ) : null}
                  </View>
                  {active ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={t.colors.primary}
                    />
                  ) : (
                    <View style={styles.langRadio} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ flex: 1 }} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>AMS · v1.0.0</Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number
) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    drawer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      backgroundColor: c.surface,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 2, height: 0 },
      shadowRadius: 12,
      elevation: 12,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
      gap: spacing.md,
    },
    themeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 6,
      paddingHorizontal: spacing.sm,
      borderRadius: 999,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 13 * fs, fontWeight: '700', color: c.primaryDark },
    userName: { fontSize: 14 * fs, fontWeight: '700', color: c.text },
    userEmail: { fontSize: 11 * fs, color: c.textSecondary, marginTop: 1 },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.sm,
    },
    section: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: 12,
      gap: spacing.sm,
    },
    menuIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuLabel: { flex: 1, fontSize: 14 * fs, fontWeight: '500', color: c.text },
    sectionTitle: {
      fontSize: 12 * fs,
      fontWeight: '600',
      color: c.textSecondary,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    langList: { paddingHorizontal: spacing.md },
    langRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: 12,
    },
    langRowActive: { backgroundColor: c.primarySoft },
    langLabel: { fontSize: 14 * fs, color: c.text, fontWeight: '500' },
    langNative: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 1 },
    langRadio: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      alignItems: 'center',
    },
    footerText: { color: c.textSecondary, fontSize: 11 * fs },
  });

export default HomeSidebar;
