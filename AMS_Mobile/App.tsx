import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AppNavigator } from '@navigation/AppNavigator';
import { colors } from '@theme/colors';
import { ThemeProvider } from '@theme/ThemeContext';
import { LanguageProvider, useLanguage } from '@i18n/LanguageContext';
import { notificationService } from '@services/notifications/pushNotifications';
import { communicationService } from '@services/api/communicationService';

const AppShell: React.FC = () => {
  const { ready } = useLanguage();
  const [iconsLoaded] = useFonts({ ...Ionicons.font });

  useEffect(() => {
    notificationService.initialize();
    communicationService.initializeSocket();
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor(colors.surface);
    return () => {
      communicationService.disconnectSocket();
    };
  }, []);

  if (!iconsLoaded || !ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  );
}
