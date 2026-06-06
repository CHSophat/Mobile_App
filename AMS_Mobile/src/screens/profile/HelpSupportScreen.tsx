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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HelpSupportScreenProps {
  navigation: { goBack: () => void; canGoBack: () => boolean };
}

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I pay my rent?',
    a: 'Open the Payments tab, tap "Pay" on the upcoming charge, then choose a card or Bakong QR.',
  },
  {
    q: 'How do I report a maintenance issue?',
    a: 'Tap the "Report" quick action on Home or use the + button on the Maintenance tab to file a new request.',
  },
  {
    q: 'Where do I find my lease documents?',
    a: 'Profile → My leases & documents. Tap any lease to view its PDFs and the move-in checklist.',
  },
  {
    q: 'How do I change my password?',
    a: 'Profile → Security → Change password.',
  },
];

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
  navigation,
}) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const CONTACT_OPTIONS = [
    { key: 'chat', icon: 'chatbubbles-outline', label: 'Live chat', meta: 'Replies in ~5 min', tint: t.colors.primary },
    { key: 'email', icon: 'mail-outline', label: 'Email support', meta: 'support@ams.example', tint: t.colors.primary },
    { key: 'call', icon: 'call-outline', label: 'Call us', meta: '+855 23 456 789', tint: t.colors.success },
    { key: 'whatsapp', icon: 'logo-whatsapp', label: 'WhatsApp', meta: '+855 12 345 678', tint: '#25D366' },
  ];

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaq((cur) => (cur === i ? null : i));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={t.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & support</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>Contact us</Text>
        <View style={styles.contactGrid}>
          {CONTACT_OPTIONS.map((c) => (
            <TouchableOpacity key={c.key} style={styles.contactCard}>
              <View
                style={[
                  styles.contactIconWrap,
                  { backgroundColor: c.tint + '22' },
                ]}
              >
                <Ionicons name={c.icon as any} size={22} color={c.tint} />
              </View>
              <Text style={styles.contactLabel}>{c.label}</Text>
              <Text style={styles.contactMeta}>{c.meta}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.section}>Frequently asked questions</Text>
        <View style={styles.faqList}>
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <View key={i} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqHead}
                  activeOpacity={0.7}
                  onPress={() => toggle(i)}
                >
                  <Text style={styles.faqQuestion}>{f.q}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={t.colors.textSecondary}
                  />
                </TouchableOpacity>
                {open ? <Text style={styles.faqAnswer}>{f.a}</Text> : null}
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.bottomRow}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={t.colors.primary}
          />
          <Text style={styles.bottomLabel}>Terms of service</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={t.colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={t.colors.primary}
          />
          <Text style={styles.bottomLabel}>Privacy policy</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={t.colors.textSecondary}
          />
        </TouchableOpacity>
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
      fontSize: 15 * fs,
      fontWeight: '600',
      color: c.text,
      marginBottom: spacing.sm,
    },
    contactGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    contactCard: {
      flexBasis: '48%',
      flexGrow: 1,
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    contactIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    contactLabel: { fontSize: 14 * fs, fontWeight: '600', color: c.text },
    contactMeta: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    faqList: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.xl,
    },
    faqItem: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    faqHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
    },
    faqQuestion: {
      flex: 1,
      fontSize: 14 * fs,
      color: c.text,
      fontWeight: '500',
      marginRight: spacing.sm,
    },
    faqAnswer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      color: c.textSecondary,
      fontSize: 13 * fs,
      lineHeight: 19,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.sm,
    },
    bottomLabel: { flex: 1, fontSize: 14 * fs, color: c.text, fontWeight: '500' },
  });

export default HelpSupportScreen;
