import React, { useEffect, useState, ComponentType } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider, useSelector } from 'react-redux';
import { store } from '@store/store';
import { colors } from '@theme/colors';
import { RootState } from '@store/store';
import LoginScreenRaw from '@screens/auth/LoginScreen';
import OnboardingScreenRaw from '@screens/auth/OnboardingScreen';
import RegisterScreenRaw from '@screens/auth/RegisterScreen';
import ForgotPasswordScreenRaw from '@screens/auth/ForgotPasswordScreen';
import OtpVerifyScreenRaw from '@screens/auth/OtpVerifyScreen';
import MainTabNavigator from '@navigation/MainTabNavigator';
import LeaseDetailScreenRaw from '@screens/lease/LeaseDetailScreen';
import MoveInChecklistScreenRaw from '@screens/checklist/MoveInChecklistScreen';
import EditProfileScreenRaw from '@screens/profile/EditProfileScreen';
import AddressesScreenRaw from '@screens/profile/AddressesScreen';
import MyLeasesScreenRaw from '@screens/lease/MyLeasesScreen';
import HelpSupportScreenRaw from '@screens/profile/HelpSupportScreen';
import NotificationSettingsScreenRaw from '@screens/profile/NotificationSettingsScreen';
import NewMaintenanceRequestScreenRaw from '@screens/maintenance/NewMaintenanceRequestScreen';
import InboxScreenRaw from '@screens/communication/InboxScreen';
import ChangePasswordScreenRaw from '@screens/security/ChangePasswordScreen';
import TwoFactorSetupScreenRaw from '@screens/security/TwoFactorSetupScreen';
import SessionsScreenRaw from '@screens/security/SessionsScreen';
import ConversationScreenRaw from '@screens/communication/ConversationScreen';
import AnnouncementDetailScreenRaw from '@screens/communication/AnnouncementDetailScreen';
import AIChatbotScreenRaw from '@screens/misc/AIChatbotScreen';
import ThemesScreenRaw from '@screens/misc/ThemesScreen';
import ProductScreenRaw from '@screens/misc/ProductScreen';
import AddPaymentMethodScreenRaw from '@screens/payments/AddPaymentMethodScreen';
import BakongQrScreenRaw from '@screens/payments/BakongQrScreen';
import PayNowScreenRaw from '@screens/payments/PayNowScreen';
import AddAddressScreenRaw from '@screens/profile/AddAddressScreen';
import OtherCategoryScreenRaw from '@screens/maintenance/OtherCategoryScreen';
import UploadPhotoScreenRaw from '@screens/maintenance/UploadPhotoScreen';
import ProductDetailsScreenRaw from '@screens/misc/ProductDetailsScreen';
import ProductFilterScreenRaw from '@screens/misc/ProductFilterScreen';
import LanguageScreenRaw from '@screens/profile/LanguageScreen';

const LoginScreen = LoginScreenRaw as ComponentType<any>;
const OnboardingScreen = OnboardingScreenRaw as ComponentType<any>;
const RegisterScreen = RegisterScreenRaw as ComponentType<any>;
const ForgotPasswordScreen = ForgotPasswordScreenRaw as ComponentType<any>;
const OtpVerifyScreen = OtpVerifyScreenRaw as ComponentType<any>;
const LeaseDetailScreen = LeaseDetailScreenRaw as ComponentType<any>;
const MoveInChecklistScreen = MoveInChecklistScreenRaw as ComponentType<any>;
const EditProfileScreen = EditProfileScreenRaw as ComponentType<any>;
const AddressesScreen = AddressesScreenRaw as ComponentType<any>;
const MyLeasesScreen = MyLeasesScreenRaw as ComponentType<any>;
const HelpSupportScreen = HelpSupportScreenRaw as ComponentType<any>;
const NotificationSettingsScreen = NotificationSettingsScreenRaw as ComponentType<any>;
const NewMaintenanceRequestScreen = NewMaintenanceRequestScreenRaw as ComponentType<any>;
const InboxScreen = InboxScreenRaw as ComponentType<any>;
const ChangePasswordScreen = ChangePasswordScreenRaw as ComponentType<any>;
const TwoFactorSetupScreen = TwoFactorSetupScreenRaw as ComponentType<any>;
const SessionsScreen = SessionsScreenRaw as ComponentType<any>;
const ConversationScreen = ConversationScreenRaw as ComponentType<any>;
const AnnouncementDetailScreen = AnnouncementDetailScreenRaw as ComponentType<any>;
const AIChatbotScreen = AIChatbotScreenRaw as ComponentType<any>;
const ThemesScreen = ThemesScreenRaw as ComponentType<any>;
const ProductScreen = ProductScreenRaw as ComponentType<any>;
const AddPaymentMethodScreen = AddPaymentMethodScreenRaw as ComponentType<any>;
const BakongQrScreen = BakongQrScreenRaw as ComponentType<any>;
const PayNowScreen = PayNowScreenRaw as ComponentType<any>;
const AddAddressScreen = AddAddressScreenRaw as ComponentType<any>;
const OtherCategoryScreen = OtherCategoryScreenRaw as ComponentType<any>;
const UploadPhotoScreen = UploadPhotoScreenRaw as ComponentType<any>;
const ProductDetailsScreen = ProductDetailsScreenRaw as ComponentType<any>;
const ProductFilterScreen = ProductFilterScreenRaw as ComponentType<any>;
const LanguageScreen = LanguageScreenRaw as ComponentType<any>;

const Stack = createStackNavigator();

const RootNavigator = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize app - check stored auth token, etc.
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          cardStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {isAuthenticated ? (
          // App Stack
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="LeaseDetailScreen"
              component={LeaseDetailScreen}
            />
            <Stack.Screen
              name="MoveInChecklistScreen"
              component={MoveInChecklistScreen}
            />
            <Stack.Screen
              name="EditProfileScreen"
              component={EditProfileScreen}
            />
            <Stack.Screen
              name="AddressesScreen"
              component={AddressesScreen}
            />
            <Stack.Screen
              name="MyLeasesScreen"
              component={MyLeasesScreen}
            />
            <Stack.Screen
              name="HelpSupportScreen"
              component={HelpSupportScreen}
            />
            <Stack.Screen
              name="NotificationSettingsScreen"
              component={NotificationSettingsScreen}
            />
            <Stack.Screen
              name="NewMaintenanceRequestScreen"
              component={NewMaintenanceRequestScreen}
            />
            <Stack.Screen name="InboxScreen" component={InboxScreen} />
            <Stack.Screen
              name="ChangePasswordScreen"
              component={ChangePasswordScreen}
            />
            <Stack.Screen
              name="TwoFactorSetupScreen"
              component={TwoFactorSetupScreen}
            />
            <Stack.Screen
              name="SessionsScreen"
              component={SessionsScreen}
            />
            <Stack.Screen
              name="ConversationScreen"
              component={ConversationScreen}
            />
            <Stack.Screen
              name="AnnouncementDetailScreen"
              component={AnnouncementDetailScreen}
            />
            <Stack.Screen
              name="AIChatbotScreen"
              component={AIChatbotScreen}
            />
            <Stack.Screen name="ThemesScreen" component={ThemesScreen} />
            <Stack.Screen name="ProductScreen" component={ProductScreen} />
            <Stack.Screen
              name="AddPaymentMethodScreen"
              component={AddPaymentMethodScreen}
            />
            <Stack.Screen
              name="BakongQrScreen"
              component={BakongQrScreen}
            />
            <Stack.Screen name="PayNowScreen" component={PayNowScreen} />
            <Stack.Screen
              name="AddAddressScreen"
              component={AddAddressScreen}
            />
            <Stack.Screen
              name="OtherCategoryScreen"
              component={OtherCategoryScreen}
            />
            <Stack.Screen
              name="UploadPhotoScreen"
              component={UploadPhotoScreen}
            />
            <Stack.Screen
              name="ProductDetailsScreen"
              component={ProductDetailsScreen}
            />
            <Stack.Screen
              name="ProductFilterScreen"
              component={ProductFilterScreen}
            />
            <Stack.Screen
              name="LanguageScreen"
              component={LanguageScreen}
            />
          </Stack.Group>
        ) : (
          // Auth Stack
          <Stack.Group
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="OnboardingScreen"
              component={OnboardingScreen}
            />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPasswordScreen"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="OtpVerifyScreen"
              component={OtpVerifyScreen}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const AppNavigator = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <RootNavigator />
        </View>
      </SafeAreaProvider>
    </Provider>
  );
};
