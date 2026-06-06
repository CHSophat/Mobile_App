import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@theme/ThemeContext';
import { useT } from '@i18n/useT';
import { shareContent, SharePayload } from '@utils/share';

interface Props {
  payload: SharePayload;
  variant?: 'icon' | 'icon-label' | 'pill';
  size?: number;
  color?: string;
  style?: ViewStyle;
  hitSlop?: { top: number; bottom: number; left: number; right: number };
}

const ShareButton: React.FC<Props> = ({
  payload,
  variant = 'icon',
  size = 20,
  color,
  style,
  hitSlop = { top: 8, bottom: 8, left: 8, right: 8 },
}) => {
  const theme = useTheme();
  const { t, fonts } = useT();
  const [busy, setBusy] = React.useState(false);
  const tint = color ?? theme.colors.primary;

  const onPress = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await shareContent(payload);
    } finally {
      setBusy(false);
    }
  };

  if (variant === 'pill') {
    return (
      <TouchableOpacity
        style={[
          styles.pill,
          { backgroundColor: theme.colors.primarySoft },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.85}
        hitSlop={hitSlop}
      >
        {busy ? (
          <ActivityIndicator size="small" color={tint} />
        ) : (
          <Ionicons name="share-social-outline" size={size} color={tint} />
        )}
        <Text style={[styles.pillLabel, { color: tint, fontFamily: fonts.medium }]}>
          {t('common.share')}
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'icon-label') {
    return (
      <TouchableOpacity
        style={[styles.row, style]}
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={hitSlop}
      >
        {busy ? (
          <ActivityIndicator size="small" color={tint} />
        ) : (
          <Ionicons name="share-social-outline" size={size} color={tint} />
        )}
        <Text style={[styles.label, { color: tint, fontFamily: fonts.medium }]}>
          {t('common.share')}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={hitSlop}
    >
      {busy ? (
        <ActivityIndicator size="small" color={tint} />
      ) : (
        <Ionicons name="share-social-outline" size={size} color={tint} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 13, fontWeight: '500' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillLabel: { fontSize: 13, fontWeight: '600' },
});

export default ShareButton;
