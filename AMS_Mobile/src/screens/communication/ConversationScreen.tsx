import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

interface ConversationScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
  route?: { params?: { id?: string } };
}

interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
}

const INITIAL: Message[] = [
  {
    id: '1',
    from: 'them',
    text: 'Hi Sopheak, just confirming — the AC technician will come tomorrow at 10am.',
    time: '10:14',
  },
  {
    id: '2',
    from: 'me',
    text: 'Thanks! I will be home.',
    time: '10:18',
  },
  {
    id: '3',
    from: 'them',
    text: 'Great. Please make sure the unit is reachable.',
    time: '10:19',
  },
];

const ConversationScreen: React.FC<ConversationScreenProps> = ({
  navigation,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), from: 'me', text, time },
    ]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const Bubble: React.FC<{ msg: Message }> = ({ msg }) => {
    const isMe = msg.from === 'me';
    return (
      <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
            {msg.text}
          </Text>
        </View>
        <Text style={styles.bubbleTime}>{msg.time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={t.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SP</Text>
          </View>
          <View>
            <Text style={styles.headerName}>Sok Pisey</Text>
            <Text style={styles.headerMeta}>Landlord · online</Text>
          </View>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="call-outline" size={22} color={t.colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <Bubble msg={item} />}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
        />

        <View style={styles.composer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={22} color={t.colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor={t.colors.textHint}
            style={styles.input}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
            disabled={!draft.trim()}
            onPress={send}
          >
            <Ionicons name="send" size={18} color={t.colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      backgroundColor: c.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerCenter: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingLeft: spacing.sm,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 12 * fs, fontWeight: '700', color: c.primaryDark },
    headerName: { fontSize: 15 * fs, fontWeight: '600', color: c.text },
    headerMeta: { fontSize: 11 * fs, color: c.success, marginTop: 1 },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      gap: spacing.sm,
    },
    bubbleRow: { alignItems: 'flex-start', maxWidth: '80%' },
    bubbleRowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    bubble: { padding: spacing.md, borderRadius: 16 },
    bubbleThem: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 4,
      borderWidth: 1,
      borderColor: c.border,
    },
    bubbleMe: {
      backgroundColor: c.primary,
      borderTopRightRadius: 4,
    },
    bubbleText: { fontSize: 14 * fs, color: c.text, lineHeight: 19 },
    bubbleTextMe: { color: c.white },
    bubbleTime: { fontSize: 10 * fs, color: c.textSecondary, marginTop: 2 },
    composer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    attachBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    input: {
      flex: 1,
      maxHeight: 100,
      fontSize: 15 * fs,
      color: c.text,
      backgroundColor: c.background,
      borderRadius: 18,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    sendBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    sendBtnDisabled: { opacity: 0.4 },
  });

export default ConversationScreen;
