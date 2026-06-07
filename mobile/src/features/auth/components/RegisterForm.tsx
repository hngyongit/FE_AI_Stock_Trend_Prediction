import { useRef } from 'react';
import {
  Platform,
  Pressable as RNPressable,
  TextInput,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

import { Mail, Lock, Eye, EyeOff, User, RefreshCw } from 'lucide-react-native';

import { Box, HStack, Spinner, Text, VStack } from '@/shared/ui/primitives';
import { palette, radius } from '@/shared/design/tokens';
import { LoginField } from '@/features/auth/components/LoginField';
import type { RegisterFormValues } from '@/features/auth/types';

type RegisterFormProps = {
  formik: {
    values: RegisterFormValues;
    errors: Partial<Record<keyof RegisterFormValues, string>>;
    touched: Partial<Record<keyof RegisterFormValues, boolean>>;
    isSubmitting: boolean;
    isValid: boolean;
    handleSubmit: () => void;
    setFieldValue: (field: string, value: unknown) => void;
    setFieldTouched: (field: string) => void;
  };
  fieldErrors: Record<string, string>;
  errorMessage: string | null;
  successMessage: string | null;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onNavigateToLogin: () => void;
  metrics: {
    fieldHeight: number;
    bodySize: number;
    labelSize: number;
    buttonHeight: number;
  };
};

const FIELD_SURFACE = '#121A25';
const FIELD_BORDER = 'rgba(66, 71, 84, 0.92)';
const BRAND = palette.primary;
const FORM_ERROR = '#F8B4B4';
const FORM_ERROR_BORDER = 'rgba(239, 68, 68, 0.24)';
const TEXT_MUTED = palette.textSecondary;
const TEXT_PRIMARY = palette.textPrimary;

export function RegisterForm({
  formik,
  fieldErrors,
  errorMessage,
  successMessage,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  onNavigateToLogin,
  metrics,
}: RegisterFormProps) {
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);

  const isFormInvalid =
    formik.isSubmitting ||
    !formik.isValid ||
    !formik.values.agreeTerms;

  const getFieldError = (field: keyof RegisterFormValues): string | null => {
    if (fieldErrors[field]) return fieldErrors[field];
    if (formik.touched[field] && formik.errors[field]) return formik.errors[field] ?? null;
    return null;
  };

  const styles = {
    labelText: {
      color: palette.textSecondary,
      fontSize: metrics.labelSize,
      fontWeight: '700',
      letterSpacing: metrics.labelSize * 0.12,
    } as TextStyle,
    inlineMessage: {
      color: FORM_ERROR,
      fontSize: metrics.bodySize * 0.84,
      lineHeight: metrics.bodySize * 1.35,
      marginTop: '2%',
    } as TextStyle,
    helperText: {
      color: palette.textSecondary,
      fontSize: metrics.bodySize * 0.78,
      lineHeight: metrics.bodySize * 1.3,
      marginTop: '1.5%',
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
    successBanner: {
      backgroundColor: 'rgba(34, 197, 94, 0.12)',
      borderColor: 'rgba(34, 197, 94, 0.24)',
      borderRadius: radius.card,
      borderWidth: 1,
      paddingHorizontal: '4.6%',
      paddingVertical: '3.4%',
    } as ViewStyle,
    successBannerText: {
      color: palette.positive,
      fontSize: metrics.bodySize * 0.9,
      lineHeight: metrics.bodySize * 1.45,
      textAlign: 'center',
    } as TextStyle,
    buttonText: {
      color: '#0F172A',
      fontSize: metrics.bodySize * 1.03,
      fontWeight: '800',
      letterSpacing: metrics.bodySize * 0.02,
    } as TextStyle,
    buttonArrow: {
      color: '#0F172A',
      fontSize: metrics.bodySize * 1.12,
      fontWeight: '800',
      marginLeft: '2%',
    } as TextStyle,
    checkboxHitArea: {
      alignItems: 'center',
      flexDirection: 'row',
      minHeight: metrics.fieldHeight * 0.72,
    } as ViewStyle,
    checkboxBox: {
      alignItems: 'center',
      backgroundColor: formik.values.agreeTerms ? palette.primarySoft : FIELD_SURFACE,
      borderColor: formik.values.agreeTerms ? palette.primarySoft : FIELD_BORDER,
      borderRadius: 4,
      borderWidth: 1.2,
      height: metrics.fieldHeight * 0.38,
      justifyContent: 'center',
      width: metrics.fieldHeight * 0.38,
    } as ViewStyle,
    checkboxTick: {
      color: formik.values.agreeTerms ? '#0F172A' : 'transparent',
      fontSize: metrics.bodySize,
      fontWeight: '800',
    } as TextStyle,
    checkboxLabel: {
      color: palette.textSecondary,
      fontSize: metrics.bodySize * 0.88,
      lineHeight: metrics.bodySize * 1.35,
      marginLeft: '3.6%',
      flexShrink: 1,
    } as TextStyle,
    linkText: {
      color: BRAND,
      fontSize: metrics.bodySize * 0.88,
      lineHeight: metrics.bodySize * 1.35,
      fontWeight: '700',
    } as TextStyle,
    bottomLink: {
      color: palette.textSecondary,
      fontSize: metrics.bodySize * 0.92,
      lineHeight: metrics.bodySize * 1.5,
      textAlign: 'center',
    } as TextStyle,
    eyeToggle: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '14%',
      paddingVertical: '2%',
    } as ViewStyle,
    eyeIcon: {
      color: BRAND,
      fontSize: metrics.fieldHeight * 0.32,
      fontWeight: '700',
    } as TextStyle,
    confirmIcon: {
      color: TEXT_MUTED,
      fontSize: metrics.fieldHeight * 0.32,
      fontWeight: '700',
      textAlign: 'center',
    } as TextStyle,
  };

  return (
    <VStack space="md">
      {/* Full Name Field */}
      <VStack space="xs">
        <Text style={styles.labelText}>FULL NAME</Text>
        <LoginField
          accessibilityLabel="Full name"
          autoCapitalize="words"
          autoComplete="off"
          fieldHeight={metrics.fieldHeight}
          icon={<User color={palette.textSecondary} size={metrics.fieldHeight * 0.33} />}
          invalid={Boolean(getFieldError('fullName'))}
          keyboardType="default"
          onBlur={() => formik.setFieldTouched('fullName')}
          onChangeText={(value) => formik.setFieldValue('fullName', value)}
          onSubmitEditing={() => emailRef.current?.focus()}
          placeholder="Enter your full name"
          returnKeyType="next"
          textContentType="name"
          value={formik.values.fullName}
        />
        {getFieldError('fullName') ? (
          <Text style={styles.inlineMessage}>{getFieldError('fullName')}</Text>
        ) : null}
      </VStack>

      {/* Email Field */}
      <VStack space="xs">
        <Text style={styles.labelText}>EMAIL ADDRESS</Text>
        <LoginField
          accessibilityLabel="Email address"
          autoComplete="email"
          fieldHeight={metrics.fieldHeight}
          icon={<Mail color={palette.textSecondary} size={metrics.fieldHeight * 0.33} />}
          inputRef={emailRef}
          invalid={Boolean(getFieldError('email'))}
          keyboardType="email-address"
          onBlur={() => formik.setFieldTouched('email')}
          onChangeText={(value) => formik.setFieldValue('email', value)}
          onSubmitEditing={() => passwordRef.current?.focus()}
          placeholder="you@example.com"
          returnKeyType="next"
          textContentType="emailAddress"
          value={formik.values.email}
        />
        {getFieldError('email') ? (
          <Text style={styles.inlineMessage}>{getFieldError('email')}</Text>
        ) : null}
      </VStack>

      {/* Password Field */}
      <VStack space="xs">
        <Text style={styles.labelText}>PASSWORD</Text>
        <LoginField
          accessibilityLabel="Password"
          autoComplete="password"
          fieldHeight={metrics.fieldHeight}
          icon={<Lock color={palette.textSecondary} size={metrics.fieldHeight * 0.33} />}
          inputRef={passwordRef}
          invalid={Boolean(getFieldError('password'))}
          onBlur={() => formik.setFieldTouched('password')}
          onChangeText={(value) => formik.setFieldValue('password', value)}
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          placeholder="Enter your password"
          returnKeyType="next"
          rightAccessory={
            <RNPressable
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              accessibilityRole="button"
              onPress={onTogglePassword}
              style={styles.eyeToggle}>
              {showPassword ? <EyeOff color={BRAND} size={metrics.fieldHeight * 0.33} /> : <Eye color={BRAND} size={metrics.fieldHeight * 0.33} />}
            </RNPressable>
          }
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          value={formik.values.password}
        />
        {getFieldError('password') ? (
          <Text style={styles.inlineMessage}>{getFieldError('password')}</Text>
        ) : (
          <Text style={styles.helperText}>Must be at least 8 characters long.</Text>
        )}
      </VStack>

      {/* Confirm Password Field */}
      <VStack space="xs">
        <Text style={styles.labelText}>CONFIRM PASSWORD</Text>
        <LoginField
          accessibilityLabel="Confirm password"
          autoComplete="password"
          fieldHeight={metrics.fieldHeight}
          icon={<RefreshCw color={palette.textSecondary} size={metrics.fieldHeight * 0.33} />}
          inputRef={confirmPasswordRef}
          invalid={Boolean(getFieldError('confirmPassword'))}
          onBlur={() => formik.setFieldTouched('confirmPassword')}
          onChangeText={(value) => formik.setFieldValue('confirmPassword', value)}
          onSubmitEditing={() => formik.handleSubmit()}
          placeholder="Re-enter your password"
          returnKeyType="done"
          rightAccessory={
            <RNPressable
              accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              accessibilityRole="button"
              onPress={onToggleConfirmPassword}
              style={styles.eyeToggle}>
              {showConfirmPassword ? <EyeOff color={BRAND} size={metrics.fieldHeight * 0.33} /> : <Eye color={BRAND} size={metrics.fieldHeight * 0.33} />}
            </RNPressable>
          }
          secureTextEntry={!showConfirmPassword}
          textContentType="newPassword"
          value={formik.values.confirmPassword}
        />
        {getFieldError('confirmPassword') ? (
          <Text style={styles.inlineMessage}>{getFieldError('confirmPassword')}</Text>
        ) : null}
      </VStack>

      {/* Terms Checkbox */}
      <HStack style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <RNPressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: formik.values.agreeTerms }}
          onPress={() => formik.setFieldValue('agreeTerms', !formik.values.agreeTerms)}
          style={styles.checkboxHitArea}>
          <Box style={styles.checkboxBox}>
            <Text style={styles.checkboxTick}>✓</Text>
          </Box>
          <Text style={styles.checkboxLabel}>
            I agree to the{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </RNPressable>
      </HStack>
      {formik.touched.agreeTerms && formik.errors.agreeTerms ? (
        <Text style={styles.inlineMessage}>{formik.errors.agreeTerms}</Text>
      ) : null}

      {/* Error Banner */}
      {errorMessage ? (
        <Box style={styles.statusBanner}>
          <Text style={styles.statusBannerText}>{errorMessage}</Text>
        </Box>
      ) : null}

      {/* Success Banner */}
      {successMessage ? (
        <Box style={styles.successBanner}>
          <Text style={styles.successBannerText}>{successMessage}</Text>
        </Box>
      ) : null}

      {/* Submit Button */}
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.88}
        disabled={isFormInvalid || successMessage !== null}
        onPress={() => formik.handleSubmit()}
        style={{
          alignItems: 'center',
          backgroundColor: isFormInvalid ? 'rgba(173, 198, 255, 0.4)' : palette.primarySoft,
          borderRadius: radius.card,
          justifyContent: 'center',
          minHeight: metrics.buttonHeight,
          paddingHorizontal: 24,
          paddingVertical: 12,
          width: '100%',
        }}>
        <HStack style={{ alignItems: 'center', justifyContent: 'center' }}>
          {formik.isSubmitting ? (
            <>
              <Spinner color="#0F172A" size="small" />
              <Text style={[styles.buttonText, { marginLeft: '3%' }]}>Creating account</Text>
            </>
          ) : (
            <>
              <Text style={styles.buttonText}>Register Account</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </>
          )}
        </HStack>
      </TouchableOpacity>

      {/* Navigate to Login */}
      <HStack style={{ alignItems: 'center', justifyContent: 'center', paddingTop: '2%' }}>
        <Text style={styles.bottomLink}>
          Already have an account?{' '}
        </Text>
        <RNPressable onPress={onNavigateToLogin}>
          <Text style={[styles.linkText, { fontSize: metrics.bodySize * 0.92 }]}>Log in</Text>
        </RNPressable>
      </HStack>
    </VStack>
  );
}
