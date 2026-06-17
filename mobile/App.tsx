import 'react-native-gesture-handler';

import { Buffer } from 'buffer';
if (typeof (globalThis as any).Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider } from '@/shared/ui/primitives';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import { palette } from '@/shared/design/tokens';
import '@/global.css';

const queryClient = new QueryClient();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.background,
    border: palette.border,
    card: palette.background,
    primary: palette.primary,
    text: palette.textPrimary,
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ backgroundColor: palette.background, flex: 1 }}>
        <ThemeProvider mode="dark">
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
