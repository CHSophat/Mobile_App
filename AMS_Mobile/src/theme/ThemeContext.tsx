import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentKey =
  | 'teal'
  | 'indigo'
  | 'rose'
  | 'amber'
  | 'emerald'
  | 'slate';
export type FontSizeKey = 'sm' | 'md' | 'lg';

interface AccentPalette {
  primary: string;
  primaryDark: string;
  primarySoft: string;
}

export const ACCENTS: Record<AccentKey, AccentPalette & { name: string }> = {
  teal: {
    name: 'Mint Teal',
    primary: '#5DBDB2',
    primaryDark: '#3A9B91',
    primarySoft: '#E3F4F1',
  },
  indigo: {
    name: 'Indigo',
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primarySoft: '#E0E7FF',
  },
  rose: {
    name: 'Rose',
    primary: '#F43F5E',
    primaryDark: '#E11D48',
    primarySoft: '#FFE4E6',
  },
  amber: {
    name: 'Amber',
    primary: '#F59E0B',
    primaryDark: '#D97706',
    primarySoft: '#FEF3C7',
  },
  emerald: {
    name: 'Emerald',
    primary: '#10B981',
    primaryDark: '#059669',
    primarySoft: '#D1FAE5',
  },
  slate: {
    name: 'Slate',
    primary: '#475569',
    primaryDark: '#334155',
    primarySoft: '#E2E8F0',
  },
};

export const FONT_SCALES: Record<FontSizeKey, number> = {
  sm: 0.92,
  md: 1.0,
  lg: 1.12,
};

interface ThemedColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textHint: string;
  border: string;
  divider: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  success: string;
  warning: string;
  error: string;
  white: string;
}

const buildColors = (mode: 'light' | 'dark', accent: AccentKey): ThemedColors => {
  const a = ACCENTS[accent];
  if (mode === 'dark') {
    return {
      background: '#0F172A',
      surface: '#1E293B',
      surfaceElevated: '#273449',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      textHint: '#64748B',
      border: '#334155',
      divider: '#1E293B',
      primary: a.primary,
      primaryDark: a.primaryDark,
      primarySoft: '#1F3530',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      white: '#FFFFFF',
    };
  }
  return {
    background: '#F7F7F5',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textHint: '#9CA3AF',
    border: '#E5E7EB',
    divider: '#F3F4F6',
    primary: a.primary,
    primaryDark: a.primaryDark,
    primarySoft: a.primarySoft,
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    white: '#FFFFFF',
  };
};

interface ThemeContextValue {
  mode: ThemeMode;
  accent: AccentKey;
  fontSize: FontSizeKey;
  isDark: boolean;
  fontScale: number;
  colors: ThemedColors;
  setMode: (m: ThemeMode) => void;
  setAccent: (a: AccentKey) => void;
  setFontSize: (s: FontSizeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');
  const [accent, setAccent] = useState<AccentKey>('teal');
  const [fontSize, setFontSize] = useState<FontSizeKey>('md');

  const value = useMemo<ThemeContextValue>(() => {
    const effective: 'light' | 'dark' =
      mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
    return {
      mode,
      accent,
      fontSize,
      isDark: effective === 'dark',
      fontScale: FONT_SCALES[fontSize],
      colors: buildColors(effective, accent),
      setMode,
      setAccent,
      setFontSize,
    };
  }, [mode, accent, fontSize, system]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
};
