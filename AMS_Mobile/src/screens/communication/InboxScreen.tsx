import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { conversationService, Conversation } from '@services/api/conversationService';
import { announcementService, Announcement } from '@services/api/announcementService';

interface InboxScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
}

type Tab = 'messages' | 'announcements';

interface Message {
  id: string;
  kind: 'message' | 'announcement' | 'system';
  title: string;
  preview: string;
  time: string;
  unread: number;
}

const InboxScreen: React.FC<InboxScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const [tab, setTab] = useState<Tab>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadData = async () => {
        setLoading(true);
        try {
          const [convs, anns] = await Promise.all([
            conversationService.list(),
            announcementService.list(),
          ]);
          if (active) {
            setConversations(convs || []);
            setAnnouncements(anns || []);
          }
        } catch (err) {
          console.error('Failed to load inbox data:', err);
        } finally {
          if (active) setLoading(false);
        }
      };
      loadData();
      return () => {
        active = false;
      };
    }, [])
  );

  const kindMeta = (kind: Message['kind']) => {
    if (kind === 'system')
      return { icon: 'notifications-outline', tint: t.colors.warning };
    if (kind === 'announcement')
      return { icon: 'megaphone-outline', tint: t.colors.success };
    return { icon: 'chatbubble-ellipses-outline', tint: t.colors.primary };
  };

  const transformedConversations: Message[] = conversations.map((c) => ({
    id: String(c.id),
    kind: 'message',
    title: c.subject || `Conversation #${c.id}`,
    preview: c.lastMessageAt
      ? `Last message: ${new Date(c.lastMessageAt).toLocaleDateString()}`
      : 'No messages yet',
    time: c.lastMessageAt
      ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    unread: 0,
  }));

  const transformedAnnouncements: Message[] = announcements.map((a) => ({
    id: String(a.id),
    kind: 'announcement',
    title: a.title,
    preview: a.body,
    time: a.sentAt
      ? new Date(a.sentAt).toLocaleDateString()
      : new Date(a.createdAt).toLocaleDateString(),
    unread: 0,
  }));

  const data = tab === 'messages' ? transformedConversations : transformedAnnouncements;

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
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="search-outline" size={22} color={t.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setTab('messages')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabLabel,
              tab === 'messages' && styles.tabLabelActive,
            ]}
          >
            Messages
          </Text>
          <View
            style={[
              styles.tabIndicator,
              tab === 'messages' && styles.tabIndicatorActive,
            ]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setTab('announcements')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabLabel,
              tab === 'announcements' && styles.tabLabelActive,
            ]}
          >
            Announcements
          </Text>
          <View
            style={[
              styles.tabIndicator,
              tab === 'announcements' && styles.tabIndicatorActive,
            ]}
          />
        </TouchableOpacity>
      </View>

      {loading && data.length === 0 ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={t.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => {
            const meta = kindMeta(item.kind);
            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('ConversationScreen', { id: item.id })
                }
              >
                <View
                  style={[styles.iconWrap, { backgroundColor: meta.tint + '22' }]}
                >
                  <Ionicons name={meta.icon as any} size={20} color={meta.tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.rowTitle,
                        item.unread > 0 && styles.rowTitleUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.rowTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.rowPreview} numberOfLines={2}>
                    {item.preview}
                  </Text>
                </View>
                {item.unread > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="mail-open-outline"
                size={36}
                color={t.colors.textHint}
              />
              <Text style={styles.emptyText}>Nothing here yet</Text>
            </View>
          }
        />
      )}
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
    tabBar: {
      flexDirection: 'row',
      marginTop: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      backgroundColor: c.surface,
    },
    tab: { flex: 1, paddingTop: spacing.md, alignItems: 'center' },
    tabLabel: {
      fontSize: 13 * fs,
      color: c.textSecondary,
      fontWeight: '500',
      paddingBottom: spacing.sm,
    },
    tabLabelActive: { color: c.primary, fontWeight: '600' },
    tabIndicator: {
      width: '60%',
      height: 2,
      borderRadius: 1,
      backgroundColor: 'transparent',
    },
    tabIndicatorActive: { backgroundColor: c.primary },
    listContent: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing['4xl'],
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowTitle: {
      flex: 1,
      fontSize: 14 * fs,
      color: c.text,
      fontWeight: '500',
      marginRight: spacing.sm,
    },
    rowTitleUnread: { fontWeight: '700' },
    rowTime: { fontSize: 12 * fs, color: c.textSecondary },
    rowPreview: { fontSize: 13 * fs, color: c.textSecondary, marginTop: 2 },
    unreadBadge: {
      minWidth: 20,
      height: 20,
      paddingHorizontal: 6,
      borderRadius: 10,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.xs,
    },
    unreadText: { color: c.white, fontSize: 11 * fs, fontWeight: '700' },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border },
    empty: {
      alignItems: 'center',
      paddingVertical: spacing['4xl'],
      gap: spacing.sm,
    },
    emptyText: { color: c.textSecondary, fontSize: 14 * fs },
  });

export default InboxScreen;
