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

import { Box, Text, Pressable } from '@/shared/ui/primitives';
import { palette, spacing } from '@/shared/design/tokens';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';
import type { RootScreenProps } from '@/app/navigation/navigation.types';

export function RegisterScreen({ navigation }: RootScreenProps<'Register'>) {
    const insets = useSafeAreaInsets();
    const { height, width } = useWindowDimensions();

    const {
        formik,
        showPassword,
        showConfirmPassword,
        setShowPassword,
        setShowConfirmPassword,
        fieldErrors,
        successMessage,
        errorMessage,
    } = useRegisterForm(() => {
        navigation.navigate('Login');
    });

    const metrics = useMemo(() => {
        const shortSide = Math.min(width, height);
        return {
            titleSize: Math.max(shortSide * 0.065, 24),
            subtitleSize: Math.max(shortSide * 0.035, 13),
            labelSize: Math.max(shortSide * 0.028, 11),
            bodySize: Math.max(shortSide * 0.037, 14),
            buttonHeight: Math.max(height * 0.066, 48),
            fieldHeight: Math.max(height * 0.068, 50),
            headerHeight: Math.max(height * 0.09, 64),
            safeHorizontal: Math.max(width * 0.055, 20),
        };
    }, [height, width]);

    const styles = StyleSheet.create({
        root: {
            backgroundColor: palette.background,
            flex: 1,
        } as ViewStyle,
        header: {
            alignItems: 'center',
            backgroundColor: palette.surfaceLow,
            borderBottomColor: palette.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
            flexDirection: 'row',
            minHeight: metrics.headerHeight,
            paddingBottom: Math.max(height * 0.014, spacing.sm),
            paddingHorizontal: metrics.safeHorizontal,
            paddingTop: Math.max(insets.top, spacing.sm),
        } as ViewStyle,
        backButton: {
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 40,
            minHeight: 40,
            marginRight: spacing.xs,
        } as ViewStyle,
        backChevron: {
            color: palette.textSecondary,
            fontSize: Math.max(metrics.titleSize * 0.7, 20),
            fontWeight: '600',
        } as TextStyle,
        headerTitle: {
            color: palette.primary,
            flex: 1,
            fontSize: metrics.titleSize * 0.52,
            fontWeight: '800',
            letterSpacing: metrics.titleSize * 0.08,
            textAlign: 'center',
            marginRight: 40, // Balance the back button
        } as TextStyle,
        scrollContent: {
            flexGrow: 1,
            paddingBottom: Math.max(insets.bottom + spacing.lg, 40),
            paddingTop: spacing.lg,
            paddingHorizontal: metrics.safeHorizontal,
        } as ViewStyle,
        titleText: {
            color: palette.textPrimary,
            fontSize: metrics.titleSize,
            fontWeight: '800',
            lineHeight: metrics.titleSize * 1.2,
        } as TextStyle,
        subtitleText: {
            color: palette.textSecondary,
            fontSize: metrics.subtitleSize,
            lineHeight: metrics.subtitleSize * 1.55,
            marginTop: spacing.sm,
        } as TextStyle,
    });

    return (
        <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.root}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.root}>
                    {/* Compact Header */}
                    <View style={styles.header}>
                        <Pressable
                            accessibilityLabel="Go back"
                            accessibilityRole="button"
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}>
                            <Text style={styles.backChevron}>←</Text>
                        </Pressable>
                        <Text style={styles.headerTitle}>AI STOCK TREND</Text>
                    </View>

                    {/* Form Area */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flex: 1 }}>
                        <ScrollView
                            bounces={false}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}>
                            <Box>
                                <Text style={styles.titleText}>Create Account</Text>
                                <Text style={styles.subtitleText}>
                                    Register to access professional trading dashboards and real-time alerts.
                                </Text>
                            </Box>

                            <Box style={{ height: spacing.xl }} />

                            <RegisterForm
                                formik={formik}
                                fieldErrors={fieldErrors}
                                errorMessage={errorMessage}
                                successMessage={successMessage}
                                showPassword={showPassword}
                                showConfirmPassword={showConfirmPassword}
                                onTogglePassword={() => setShowPassword((v) => !v)}
                                onToggleConfirmPassword={() => setShowConfirmPassword((v) => !v)}
                                onNavigateToLogin={() => navigation.navigate('Login')}
                                metrics={metrics}
                            />
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
