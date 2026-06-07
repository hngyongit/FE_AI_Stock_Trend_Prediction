import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GluestackUIProvider } from '@/shared/ui/primitives';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import { palette } from '@/shared/design/tokens';
import '@/global.css';

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
    <GestureHandlerRootView style={{ backgroundColor: palette.background, flex: 1 }}>
      <GluestackUIProvider mode="dark">
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
