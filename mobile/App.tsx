import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import AppTabsShell from '@/components/app-shell/AppTabsShell';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { StartupScreen } from '@/features/startup/StartupScreen';
import '@/global.css';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Startup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GluestackUIProvider mode="dark">
      <NavigationContainer theme={DarkTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Startup"
          screenOptions={{
            animation: 'fade',
            headerShown: false,
          }}>
          <Stack.Screen name="Startup" component={StartupScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={AppTabsShell} />
        </Stack.Navigator>
      </NavigationContainer>
    </GluestackUIProvider>
  );
}
