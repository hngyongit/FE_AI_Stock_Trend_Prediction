import { useRef } from 'react';
import { Alert, TextInput, TextStyle, ViewStyle } from 'react-native';

import { Box, HStack, Pressable, Spinner, Text, VStack } from '@/shared/ui/primitives';
import { palette, radius } from '@/shared/design/tokens';
import { LoginField } from '@/features/auth/components/LoginField';
import type { LoginFormValues } from '@/features/auth/types';

type LoginFormProps = {
  formik: {
    values: LoginFormValues;
    errors: Partial<Record<keyof LoginFormValues, string>>;
    touched: Partial<Record<keyof LoginFormValues, boolean>>;
    isSubmitting: boolean;
    handleSubmit: () => void;
    setFieldValue: (field: string, value: unknown) => void;
    setFieldTouched: (field: string) => void;
  };
  errorMessage: string | null;
  showPassword: boolean;
  onTogglePassword: () => void;
  metrics: {
    fieldHeight: number;
    bodySize: number;
    labelSize: number;
    buttonHeight: number;
    cardPadding: number;
  };
};

export function LoginForm({
  formik,
  errorMessage,
  showPassword,
  onTogglePassword,
  metrics,
}: LoginFormProps) {
  const passwordRef = useRef<TextInput | null>(null);
  const FIELD_SURFACE = '#121A25';
  const FIELD_BORDER = 'rgba(66, 71, 84, 0.92)';
  const BRAND = palette.primary;
  const FORM_ERROR = '#F8B4B4';
  const FORM_ERROR_BORDER = 'rgba(239, 68, 68, 0.24)';

  const styles = {
    labelText: {
      color: palette.textSecondary,
      fontSize: metrics.labelSize,
      fontWeight: '700',
      letterSpacing: metrics.labelSize * 0.12,
    } as TextStyle,
    forgotText: {
      color: BRAND,
      fontSize: metrics.labelSize,
      fontWeight: '700',
    } as TextStyle,
    toggleText: {
      color: BRAND,
      fontSize: metrics.labelSize,
      fontWeight: '700',
      letterSpacing: metrics.labelSize * 0.06,
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
      borderRadius: 4,
      borderWidth: 1.2,
      height: metrics.fieldHeight * 0.38,
      justifyContent: 'center',
      width: metrics.fieldHeight * 0.38,
    } as ViewStyle,
    checkboxTick: {
      color: formik.values.rememberMe ? '#08111A' : 'transparent',
      fontSize: metrics.bodySize,
      fontWeight: '800',
    } as TextStyle,
    checkboxLabel: {
      color: palette.textSecondary,
      fontSize: metrics.bodySize * 0.94,
      marginLeft: '3.6%',
    } as TextStyle,
  };

  return (
    <VStack space="md">
      {/* Email Field */}
      <VStack space="xs">
        <Text style={styles.labelText}>EMAIL ADDRESS</Text>
        <LoginField
          accessibilityLabel="Email address"
          autoComplete="email"
          fieldHeight={metrics.fieldHeight}
          icon="@"
          invalid={Boolean(formik.touched.email && formik.errors.email)}
          keyboardType="email-address"
          onBlur={() => formik.setFieldTouched('email')}
          onChangeText={(value) => formik.setFieldValue('email', value)}
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

      {/* Password Field */}
      <VStack space="xs">
        <HStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.labelText}>PASSWORD</Text>
          <Pressable
            onPress={() =>
              Alert.alert(
                'Forgot Password',
                'Password recovery is currently handled through your operations team.'
              )
            }>
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
          onBlur={() => formik.setFieldTouched('password')}
          onChangeText={(value) => formik.setFieldValue('password', value)}
          onSubmitEditing={() => formik.handleSubmit()}
          placeholder="Enter your password"
          returnKeyType="done"
          rightAccessory={
            <Pressable
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              accessibilityRole="button"
              onPress={onTogglePassword}
              style={{ alignItems: 'center', justifyContent: 'center', minWidth: '14%', paddingVertical: '2%' }}>
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

      {/* Remember Me */}
      <HStack style={styles.checkboxRow}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: formik.values.rememberMe }}
          onPress={() => formik.setFieldValue('rememberMe', !formik.values.rememberMe)}
          style={styles.checkboxHitArea}>
          <Box style={styles.checkboxBox}>
            <Text style={styles.checkboxTick}>✓</Text>
          </Box>
          <Text style={styles.checkboxLabel}>Remember me</Text>
        </Pressable>
      </HStack>

      {/* Error Banner */}
      {errorMessage ? (
        <Box style={styles.statusBanner}>
          <Text style={styles.statusBannerText}>{errorMessage}</Text>
        </Box>
      ) : null}

      {/* Submit Button */}
      <Pressable
        accessibilityRole="button"
        disabled={formik.isSubmitting}
        onPress={() => formik.handleSubmit()}
        style={({ pressed }: { pressed: boolean }) => [
          styles.button,
          pressed && !formik.isSubmitting && styles.buttonPressed,
          formik.isSubmitting && styles.buttonDisabled,
        ]}>
        <HStack style={{ alignItems: 'center', justifyContent: 'center' }}>
          {formik.isSubmitting ? (
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
    </VStack>
  );
}