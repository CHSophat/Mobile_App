import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@theme/ThemeContext';
import { spacing } from '@theme/index';
import { useLanguage } from '@i18n/LanguageContext';
import { useT } from '@i18n/useT';
import type { LanguageCode } from '@i18n/fonts';

interface LanguageOption {
  code: LanguageCode;
  labelKey: string;
  englishName: string;
  flag: string;
}

const OPTIONS: LanguageOption[] = [
  { code: 'en', labelKey: 'language.english', englishName: 'English', flag: '🇺🇸' },
  { code: 'km', labelKey: 'language.khmer', englishName: 'Khmer', flag: '🇰🇭' },
  { code: 'zh', labelKey: 'language.chinese', englishName: 'Chinese', flag: '🇨🇳' },
];

interface Props {
  navigation: { goBack: () => void };
}

const LanguageScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { t, fonts } = useT();
  const { language, setLanguage, fontsLoaded } = useLanguage();
  const [pending, setPending] = React.useState<LanguageCode | null>(null);

  const styles = makeStyles(theme.colors, theme.fontScale, fonts.regular);

  const handleSelect = async (code: LanguageCode) => {
    if (code === language || pending) return;
    setPending(code);
    try {
      await setLanguage(code);
    } finally {
      setPending(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={navigation.goBack}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
          {t('language.title')}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.subtitle, { fontFamily: fonts.regular }]}>
          {t('language.subtitle')}
        </Text>

        {OPTIONS.map((option) => {
          const isActive = language === option.code;
          const isPending = pending === option.code;
          return (
            <TouchableOpacity
              key={option.code}
              activeOpacity={0.85}
              onPress={() => handleSelect(option.code)}
              style={[styles.row, isActive && styles.rowActive]}
            >
              <Text style={styles.flag}>{option.flag}</Text>
              <View style={styles.labels}>
                <Text style={[styles.primary, { fontFamily: fonts.medium }]}>
                  {t(option.labelKey)}
                </Text>
                <Text style={[styles.secondary, { fontFamily: fonts.regular }]}>
                  {option.englishName}
                </Text>
              </View>
              {isPending ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : isActive ? (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={theme.colors.primary}
                />
              ) : (
                <Ionicons
                  name="ellipse-outline"
                  size={22}
                  color={theme.colors.textHint}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {!fontsLoaded ? (
          <Text style={[styles.note, { fontFamily: fonts.regular }]}>
            {t('common.loading')}
          </Text>
        ) : null}
      </ScrollView>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 17 * fs, color: c.text, fontFamily },
    scroll: { padding: spacing.lg },
    subtitle: {
      fontSize: 13 * fs,
      color: c.textSecondary,
      marginBottom: spacing.lg,
      fontFamily,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.surface,
      padding: spacing.lg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.sm,
    },
    rowActive: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    flag: { fontSize: 28 },
    labels: { flex: 1 },
    primary: { fontSize: 15 * fs, color: c.text },
    secondary: { fontSize: 12 * fs, color: c.textSecondary, marginTop: 2 },
    note: {
      fontSize: 12 * fs,
      color: c.textHint,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });

export default LanguageScreen;
