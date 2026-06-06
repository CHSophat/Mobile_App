import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from '@store/store';
import { colors } from '@theme/colors';

// Placeholder for main navigation
const AppNavigator = () => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Navigation will be implemented here */}
    </View>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
