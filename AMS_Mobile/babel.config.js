module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@store': './src/store',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@types': './src/types',
          '@theme': './src/theme',
          '@navigation': './src/navigation',
          '@i18n': './src/i18n',
        },
      },
    ],
    [
      'transform-inline-environment-variables',
      {
        include: ['EXPO_PUBLIC_*'],
      },
    ],
  ],
};
