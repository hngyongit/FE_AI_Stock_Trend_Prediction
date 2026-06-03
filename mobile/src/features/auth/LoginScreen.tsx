import { useFormik } from 'formik';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as yup from 'yup';
import {
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '../../../components/ui/box';
import { Card } from '../../../components/ui/card';
import { Divider } from '../../../components/ui/divider';
import { HStack } from '../../../components/ui/hstack';
import { Pressable } from '../../../components/ui/pressable';
import { Spinner } from '../../../components/ui/spinner';
import { Text } from '../../../components/ui/text';
import { VStack } from '../../../components/ui/vstack';
import {
  clearPersistedSession,
  getRoleAccessMessage,
  isMobileAllowedRole,
  loginWithCredentials,
  persistRememberedSession,
} from '@/features/auth/auth.service';
import type { RootScreenProps } from '@/navigation/types';
import { palette, radius, spacing } from '@/shared/design/tokens';
import { useAuthStore } from '@/stores/auth.store';

const BRAND = palette.primary;
const SURFACE = palette.surfaceLow;
const BORDER = palette.border;
const TEXT_PRIMARY = palette.text;
const TEXT_MUTED = palette.textMuted;
const CARD_GLOW = 'rgba(59, 130, 246, 0.12)';
const FIELD_SURFACE = '#121A25';
const FIELD_BORDER = 'rgba(66, 71, 84, 0.92)';
const FIELD_BORDER_FOCUS = 'rgba(173, 198, 255, 0.58)';
const FORM_ERROR = '#F8B4B4';
const FORM_ERROR_BORDER = 'rgba(239, 68, 68, 0.24)';

const loginValidationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email address.')
    .required('Email address is required.'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .required('Password is required.'),
  rememberMe: yup.boolean().required(),
});

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

function LoginField({
  accessibilityLabel,
  autoComplete,
  autoCapitalize = 'none',
  autoCorrect = false,
  fieldHeight,
  icon,
  inputRef,
  invalid,
  keyboardType,
  onBlur,
  onChangeText,
  onSubmitEditing,
  placeholder,
  returnKeyType,
  secureTextEntry,
  textContentType,
  value,
  rightAccessory,
}: {
  accessibilityLabel: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password';
  autoCorrect?: boolean;
  fieldHeight: number;
  icon: string;
  inputRef?: React.RefObject<TextInput | null>;
  invalid?: boolean;
  keyboardType?: 'default' | 'email-address';
  onBlur: () => void;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  returnKeyType?: 'done' | 'next';
  rightAccessory?: React.ReactNode;
  secureTextEntry?: boolean;
  textContentType?: 'emailAddress' | 'password';
  value: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        fieldShell: {
          alignItems: 'center',
          backgroundColor: FIELD_SURFACE,
          borderColor: invalid ? FORM_ERROR_BORDER : isFocused ? FIELD_BORDER_FOCUS : FIELD_BORDER,
          borderRadius: radius.card,
          borderWidth: 1,
          flexDirection: 'row',
          minHeight: fieldHeight,
          paddingHorizontal: '4.8%',
        },
        leading: {
          color: isFocused ? BRAND : TEXT_MUTED,
          fontSize: fieldHeight * 0.34,
          fontWeight: '700',
          width: '9%',
        },
        input: {
          color: TEXT_PRIMARY,
          flex: 1,
          fontSize: fieldHeight * 0.3,
          minHeight: fieldHeight * 0.96,
          paddingHorizontal: '2%',
        },
      }),
    [fieldHeight, invalid, isFocused],
  );

  return (
    <View style={styles.fieldShell}>
      <Text style={styles.leading}>{icon}</Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel={accessibilityLabel}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        importantForAutofill="yes"
        keyboardType={keyboardType}
        onBlur={() => {
          setIsFocused(false);
          onBlur();
        }}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={TEXT_MUTED}
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        selectionColor={BRAND}
        style={styles.input}
        textContentType={textContentType}
        value={value}
      />
      {rightAccessory}
    </View>
  );
}

export function LoginScreen({ navigation }: RootScreenProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardOffset = useRef(new Animated.Value(18)).current;
  const passwordRef = useRef<TextInput | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    beginSubmit,
    clearError,
    errorMessage,
    failSubmit,
    isSubmitting,
    setSession,
  } = useAuthStore();

  const metrics = useMemo(() => {
    const shortSide = Math.min(width, height);
    const cardWidth = (width < 380 ? '92%' : width < 430 ? '88%' : '85%') as `${number}%`;
    const cardPadding = Math.max(shortSide * 0.055, 18);
    const titleSize = Math.max(shortSide * 0.07, 26);
    const welcomeSize = Math.max(shortSide * 0.085, 32);
    const subtitleSize = Math.max(shortSide * 0.037, 14);
    const labelSize = Math.max(shortSide * 0.028, 11);
    const bodySize = Math.max(shortSide * 0.037, 14);
    const buttonHeight = Math.max(height * 0.066, 48);
    const fieldHeight = Math.max(height * 0.068, 50);
    const cardTopBottomSpace = Math.max(height * 0.09, 56);
    const glowSize = width * 0.68;

    return {
      bodySize,
      buttonHeight,
      cardPadding,
      cardTopBottomSpace,
      cardWidth,
      fieldHeight,
      glowSize,
      labelSize,
      subtitleSize,
      titleSize,
      welcomeSize,
    };
  }, [height, width]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        duration: 340,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(cardOffset, {
        duration: 340,
        easing: Easing.out(Easing.quad),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOffset, cardOpacity]);

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    validationSchema: loginValidationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      beginSubmit();
      clearError();

      try {
        const session = await loginWithCredentials({
          email: values.email.trim(),
          password: values.password,
        });

        if (!isMobileAllowedRole(session.user.role)) {
          await clearPersistedSession();
          failSubmit(getRoleAccessMessage(session.user.role));
          return;
        }

        if (values.rememberMe) {
          await persistRememberedSession(session);
        } else {
          await clearPersistedSession();
        }

        setSession(session);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } catch (error) {
        failSubmit(error instanceof Error ? error.message : 'Unable to sign in right now. Please try again.');
      }
    },
  });

  const styles = useMemo(
    () =>
      ({
        root: {
          backgroundColor: palette.background,
          flex: 1,
        } as ViewStyle,
        backgroundLayer: {
          backgroundColor: '#0B1220',
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        } as ViewStyle,
        backgroundGlowTop: {
          backgroundColor: 'rgba(59, 130, 246, 0.11)',
          borderRadius: 999,
          height: metrics.glowSize,
          left: '-14%',
          position: 'absolute',
          top: `${Math.max(8, insets.top * 0.28)}%`,
          width: metrics.glowSize,
        } as ViewStyle,
        backgroundGlowBottom: {
          backgroundColor: 'rgba(17, 24, 39, 0.96)',
          borderRadius: 999,
          bottom: `${Math.max(6, insets.bottom * 0.22)}%`,
          height: metrics.glowSize * 0.82,
          position: 'absolute',
          right: '-18%',
          width: metrics.glowSize * 0.82,
        } as ViewStyle,
        keyboardShell: {
          flex: 1,
        } as ViewStyle,
        scrollContent: {
          flexGrow: 1,
          justifyContent: 'center',
          paddingBottom: Math.max(metrics.cardTopBottomSpace, insets.bottom + spacing.lg),
          paddingTop: Math.max(metrics.cardTopBottomSpace, insets.top + spacing.lg),
        } as ViewStyle,
        cardWrap: {
          alignItems: 'center',
          justifyContent: 'center',
        } as ViewStyle,
        glowWrap: {
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: metrics.cardWidth,
        } as ViewStyle,
        glow: {
          backgroundColor: CARD_GLOW,
          borderRadius: radius.card * 2.6,
          bottom: '-4%',
          left: '7%',
          position: 'absolute',
          right: '7%',
          top: '-4%',
        } as ViewStyle,
        card: {
          backgroundColor: SURFACE,
          borderColor: BORDER,
          borderRadius: Math.max(radius.card, Math.min(width * 0.045, 18)),
          borderWidth: 1,
          overflow: 'hidden',
          paddingHorizontal: metrics.cardPadding,
          paddingVertical: metrics.cardPadding * 1.02,
          shadowColor: BRAND,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: Platform.OS === 'ios' ? 0.16 : 0.22,
          shadowRadius: 24,
          width: '100%',
        } as ViewStyle,
        brandText: {
          color: BRAND,
          fontSize: metrics.titleSize * 0.56,
          fontWeight: '800',
          letterSpacing: metrics.titleSize * 0.08,
          textAlign: 'center',
        } as TextStyle,
        welcomeText: {
          color: TEXT_PRIMARY,
          fontSize: metrics.welcomeSize,
          fontWeight: '800',
          lineHeight: metrics.welcomeSize * 1.15,
          textAlign: 'center',
        } as TextStyle,
        subtitleText: {
          color: TEXT_MUTED,
          fontSize: metrics.subtitleSize,
          lineHeight: metrics.subtitleSize * 1.55,
          textAlign: 'center',
        } as TextStyle,
        labelText: {
          color: TEXT_MUTED,
          fontSize: metrics.labelSize,
          fontWeight: '700',
          letterSpacing: metrics.labelSize * 0.12,
        } as TextStyle,
        forgotButton: {
          paddingVertical: '1%',
        } as ViewStyle,
        forgotText: {
          color: BRAND,
          fontSize: metrics.labelSize,
          fontWeight: '700',
        } as TextStyle,
        toggleButton: {
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '14%',
          paddingVertical: '2%',
        } as ViewStyle,
        toggleText: {
          color: BRAND,
          fontSize: metrics.labelSize,
          fontWeight: '700',
          letterSpacing: metrics.labelSize * 0.06,
        } as TextStyle,
        checkboxRow: {
          alignItems: 'center',
          justifyContent: 'flex-start',
        } as ViewStyle,
        checkboxHitArea: {
          alignItems: 'center',
          flexDirection: 'row',
          minHeight: metrics.fieldHeight * 0.72,
        } as ViewStyle,
        checkboxBox: {
          alignItems: 'center',
          backgroundColor: formik.values.rememberMe ? BRAND : FIELD_SURFACE,
          borderColor: formik.values.rememberMe ? BRAND : FIELD_BORDER,
          borderRadius: radius.control,
          borderWidth: 1.2,
          height: metrics.fieldHeight * 0.38,
          justifyContent: 'center',
          width: metrics.fieldHeight * 0.38,
        } as ViewStyle,
        checkboxTick: {
          color: formik.values.rememberMe ? '#08111A' : 'transparent',
          fontSize: metrics.bodySize,
          fontWeight: '800',
          lineHeight: metrics.bodySize * 1.1,
        } as TextStyle,
        checkboxLabel: {
          color: TEXT_MUTED,
          fontSize: metrics.bodySize * 0.94,
          marginLeft: '3.6%',
        } as TextStyle,
        inlineMessage: {
          color: FORM_ERROR,
          fontSize: metrics.bodySize * 0.84,
          lineHeight: metrics.bodySize * 1.35,
          marginTop: '2.2%',
        } as TextStyle,
        statusBanner: {
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          borderColor: FORM_ERROR_BORDER,
          borderRadius: radius.card,
          borderWidth: 1,
          paddingHorizontal: '4.6%',
          paddingVertical: '3.4%',
        } as ViewStyle,
        statusBannerText: {
          color: FORM_ERROR,
          fontSize: metrics.bodySize * 0.9,
          lineHeight: metrics.bodySize * 1.45,
          textAlign: 'center',
        } as TextStyle,
        button: {
          alignItems: 'center',
          backgroundColor: BRAND,
          borderRadius: radius.card,
          justifyContent: 'center',
          minHeight: metrics.buttonHeight,
          width: '100%',
        } as ViewStyle,
        buttonPressed: {
          opacity: 0.88,
          transform: [{ scale: 0.995 }],
        } as ViewStyle,
        buttonDisabled: {
          opacity: 0.6,
        } as ViewStyle,
        buttonText: {
          color: '#08111A',
          fontSize: metrics.bodySize * 1.03,
          fontWeight: '800',
          letterSpacing: metrics.bodySize * 0.02,
        } as TextStyle,
        buttonArrow: {
          color: '#08111A',
          fontSize: metrics.bodySize * 1.12,
          fontWeight: '800',
          marginLeft: '2%',
        } as TextStyle,
        divider: {
          backgroundColor: 'rgba(66, 71, 84, 0.92)',
          height: 1,
          width: '100%',
        } as ViewStyle,
        footerText: {
          color: TEXT_MUTED,
          fontSize: metrics.bodySize * 0.9,
        } as TextStyle,
        registerText: {
          color: BRAND,
          fontSize: metrics.bodySize * 0.9,
          fontWeight: '800',
          letterSpacing: metrics.bodySize * 0.06,
        } as TextStyle,
      }),
    [formik.values.rememberMe, insets.bottom, insets.top, metrics, width],
  );

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.root}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.root}>
        <Box style={styles.backgroundLayer} />
        <Box style={styles.backgroundGlowTop} />
        <Box style={styles.backgroundGlowBottom} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardShell}>
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Animated.View
              style={{
                opacity: cardOpacity,
                transform: [{ translateY: cardOffset }],
              }}>
              <Box style={styles.cardWrap}>
                <Box style={styles.glowWrap}>
                  <Box style={styles.glow} />
                  <Card style={styles.card}>
                    <VStack space="lg">
                      <VStack space="sm">
                        <Text style={styles.brandText}>AI STOCK TREND</Text>
                        <Text style={styles.welcomeText}>Welcome back</Text>
                        <Text style={styles.subtitleText}>
                          Sign in to your operational dashboard
                        </Text>
                      </VStack>

                      <VStack space="md">
                        <VStack space="xs">
                          <Text style={styles.labelText}>EMAIL ADDRESS</Text>
                          <LoginField
                            accessibilityLabel="Email address"
                            autoComplete="email"
                            fieldHeight={metrics.fieldHeight}
                            icon="@"
                            invalid={Boolean(formik.touched.email && formik.errors.email)}
                            keyboardType="email-address"
                            onBlur={() => void formik.setFieldTouched('email')}
                            onChangeText={(value) => {
                              clearError();
                              void formik.setFieldValue('email', value);
                            }}
                            onSubmitEditing={() => passwordRef.current?.focus()}
                            placeholder="operator@vn30.net"
                            returnKeyType="next"
                            textContentType="emailAddress"
                            value={formik.values.email}
                          />
                          {formik.touched.email && formik.errors.email ? (
                            <Text style={styles.inlineMessage}>{formik.errors.email}</Text>
                          ) : null}
                        </VStack>

                        <VStack space="xs">
                          <HStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.labelText}>PASSWORD</Text>
                            <Pressable onPress={() => Alert.alert('Forgot Password', 'Password recovery is currently handled through your operations team.')}>
                              <Text style={styles.forgotText}>Forgot Password?</Text>
                            </Pressable>
                          </HStack>
                          <LoginField
                            accessibilityLabel="Password"
                            autoComplete="password"
                            fieldHeight={metrics.fieldHeight}
                            icon="*"
                            inputRef={passwordRef}
                            invalid={Boolean(formik.touched.password && formik.errors.password)}
                            onBlur={() => void formik.setFieldTouched('password')}
                            onChangeText={(value) => {
                              clearError();
                              void formik.setFieldValue('password', value);
                            }}
                            onSubmitEditing={() => void formik.submitForm()}
                            placeholder="Enter your password"
                            returnKeyType="done"
                            rightAccessory={
                              <Pressable
                                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                                accessibilityRole="button"
                                onPress={() => setShowPassword((value) => !value)}
                                style={styles.toggleButton}>
                                <Text style={styles.toggleText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                              </Pressable>
                            }
                            secureTextEntry={!showPassword}
                            textContentType="password"
                            value={formik.values.password}
                          />
                          {formik.touched.password && formik.errors.password ? (
                            <Text style={styles.inlineMessage}>{formik.errors.password}</Text>
                          ) : null}
                        </VStack>

                        <HStack style={styles.checkboxRow}>
                          <Pressable
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: formik.values.rememberMe }}
                            onPress={() => void formik.setFieldValue('rememberMe', !formik.values.rememberMe)}
                            style={styles.checkboxHitArea}>
                            <Box style={styles.checkboxBox}>
                              <Text style={styles.checkboxTick}>✓</Text>
                            </Box>
                            <Text style={styles.checkboxLabel}>Remember me</Text>
                          </Pressable>
                        </HStack>
                      </VStack>

                      {errorMessage ? (
                        <Box style={styles.statusBanner}>
                          <Text style={styles.statusBannerText}>{errorMessage}</Text>
                        </Box>
                      ) : null}

                      <Pressable
                        accessibilityRole="button"
                        disabled={isSubmitting}
                        onPress={() => void formik.submitForm()}
                        style={({ pressed }) => [
                          styles.button,
                          pressed && !isSubmitting && styles.buttonPressed,
                          isSubmitting && styles.buttonDisabled,
                        ]}>
                        <HStack style={{ alignItems: 'center', justifyContent: 'center' }}>
                          {isSubmitting ? (
                            <>
                              <Spinner color="#08111A" size="small" />
                              <Text style={[styles.buttonText, { marginLeft: '3%' }]}>Signing in</Text>
                            </>
                          ) : (
                            <>
                              <Text style={styles.buttonText}>Login</Text>
                              <Text style={styles.buttonArrow}>→</Text>
                            </>
                          )}
                        </HStack>
                      </Pressable>

                      <VStack space="md">
                        <Divider style={styles.divider} />
                        <HStack style={{ alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                          <Pressable onPress={() => Alert.alert('Register', 'Registration is currently provisioned through the web platform.')}>
                            <Text style={styles.registerText}>REGISTER</Text>
                          </Pressable>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Card>
                </Box>
              </Box>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
