'use client';
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';
import { palette, radius, spacing } from '@/shared/design/tokens';

type InputProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  inputStyle?: any;
};

function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry,
  disabled,
  multiline,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  style,
  inputStyle,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          error && styles.containerError,
          disabled && styles.containerDisabled,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          editable={!disabled}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            multiline ? styles.multiline : null,
            inputStyle,
          ]}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  label: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  container: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 44,
  },
  containerFocused: { borderColor: palette.primary, borderWidth: 2 },
  containerError: { borderColor: palette.negative },
  containerDisabled: { opacity: 0.4 },
  input: {
    color: palette.textPrimary,
    flex: 1,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputWithLeftIcon: { paddingLeft: spacing.xs },
  inputWithRightIcon: { paddingRight: spacing.xs },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  iconLeft: { paddingLeft: spacing.sm },
  iconRight: { paddingRight: spacing.sm },
  error: { color: palette.negative, fontSize: 12, marginTop: 2 },
});

Input.displayName = 'Input';
export { Input };
export type { InputProps };
