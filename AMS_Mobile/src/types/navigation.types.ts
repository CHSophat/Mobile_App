export interface NavigationParams {
  AuthStack: {
    LoginScreen: undefined;
    SignUpScreen: undefined;
    ForgotPasswordScreen: undefined;
    TwoFactorScreen: { email: string };
  };
  MainStack: {
    TenantHomeScreen: undefined;
    OwnerHomeScreen: undefined;
    DashboardScreen: undefined;
    UnitCatalogScreen: undefined;
    UnitDetailScreen: { unitId: string };
    UnitSearchScreen: undefined;
    FilterScreen: undefined;
    LeaseDetailsScreen: { leaseId: string };
    ProfileScreen: undefined;
    InboxScreen: undefined;
    PaymentScreen: undefined;
  };
}
