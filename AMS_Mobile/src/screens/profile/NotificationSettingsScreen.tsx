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

interface NotificationSettingsScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
}

interface Toggle {
  key: string;
  label: string;
  description: string;
  icon: string;
  tint: string;
}

const NotificationSettingsScreen: React.FC<
  NotificationSettingsScreenProps
> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);

  const GROUPS: { title: string; items: Toggle[] }[] = [
    {
      title: 'Channels',
      items: [
        {
          key: 'push',
          label: 'Push notifications',
          description: 'Allow alerts on this device',
          icon: 'phone-portrait-outline',
          tint: t.colors.primary,
        },
        {
          key: 'email',
          label: 'Email',
          description: 'Receive emails from AMS',
          icon: 'mail-outline',
          tint: t.colors.primary,
        },
        {
          key: 'sms',
          label: 'SMS',
          description: 'Critical alerts only',
          icon: 'chatbox-ellipses-outline',
          tint: t.colors.primary,
        },
      ],
    },
    {
      title: 'Topics',
      items: [
        {
          key: 'rent',
          label: 'Rent reminders',
          description: 'Upcoming dues, payment confirmations',
          icon: 'wallet-outline',
          tint: t.colors.warning,
        },
        {
          key: 'maint',
          label: 'Maintenance updates',
          description: 'Status changes on your requests',
          icon: 'construct-outline',
          tint: t.colors.primaryDark,
        },
        {
          key: 'lease',
          label: 'Lease & documents',
          description: 'Renewals, signatures required',
          icon: 'document-text-outline',
          tint: t.colors.primary,
        },
        {
          key: 'announce',
          label: 'Announcements',
          description: 'Building-wide notices',
          icon: 'megaphone-outline',
          tint: t.colors.success,
        },
      ],
    },
  ];

  const [values, setValues] = useState<Record<string, boolean>>({
    push: true,
    email: true,
    sms: false,
    rent: true,
    maint: true,
    lease: true,
    announce: false,
  });

  const set = (k: string, v: boolean) => setValues((p) => ({ ...p, [k]: v }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={t.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {GROUPS.map((g) => (
          <View key={g.title} style={{ marginBottom: spacing.lg }}>
            <Text style={styles.section}>{g.title}</Text>
            <View style={styles.card}>
              {g.items.map((it, i) => (
                <View
                  key={it.key}
                  style={[
                    styles.row,
                    i < g.items.length - 1 && styles.rowBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: it.tint + '22' },
                    ]}
                  >
                    <Ionicons name={it.icon as any} size={18} color={it.tint} />
                  </View>
                  <View style={styles.textCol}>
                    <Text style={styles.rowLabel}>{it.label}</Text>
                    <Text style={styles.rowDesc}>{it.description}</Text>
                  </View>
                  <Switch
                    value={values[it.key]}
                    onValueChange={(v) => set(it.key, v)}
                    trackColor={{
                      true: t.colors.primary,
                      false: t.colors.border,
                    }}
                    thumbColor={t.colors.white}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
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
    section: {
      fontSize: 13 * fs,
      fontWeight: '600',
      color: c.textSecondary,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textCol: { flex: 1 },
    rowLabel: { fontSize: 14 * fs, color: c.text, fontWeight: '500' },
    rowDesc: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
  });

export default NotificationSettingsScreen;
