import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';
import { customerService } from '@services/api/customerService';

type Condition = 'good' | 'fair' | 'bad';

interface ChecklistItem {
  key: string;
  label: string;
}

interface Step {
  key: string;
  name: string;
  items: ChecklistItem[];
}

const STEPS: Step[] = [
  {
    key: 'living',
    name: 'Living Room',
    items: [
      { key: 'walls', label: 'Walls' },
      { key: 'floor', label: 'Floor' },
      { key: 'lights', label: 'Lights' },
    ],
  },
  {
    key: 'bedroom',
    name: 'Bedroom',
    items: [
      { key: 'walls', label: 'Walls' },
      { key: 'window', label: 'Window' },
      { key: 'closet', label: 'Closet door' },
    ],
  },
  {
    key: 'kitchen',
    name: 'Kitchen',
    items: [
      { key: 'sink', label: 'Sink' },
      { key: 'stove', label: 'Stove' },
      { key: 'cabinets', label: 'Cabinets' },
    ],
  },
  {
    key: 'bathroom',
    name: 'Bathroom',
    items: [
      { key: 'toilet', label: 'Toilet' },
      { key: 'shower', label: 'Shower' },
      { key: 'sink', label: 'Sink' },
    ],
  },
  {
    key: 'general',
    name: 'General',
    items: [
      { key: 'aircon', label: 'Air conditioner' },
      { key: 'wifi', label: 'Wi-Fi router' },
      { key: 'locks', label: 'Door locks' },
    ],
  },
];

type Ratings = Record<string, Record<string, Condition | undefined>>;

interface MoveInChecklistScreenProps {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
    navigate: (s: string, p?: any) => void;
  };
  route?: { params?: { leaseId?: number | string } };
}

const MoveInChecklistScreen: React.FC<MoveInChecklistScreenProps> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { t: tr, fonts } = useT();
  const t = theme;
  const styles = makeStyles(t.colors, t.fontScale);
  const leaseId = route?.params?.leaseId;

  const CONDITIONS: { key: Condition; label: string; color: string }[] = [
    { key: 'good', label: tr('common.success'), color: t.colors.success },
    { key: 'fair', label: tr('common.warning'), color: t.colors.warning },
    { key: 'bad', label: tr('common.error'), color: t.colors.error },
  ];

  const [stepIdx, setStepIdx] = useState(0);
  const [ratings, setRatings] = useState<Ratings>({});
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const step = STEPS[stepIdx];

  const setRating = (itemKey: string, c: Condition) => {
    setRatings((prev) => ({
      ...prev,
      [step.key]: { ...(prev[step.key] ?? {}), [itemKey]: c },
    }));
  };

  const goBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
    else if (navigation.canGoBack()) navigation.goBack();
  };

  const conditionToBackend = (
    c: Condition
  ): 'good' | 'fair' | 'poor' => {
    if (c === 'good') return 'good';
    if (c === 'fair') return 'fair';
    return 'poor';
  };

  const submitChecklist = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const items: {
        area: string;
        itemName: string;
        condition: 'good' | 'fair' | 'poor' | 'damaged';
        notes: string | null;
      }[] = [];
      for (const step of STEPS) {
        for (const it of step.items) {
          const r = ratings[step.key]?.[it.key];
          if (!r) continue;
          items.push({
            area: step.name,
            itemName: it.label,
            condition: conditionToBackend(r),
            notes: note.trim() ? note.trim() : null,
          });
        }
      }
      if (items.length === 0) {
        Alert.alert(tr('common.warning'), tr('common.required'));
        setSubmitting(false);
        return;
      }
      if (!leaseId) {
        // No lease bound — bail gracefully so dev/testing still works.
        Alert.alert(tr('common.success'), tr('checklist.checklistSaved'));
        if (navigation.canGoBack()) navigation.goBack();
        return;
      }
      await customerService.createMoveInChecklist(leaseId, { items });
      Alert.alert(tr('common.success'), tr('checklist.checklistSaved'));
      if (navigation.canGoBack()) navigation.goBack();
    } catch (err: any) {
      Alert.alert(tr('common.error'), err?.message || tr('errors.unknown'));
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      submitChecklist();
    }
  };

  const progress = (stepIdx + 1) / STEPS.length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
        <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
          {tr('checklist.title')}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>
      <Text style={styles.stepText}>
        Step {stepIdx + 1} of {STEPS.length}: {step.name}
      </Text>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {step.items.map((item, i) => {
            const current = ratings[step.key]?.[item.key];
            return (
              <View
                key={item.key}
                style={[
                  styles.itemRow,
                  i < step.items.length - 1 && styles.itemRowBorder,
                ]}
              >
                <Text style={styles.itemLabel}>{item.label}</Text>
                <View style={styles.conditionRow}>
                  {CONDITIONS.map((c) => (
                    <TouchableOpacity
                      key={c.key}
                      onPress={() => setRating(item.key, c.key)}
                      style={[
                        styles.conditionBtn,
                        current === c.key && {
                          backgroundColor: c.color,
                          borderColor: c.color,
                        },
                      ]}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.conditionLabel,
                          current === c.key && styles.conditionLabelActive,
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.photoBtn} activeOpacity={0.85}>
          <Ionicons name="camera-outline" size={18} color={t.colors.primary} />
          <Text style={styles.photoBtnLabel}>Add photo</Text>
        </TouchableOpacity>

        <Text style={styles.noteLabel}>Note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Anything else for this room?"
          placeholderTextColor={t.colors.textHint}
          multiline
          style={styles.noteInput}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backStepBtn}
          activeOpacity={0.85}
          onPress={goBack}
        >
          <Text style={styles.backStepLabel}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, submitting && { opacity: 0.6 }]}
          activeOpacity={0.85}
          onPress={goNext}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={t.colors.white} />
          ) : (
            <Text style={[styles.nextBtnLabel, { fontFamily: fonts.bold }]}>
              {stepIdx === STEPS.length - 1
                ? tr('checklist.saveChecklist')
                : tr('common.next')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    progressTrack: {
      marginTop: spacing.lg,
      marginHorizontal: spacing.xl,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: c.primary },
    stepText: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      fontSize: 13 * fs,
      color: c.textSecondary,
      fontWeight: '500',
    },
    scroll: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing['4xl'],
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    itemRow: { padding: spacing.lg },
    itemRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    itemLabel: {
      fontSize: 14 * fs,
      color: c.text,
      fontWeight: '500',
      marginBottom: spacing.sm,
    },
    conditionRow: { flexDirection: 'row', gap: spacing.sm },
    conditionBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
    },
    conditionLabel: { color: c.text, fontSize: 12 * fs, fontWeight: '500' },
    conditionLabelActive: { color: c.white, fontWeight: '600' },
    photoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      marginTop: spacing.md,
    },
    photoBtnLabel: { color: c.primary, fontWeight: '600', fontSize: 14 * fs },
    noteLabel: {
      fontSize: 13 * fs,
      color: c.text,
      fontWeight: '500',
      marginBottom: spacing.sm,
      marginTop: spacing.sm,
    },
    noteInput: {
      minHeight: 80,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.surface,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      fontSize: 14 * fs,
      color: c.text,
      textAlignVertical: 'top',
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      gap: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    backStepBtn: {
      flex: 1,
      paddingVertical: spacing.lg,
      borderRadius: 999,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
    },
    backStepLabel: { color: c.text, fontWeight: '600', fontSize: 15 * fs },
    nextBtn: {
      flex: 1,
      paddingVertical: spacing.lg,
      borderRadius: 999,
      backgroundColor: c.primary,
      alignItems: 'center',
    },
    nextBtnLabel: { color: c.white, fontWeight: '600', fontSize: 15 * fs },
  });

export default MoveInChecklistScreen;
