import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@store/hooks';
import { spacing } from '@theme/index';
import { useTheme } from '@theme/ThemeContext';
import HomeSidebar from '@components/common/HomeSidebar';
import { LangCode } from '@components/common/Flag';

import TenantHomeScreen from '@screens/main/TenantHomeScreen';
import MyUnitScreen from '@screens/unit/MyUnitScreen';
import PaymentsHomeScreen from '@screens/payments/PaymentsHomeScreen';
import MaintenanceListScreen from '@screens/maintenance/MaintenanceListScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const UNREAD = 3;

const iconFor = (route: string, focused: boolean): any => {
  switch (route) {
    case 'HomeTab':
      return focused ? 'home' : 'home-outline';
    case 'UnitTab':
      return focused ? 'business' : 'business-outline';
    case 'PaymentsTab':
      return focused ? 'wallet' : 'wallet-outline';
    case 'MaintenanceTab':
      return focused ? 'construct' : 'construct-outline';
    case 'ProfileTab':
      return focused ? 'person' : 'person-outline';
    default:
      return 'ellipse-outline';
  }
};

const MainTabNavigator: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useAppSelector((s) => s.auth.user);
  const t = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<LangCode>('en');

  const goToParent = (target: string) => {
    const parent = navigation.getParent?.();
    if (parent) parent.navigate(target);
    else navigation.navigate(target);
  };

  const handleMenuPress = (key: string) => {
    setSidebarOpen(false);
    if (key === 'chatbot') goToParent('AIChatbotScreen');
    if (key === 'themes') goToParent('ThemesScreen');
    if (key === 'product') goToParent('ProductScreen');
  };

  const styles = makeStyles(t.colors, t.fontScale);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <SafeAreaView edges={['top']} style={styles.topBarSafe}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setSidebarOpen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.8}
          >
            <Ionicons name="menu" size={22} color={t.colors.text} />
          </TouchableOpacity>

          <Text style={styles.brand}>AMS</Text>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => goToParent('InboxScreen')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={t.colors.text}
            />
            {UNREAD > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{UNREAD}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: t.colors.primary,
          tabBarInactiveTintColor: t.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: t.colors.surface,
            borderTopColor: t.colors.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 11 * t.fontScale, fontWeight: '500' },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={iconFor(route.name, focused)}
              size={size}
              color={color}
            />
          ),
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={TenantHomeScreen}
          options={{ title: 'Home' }}
        />
        <Tab.Screen
          name="UnitTab"
          component={MyUnitScreen}
          options={{ title: 'My Unit' }}
        />
        <Tab.Screen
          name="PaymentsTab"
          component={PaymentsHomeScreen}
          options={{ title: 'Payments' }}
        />
        <Tab.Screen
          name="MaintenanceTab"
          component={MaintenanceListScreen}
          options={{ title: 'Maintenance' }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>

      <HomeSidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={user?.displayName ?? 'Sopheak Chhun'}
        userEmail={user?.email ?? 'sopheak@example.com'}
        themeMode={t.isDark ? 'dark' : 'light'}
        onToggleTheme={() => t.setMode(t.isDark ? 'light' : 'dark')}
        language={language}
        onChangeLanguage={setLanguage}
        onMenuPress={handleMenuPress}
        onProfilePress={() => {
          setSidebarOpen(false);
          goToParent('EditProfileScreen');
        }}
      />
    </View>
  );
};

const makeStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  fs: number
) =>
  StyleSheet.create({
    topBarSafe: { backgroundColor: c.surface },
    topBar: {
      height: 52,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      backgroundColor: c.surface,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brand: {
      fontSize: 17 * fs,
      fontWeight: '700',
      color: c.primaryDark,
      letterSpacing: 1,
    },
    badge: {
      position: 'absolute',
      top: 6,
      right: 6,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 3,
      borderRadius: 8,
      backgroundColor: c.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: { color: c.white, fontSize: 10 * fs, fontWeight: '700' },
  });

export default MainTabNavigator;
