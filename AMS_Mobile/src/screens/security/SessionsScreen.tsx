import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

interface SessionsScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
}

type DeviceKind = 'phone' | 'tablet' | 'laptop' | 'web';

interface Session {
  id: string;
  device: string;
  os: string;
  kind: DeviceKind;
  location: string;
  lastActive: string;
  ipAddress: string;
  current?: boolean;
}

const INITIAL_SESSIONS: Session[] = [
  {
    id: '1',
    device: 'iPhone 15 Pro',
    os: 'iOS 17.4',
    kind: 'phone',
    location: 'Phnom Penh, Cambodia',
    lastActive: 'Active now',
    ipAddress: '203.144.12.5',
    current: true,
  },
  {
    id: '2',
    device: 'MacBook Air',
    os: 'macOS · Chrome 124',
    kind: 'laptop',
    location: 'Phnom Penh, Cambodia',
    lastActive: '12 minutes ago',
    ipAddress: '203.144.12.5',
  },
  {
    id: '3',
    device: 'Pixel 8',
    os: 'Android 14',
    kind: 'phone',
    location: 'Siem Reap, Cambodia',
    lastActive: '2 days ago',
    ipAddress: '157.245.78.9',
  },
  {
    id: '4',
    device: 'iPad Air',
    os: 'iPadOS 17.4',
    kind: 'tablet',
    location: 'Phnom Penh, Cambodia',
    lastActive: '5 days ago',
    ipAddress: '203.144.12.5',
  },
];

const iconFor = (k: DeviceKind): any => {
  if (k === 'phone') return 'phone-portrait-outline';
  if (k === 'tablet') return 'tablet-portrait-outline';
  if (k === 'laptop') return 'laptop-outline';
  return 'globe-outline';
};

const SessionsScreen: React.FC<SessionsScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);

  const revoke = (id: string) => {
    Alert.alert(
      'Sign out this device?',
      'You will need to sign in again on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => setSessions((arr) => arr.filter((s) => s.id !== id)),
        },
      ]
    );
  };

  const revokeAllOther = () => {
    Alert.alert(
      'Sign out everywhere else?',
      'All other devices will be signed out. This device stays signed in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out others',
          style: 'destructive',
          onPress: () => setSessions((arr) => arr.filter((s) => s.current)),
        },
      ]
    );
  };

  const current = sessions.find((s) => s.current);
  const others = sessions.filter((s) => !s.current);

  const SessionCard: React.FC<{
    session: Session;
    onRevoke: (() => void) | null;
  }> = ({ session, onRevoke }) => (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View
          style={[
            styles.iconWrap,
            session.current
              ? { backgroundColor: t.colors.primarySoft }
              : { backgroundColor: t.colors.divider },
          ]}
        >
          <Ionicons
            name={iconFor(session.kind)}
            size={22}
            color={session.current ? t.colors.primary : t.colors.textSecondary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.deviceRow}>
            <Text style={styles.deviceName}>{session.device}</Text>
            {session.current ? (
              <View style={styles.currentPill}>
                <Text style={styles.currentPillText}>This device</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.deviceMeta}>{session.os}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={14} color={t.colors.textSecondary} />
        <Text style={styles.metaText}>{session.location}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={14} color={t.colors.textSecondary} />
        <Text style={styles.metaText}>{session.lastActive}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="wifi-outline" size={14} color={t.colors.textSecondary} />
        <Text style={styles.metaText}>IP {session.ipAddress}</Text>
      </View>

      {onRevoke ? (
        <TouchableOpacity
          style={styles.revokeBtn}
          activeOpacity={0.85}
          onPress={onRevoke}
        >
          <Ionicons name="log-out-outline" size={16} color={t.colors.error} />
          <Text style={styles.revokeBtnLabel}>Sign out</Text>
        </TouchableOpacity>
      ) : null}
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
        <Text style={styles.headerTitle}>Active sessions</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {current ? (
          <>
            <Text style={styles.section}>This device</Text>
            <SessionCard session={current} onRevoke={null} />
          </>
        ) : null}

        {others.length > 0 ? (
          <>
            <View style={styles.otherHead}>
              <Text style={styles.section}>Other devices</Text>
              <TouchableOpacity onPress={revokeAllOther}>
                <Text style={styles.signOutAll}>Sign out all</Text>
              </TouchableOpacity>
            </View>
            {others.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onRevoke={() => revoke(s.id)}
              />
            ))}
          </>
        ) : (
          <View style={styles.empty}>
            <Ionicons
              name="shield-checkmark-outline"
              size={36}
              color={t.colors.success}
            />
            <Text style={styles.emptyText}>No other active sessions</Text>
          </View>
        )}
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
    otherHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    signOutAll: {
      color: c.error,
      fontSize: 13 * fs,
      fontWeight: '600',
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
      marginBottom: spacing.md,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    deviceName: {
      fontSize: 15 * fs,
      fontWeight: '600',
      color: c.text,
      flexShrink: 1,
    },
    deviceMeta: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    currentPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: c.primarySoft,
    },
    currentPillText: {
      color: c.primaryDark,
      fontSize: 11 * fs,
      fontWeight: '600',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    metaText: { fontSize: 13 * fs, color: c.textSecondary },
    revokeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      backgroundColor: c.error + '15',
      marginTop: spacing.md,
    },
    revokeBtnLabel: { color: c.error, fontSize: 13 * fs, fontWeight: '600' },
    empty: {
      alignItems: 'center',
      paddingVertical: spacing['4xl'],
      gap: spacing.sm,
    },
    emptyText: { color: c.textSecondary, fontSize: 14 * fs },
  });

export default SessionsScreen;
