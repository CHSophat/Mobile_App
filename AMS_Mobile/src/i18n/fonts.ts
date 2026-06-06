import { Platform } from 'react-native';

export type LanguageCode = 'en' | 'km' | 'zh';

export interface FontFamilySet {
  regular: string;
  medium: string;
  bold: string;
  light: string;
}

export const FONT_FAMILIES: Record<LanguageCode, FontFamilySet> = {
  en: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
  },
  km: {
    regular: 'NotoSansKhmer-Regular',
    medium: 'NotoSansKhmer-Medium',
    bold: 'NotoSansKhmer-Bold',
    light: 'NotoSansKhmer-Light',
  },
  zh: {
    regular: 'NotoSansSC-Regular',
    medium: 'NotoSansSC-Medium',
    bold: 'NotoSansSC-Bold',
    light: 'NotoSansSC-Light',
  },
};

export const FONT_FILES: Record<string, any> = {
  // Keep references commented until font files are actually added to
  // assets/fonts. Once present, uncomment to register via expo-font.
  // 'Roboto-Regular': require('../../assets/fonts/Roboto-Regular.ttf'),
  // 'Roboto-Medium': require('../../assets/fonts/Roboto-Medium.ttf'),
  // 'Roboto-Bold': require('../../assets/fonts/Roboto-Bold.ttf'),
  // 'Roboto-Light': require('../../assets/fonts/Roboto-Light.ttf'),
  // 'NotoSansKhmer-Regular': require('../../assets/fonts/NotoSansKhmer-Regular.ttf'),
  // 'NotoSansKhmer-Medium': require('../../assets/fonts/NotoSansKhmer-Medium.ttf'),
  // 'NotoSansKhmer-Bold': require('../../assets/fonts/NotoSansKhmer-Bold.ttf'),
  // 'NotoSansKhmer-Light': require('../../assets/fonts/NotoSansKhmer-Light.ttf'),
  // 'NotoSansSC-Regular': require('../../assets/fonts/NotoSansSC-Regular.otf'),
  // 'NotoSansSC-Medium': require('../../assets/fonts/NotoSansSC-Medium.otf'),
  // 'NotoSansSC-Bold': require('../../assets/fonts/NotoSansSC-Bold.otf'),
  // 'NotoSansSC-Light': require('../../assets/fonts/NotoSansSC-Light.otf'),
};

export const SYSTEM_FALLBACK: FontFamilySet = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  android: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    bold: 'sans-serif',
    light: 'sans-serif-light',
  },
  default: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
}) as FontFamilySet;

export const getFontFamilies = (
  lang: LanguageCode,
  fontsLoaded: boolean
): FontFamilySet => {
  if (!fontsLoaded) return SYSTEM_FALLBACK;
  return FONT_FAMILIES[lang] || FONT_FAMILIES.en;
};
