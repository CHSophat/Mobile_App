import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  announcementService,
  Announcement,
  AnnouncementDelivery,
} from '@services/api/announcementService';

interface AnnouncementDetailScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
  route?: { params?: { id?: number | string; announcement?: Announcement } };
}

const STAFF_ROLES = ['admin', 'owner', 'staff', 'manager'];

const fmtDateTime = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

const AnnouncementDetailScreen: React.FC<AnnouncementDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const { user } = useAuth();
  const isStaff = (user?.roles ?? []).some((r) =>
    STAFF_ROLES.includes(r.toLowerCase())
  );

  const id = route?.params?.id;
  const [announcement, setAnnouncement] = useState<Announcement | undefined>(
    route?.params?.announcement
  );
  const [deliveries, setDeliveries] = useState<AnnouncementDelivery[]>([]);
  const [loading, setLoading] = useState(!route?.params?.announcement);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (id == null) {
      setError('Missing announcement reference.');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const ann = await announcementService.byId(id);
      setAnnouncement(ann);
      if (isStaff) {
        try {
          setDeliveries(await announcementService.getDeliveries(id));
        } catch {
          // Deliveries are best-effort; ignore if the role can't read them.
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load announcement.');
    } finally {
      setLoading(false);
    }
  }, [id, isStaff]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSendNow = () => {
    if (id == null) return;
    Alert.alert(
      'Send now',
      'Publish this announcement to all recipients immediately?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setSending(true);
            try {
              const updated = await announcementService.sendNow(id);
              setAnnouncement(updated);
              await load();
              Alert.alert('Sent', 'The announcement has been published.');
            } catch (e: any) {
              Alert.alert('Send failed', e?.message || 'Please try again.');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  const statusTint =
    announcement?.status === 'sent'
      ? t.colors.success
      : announcement?.status === 'scheduled'
      ? t.colors.warning
      : t.colors.textSecondary;

  const readCount = deliveries.filter((d) => d.status === 'read').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={t.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcement</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={40} color={t.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : announcement ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {announcement.coverUrl ? (
            <Image
              source={{ uri: announcement.coverUrl }}
              style={styles.cover}
              resizeMode="cover"
            />
          ) : null}

          <View style={styles.metaRow}>
            <View style={[styles.pill, { backgroundColor: statusTint + '22' }]}>
              <View style={[styles.dot, { backgroundColor: statusTint }]} />
              <Text style={[styles.pillText, { color: statusTint }]}>
                {announcement.status}
              </Text>
            </View>
            <View style={styles.audiencePill}>
              <Ionicons
                name="people-outline"
                size={12}
                color={t.colors.textSecondary}
              />
              <Text style={styles.audienceText}>{announcement.audience}</Text>
            </View>
          </View>

          <Text style={styles.title}>{announcement.title}</Text>
          <Text style={styles.date}>
            {fmtDateTime(announcement.sentAt) ??
              (announcement.publishAt
                ? `Scheduled for ${fmtDateTime(announcement.publishAt)}`
                : fmtDateTime(announcement.createdAt))}
          </Text>

          <Text style={styles.body}>{announcement.body}</Text>

          {isStaff ? (
            <View style={styles.deliveriesCard}>
              <Text style={styles.section}>Delivery status</Text>
              {deliveries.length === 0 ? (
                <Text style={styles.emptyText}>No delivery records yet.</Text>
              ) : (
                <>
                  <Text style={styles.deliverySummary}>
                    {readCount}/{deliveries.length} read
                  </Text>
                  {deliveries.slice(0, 20).map((d) => (
                    <View key={d.id} style={styles.deliveryRow}>
                      <Text style={styles.deliveryName} numberOfLines={1}>
                        {d.recipientName || `Recipient #${d.recipientId}`}
                      </Text>
                      <Text style={styles.deliveryChannel}>{d.channel}</Text>
                      <Text style={styles.deliveryStatus}>{d.status}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          ) : null}

          {isStaff && announcement.status !== 'sent' ? (
            <TouchableOpacity
              style={[styles.cta, sending && styles.ctaDisabled]}
              activeOpacity={0.85}
              disabled={sending}
              onPress={onSendNow}
            >
              {sending ? (
                <ActivityIndicator color={t.colors.white} />
              ) : (
                <>
                  <Ionicons name="send" size={18} color={t.colors.white} />
                  <Text style={styles.ctaLabel}>Send now</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
};

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      padding: spacing.xl,
    },
    errorText: { color: c.error, fontSize: 14 * fs, textAlign: 'center' },
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
      paddingTop: spacing.lg,
      paddingBottom: spacing['4xl'],
    },
    cover: {
      width: '100%',
      height: 180,
      borderRadius: 14,
      marginBottom: spacing.lg,
      backgroundColor: c.surface,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 999,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    pillText: { fontSize: 11 * fs, fontWeight: '600', textTransform: 'capitalize' },
    audiencePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    audienceText: {
      fontSize: 11 * fs,
      color: c.textSecondary,
      textTransform: 'capitalize',
    },
    title: {
      fontSize: 22 * fs,
      fontWeight: '700',
      color: c.text,
      marginTop: spacing.xs,
    },
    date: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 4 },
    body: {
      fontSize: 15 * fs,
      color: c.text,
      lineHeight: 22 * fs,
      marginTop: spacing.lg,
    },
    section: {
      fontSize: 15 * fs,
      fontWeight: '600',
      color: c.text,
      marginBottom: spacing.sm,
    },
    deliveriesCard: {
      marginTop: spacing.xl,
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
    },
    deliverySummary: {
      fontSize: 13 * fs,
      color: c.primary,
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    deliveryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 6,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    deliveryName: { flex: 1, fontSize: 13 * fs, color: c.text },
    deliveryChannel: { fontSize: 11 * fs, color: c.textSecondary },
    deliveryStatus: {
      fontSize: 11 * fs,
      color: c.textSecondary,
      textTransform: 'capitalize',
      minWidth: 56,
      textAlign: 'right',
    },
    emptyText: { fontSize: 13 * fs, color: c.textSecondary },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      marginTop: spacing.xl,
    },
    ctaDisabled: { opacity: 0.7 },
    ctaLabel: { color: c.white, fontSize: 16 * fs, fontWeight: '600' },
  });

export default AnnouncementDetailScreen;
