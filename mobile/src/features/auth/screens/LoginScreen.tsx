import { useMemo } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, Card } from '@/shared/ui/primitives';
import { LoginHeader } from '@/features/auth/components/LoginHeader';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import type { RootScreenProps } from '@/app/navigation/navigation.types';
import { palette, radius, spacing } from '@/shared/design/tokens';

export function LoginScreen({ navigation }: RootScreenProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();

  const { formik, errorMessage, handleGoogleLogin, isGoogleSubmitting, showPassword, setShowPassword } = useLoginForm(() => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  });

  const metrics = useMemo(() => {
    const shortSide = Math.min(width, height);
    return {
      cardWidth: (width < 380 ? '92%' : width < 430 ? '88%' : '85%') as `${number}%`,
      cardPadding: Math.max(shortSide * 0.055, 18),
      titleSize: Math.max(shortSide * 0.07, 26),
      welcomeSize: Math.max(shortSide * 0.085, 32),
      subtitleSize: Math.max(shortSide * 0.037, 14),
      labelSize: Math.max(shortSide * 0.028, 11),
      bodySize: Math.max(shortSide * 0.037, 14),
      buttonHeight: Math.max(height * 0.066, 48),
      fieldHeight: Math.max(height * 0.068, 50),
      cardTopBottomSpace: Math.max(height * 0.09, 56),
      glowSize: width * 0.68,
    };
  }, [height, width]);

  const styles = StyleSheet.create({
    root: { backgroundColor: palette.background, flex: 1 } as ViewStyle,
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: Math.max(metrics.cardTopBottomSpace, insets.bottom + spacing.lg),
      paddingTop: Math.max(metrics.cardTopBottomSpace, insets.top + spacing.lg),
    },
    card: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: Math.max(radius.card, Math.min(width * 0.045, 18)),
      borderWidth: 1,
      overflow: 'hidden',
      paddingHorizontal: metrics.cardPadding,
      paddingVertical: metrics.cardPadding * 1.02,
      width: '100%',
    },
  });

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.root}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.root}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center' }}>
                <Box style={{ width: metrics.cardWidth, alignItems: 'center' }}>
                  <Card style={styles.card}>
                    <LoginHeader metrics={metrics} />
                    <Box style={{ height: spacing.lg }} />
                    <LoginForm
                      formik={formik}
                      errorMessage={errorMessage}
                      isGoogleSubmitting={isGoogleSubmitting}
                      onGoogleLogin={handleGoogleLogin}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword((v) => !v)}
                      onNavigateToRegister={() => navigation.navigate('Register')}
                      metrics={metrics}
                    />
                  </Card>
                </Box>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
