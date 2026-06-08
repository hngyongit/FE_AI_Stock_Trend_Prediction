import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import MainTabNavigator from '@/app/navigation/MainTabNavigator';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { RegisterScreen } from '@/features/auth/screens/RegisterScreen';
import { ChangePasswordScreen } from '@/features/profile/screens/ChangePasswordScreen';
import { EditProfileScreen } from '@/features/profile/screens/EditProfileScreen';
import { StartupScreen } from '@/features/startup/screens/StartupScreen';
import { StockDetailScreen } from '@/features/stocks/screens/StockDetailScreen';
import type { RootStackParamList } from '@/app/navigation/navigation.types';
import { palette } from '@/shared/design/tokens';

const Stack = createNativeStackNavigator<RootStackParamList>();

const profileChildScreenOptions: NativeStackNavigationOptions = {
  animation: 'slide_from_right',
  contentStyle: {
    backgroundColor: palette.background,
  },
  gestureEnabled: true,
  headerStyle: {
    backgroundColor: palette.background,
  },
  navigationBarColor: palette.background,
  statusBarBackgroundColor: palette.background,
};

const detailScreenOptions: NativeStackNavigationOptions = {
  animation: 'none',
  contentStyle: {
    backgroundColor: palette.background,
  },
  gestureEnabled: true,
  headerShown: false,
  navigationBarColor: palette.background,
  statusBarBackgroundColor: palette.background,
};

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Startup"
      screenOptions={{
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: palette.background,
        },
        headerStyle: {
          backgroundColor: palette.background,
        },
        headerShown: false,
        navigationBarColor: palette.background,
        statusBarBackgroundColor: palette.background,
      }}>
      <Stack.Screen name="Startup" component={StartupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ animation: 'none' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={profileChildScreenOptions}
      />
      <Stack.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={detailScreenOptions}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={profileChildScreenOptions}
      />
    </Stack.Navigator>
  );
}
