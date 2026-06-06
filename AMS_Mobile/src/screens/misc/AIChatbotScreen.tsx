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

interface AIChatbotScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
}

interface Msg {
  id: string;
  from: 'me' | 'bot';
  text: string;
}

const INITIAL: Msg[] = [
  {
    id: 'b0',
    from: 'bot',
    text: "Hi! I'm AMS Assistant. Ask me about rent, maintenance, lease docs, or building amenities.",
  },
];

const SUGGESTIONS = [
  'When is my rent due?',
  'Report a leaking tap',
  'Show my lease end date',
  'Pool hours this weekend?',
];

const fakeReply = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes('rent') && t.includes('due'))
    return 'Your May rent of $450 is due on May 31. You can pay now from the Payments tab.';
  if (t.includes('leak'))
    return 'I can file a maintenance request for "Leaking tap". Want me to set the priority to Medium?';
  if (t.includes('lease'))
    return 'Your active lease #L-9821 runs Mar 1 2025 → Feb 28 2026.';
  if (t.includes('pool'))
    return 'The pool will be closed Saturday 8am–2pm for cleaning. Otherwise open 6am–10pm.';
  return "I'm a demo assistant — I'll connect to a real model soon. Try one of the suggestions below.";
};

const AIChatbotScreen: React.FC<AIChatbotScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const [messages, setMessages] = useState<Msg[]>(INITIAL);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);

  const send = (text?: string) => {
    const m = (text ?? draft).trim();
    if (!m) return;
    const my: Msg = { id: String(Date.now()), from: 'me', text: m };
    setMessages((p) => [...p, my]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      const reply: Msg = {
        id: String(Date.now() + 1),
        from: 'bot',
        text: fakeReply(m),
      };
      setMessages((p) => [...p, reply]);
      setTyping(false);
    }, 700);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const Bubble: React.FC<{ msg: Msg }> = ({ msg }) => {
    const isMe = msg.from === 'me';
    return (
      <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
        {!isMe ? (
          <View style={styles.botAvatar}>
            <Ionicons name="sparkles" size={12} color={t.colors.primary} />
          </View>
        ) : null}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
            {msg.text}
          </Text>
        </View>
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
          <View style={styles.botBadge}>
            <Ionicons name="sparkles" size={16} color={t.colors.white} />
          </View>
          <View>
            <Text style={styles.headerName}>AMS Assistant</Text>
            <Text style={styles.headerMeta}>
              {typing ? 'Typing...' : 'AI · always available'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={t.colors.textSecondary}
          />
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

        {messages.length <= 1 ? (
          <View style={styles.suggestRow}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestChip}
                activeOpacity={0.85}
                onPress={() => send(s)}
              >
                <Text style={styles.suggestText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask anything..."
            placeholderTextColor={t.colors.textHint}
            style={styles.input}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
            disabled={!draft.trim()}
            onPress={() => send()}
          >
            <Ionicons name="arrow-up" size={20} color={t.colors.white} />
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
    botBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#7C3AED',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerName: { fontSize: 15 * fs, fontWeight: '600', color: c.text },
    headerMeta: { fontSize: 11 * fs, color: c.textSecondary, marginTop: 1 },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      gap: spacing.md,
    },
    bubbleRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.xs,
      maxWidth: '85%',
    },
    bubbleRowMe: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    botAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bubble: { padding: spacing.md, borderRadius: 16 },
    bubbleBot: {
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
    suggestRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    suggestChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: c.primarySoft,
    },
    suggestText: { color: c.primaryDark, fontSize: 12 * fs, fontWeight: '500' },
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

export default AIChatbotScreen;
