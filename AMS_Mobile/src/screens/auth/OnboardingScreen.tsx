import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ListRenderItemInfo,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line } from 'react-native-svg';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';

interface Slide {
  key: string;
  title: string;
  illustration: 'home' | 'shield' | 'wallet';
}

const SLIDES: Slide[] = [
  { key: '1', title: 'Manage your home,\nwherever you are', illustration: 'home' },
  { key: '2', title: 'Stay secure\nwith smart access', illustration: 'shield' },
  { key: '3', title: 'Track rent & bills\nin one place', illustration: 'wallet' },
];

interface OnboardingScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    replace: (screen: string) => void;
  };
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const t = useTheme();
  const styles = makeStyles(t.colors, t.fontScale);
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const illustrationSize = Math.max(200, Math.min(width * 0.7, 320));

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const next = Math.round(e.nativeEvent.contentOffset.x / width);
        if (next !== index) setIndex(next);
      },
    }
  );

  const handleCta = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      navigation.navigate('LoginScreen');
    }
  };

  const HomeIllustration: React.FC<{ size: number }> = ({ size }) => {
    const scale = size / 260;
    const px = (v: number) => v * scale;
    return (
      <View style={{ width: size, height: px(200) }}>
        <Svg width={size} height={px(200)} style={StyleSheet.absoluteFill}>
          <Line x1={px(70)} y1={px(140)} x2={px(130)} y2={px(70)} stroke={t.colors.primary} strokeWidth={2} />
          <Line x1={px(130)} y1={px(70)} x2={px(190)} y2={px(140)} stroke={t.colors.primary} strokeWidth={2} />
          <Line x1={px(130)} y1={px(70)} x2={px(130)} y2={px(140)} stroke={t.colors.primary} strokeWidth={2} />
        </Svg>

        <View
          style={[
            styles.iconNode,
            { top: px(28), left: px(130) - px(36), width: px(72), height: px(72) },
          ]}
        >
          <Ionicons name="home-outline" size={px(44)} color={t.colors.primary} />
        </View>
        <View
          style={[
            styles.iconNode,
            styles.iconBordered,
            { top: px(120), left: px(50), width: px(56), height: px(56) },
          ]}
        >
          <Ionicons name="thermometer-outline" size={px(28)} color={t.colors.primary} />
        </View>
        <View
          style={[
            styles.iconNode,
            { top: px(120), left: px(130) - px(28), width: px(56), height: px(56) },
          ]}
        >
          <Ionicons name="lock-closed-outline" size={px(28)} color={t.colors.primary} />
        </View>
        <View
          style={[
            styles.iconNode,
            { top: px(120), right: px(50), width: px(56), height: px(56) },
          ]}
        >
          <Ionicons name="videocam-outline" size={px(28)} color={t.colors.primary} />
        </View>
      </View>
    );
  };

  const SingleIconIllustration: React.FC<{ name: any; size: number }> = ({
    name,
    size,
  }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: size * 0.77 }}>
      <Ionicons name={name} size={size * 0.46} color={t.colors.primary} />
    </View>
  );

  const renderItem = ({ item, index: i }: ListRenderItemInfo<Slide>) => {
    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });
    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [40, 0, 40],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width }]}>
        <Animated.View
          style={[
            styles.illustrationBlock,
            { opacity, transform: [{ scale }] },
          ]}
        >
          {item.illustration === 'home' && (
            <HomeIllustration size={illustrationSize} />
          )}
          {item.illustration === 'shield' && (
            <SingleIconIllustration
              name="shield-checkmark-outline"
              size={illustrationSize}
            />
          )}
          {item.illustration === 'wallet' && (
            <SingleIconIllustration
              name="wallet-outline"
              size={illustrationSize}
            />
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.titleBlock,
            { opacity, transform: [{ translateY }] },
          ]}
        >
          <Text style={[styles.title, { fontSize: Math.min(width * 0.07, 30) * t.fontScale }]}>
            {item.title}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AnimatedFlatList
        ref={listRef as any}
        data={SLIDES}
        keyExtractor={(s) => (s as Slide).key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={renderItem as any}
        getItemLayout={(_: any, i: number) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
      />

      <View style={styles.dotsRow}>
        {SLIDES.map((s, i) => (
          <View
            key={s.key}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.cta}
          onPress={handleCta}
        >
          <Text style={styles.ctaLabel}>
            {index < SLIDES.length - 1 ? 'Next' : 'Get started'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('LoginScreen')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.alreadyText}>Already have an account?</Text>
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
    slide: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    illustrationBlock: {
      flex: 2,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleBlock: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: spacing.md,
    },
    iconNode: {
      position: 'absolute',
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
    },
    iconBordered: {
      borderWidth: 2,
      borderColor: c.primary,
      borderRadius: 10,
    },
    title: {
      lineHeight: 34,
      fontWeight: '600',
      textAlign: 'center',
      color: c.text,
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: spacing.lg,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.border,
      marginHorizontal: 4,
    },
    dotActive: {
      backgroundColor: c.primary,
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.md,
    },
    cta: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaLabel: {
      color: c.white,
      fontSize: 16 * fs,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    alreadyText: {
      textAlign: 'center',
      color: c.textSecondary,
      marginTop: spacing.lg,
      fontSize: 14 * fs,
    },
  });

export default OnboardingScreen;
