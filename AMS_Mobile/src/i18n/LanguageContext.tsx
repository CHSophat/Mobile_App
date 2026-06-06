import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useFonts } from 'expo-font';
import i18n, {
  initI18n,
  persistLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from './index';
import {
  FONT_FILES,
  FontFamilySet,
  getFontFamilies,
  LanguageCode,
} from './fonts';

interface LanguageContextValue {
  language: LanguageCode;
  ready: boolean;
  fontsLoaded: boolean;
  fonts: FontFamilySet;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  supported: LanguageCode[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts(FONT_FILES);

  useEffect(() => {
    let mounted = true;
    initI18n()
      .then((lang) => {
        if (mounted) {
          setLanguageState(lang);
          setReady(true);
        }
      })
      .catch(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = useCallback(async (lang: LanguageCode) => {
    await i18n.changeLanguage(lang);
    await persistLanguage(lang);
    setLanguageState(lang);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      ready,
      fontsLoaded,
      fonts: getFontFamilies(language, fontsLoaded),
      setLanguage,
      supported: SUPPORTED_LANGUAGES,
    }),
    [language, ready, fontsLoaded, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside <LanguageProvider>');
  }
  return ctx;
};

export const useLocalizedFont = (): FontFamilySet => {
  const { fonts } = useLanguage();
  return fonts;
};
