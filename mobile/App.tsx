import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GluestackUIProvider } from '@/shared/ui/primitives';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import '@/global.css';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="dark">
        <NavigationContainer theme={DarkTheme}>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
