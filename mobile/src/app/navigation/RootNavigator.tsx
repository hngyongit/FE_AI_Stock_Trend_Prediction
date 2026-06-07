import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from '@/app/navigation/MainTabNavigator';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { StartupScreen } from '@/features/startup/screens/StartupScreen';
import type { RootStackParamList } from '@/app/navigation/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Startup"
      screenOptions={{
        animation: 'fade',
        headerShown: false,
      }}>
      <Stack.Screen name="Startup" component={StartupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}