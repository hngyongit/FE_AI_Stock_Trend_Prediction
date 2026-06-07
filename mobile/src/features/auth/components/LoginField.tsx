import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/shared/ui/primitives';
import { palette } from '@/shared/design/tokens';

const FIELD_SURFACE = '#121A25';
const FIELD_BORDER = 'rgba(66, 71, 84, 0.92)';
const FIELD_BORDER_FOCUS = 'rgba(173, 198, 255, 0.58)';
const FORM_ERROR_BORDER = 'rgba(239, 68, 68, 0.24)';
const BRAND = palette.primary;
const TEXT_PRIMARY = palette.textPrimary;
const TEXT_MUTED = palette.textSecondary;

type LoginFieldProps = {
  accessibilityLabel: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  autoCorrect?: boolean;
  fieldHeight: number;
  icon?: React.ReactNode;
  iconText?: string;
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
  textContentType?: string;
  value: string;
};

export function LoginField({
  accessibilityLabel,
  autoCapitalize = 'none',
  autoComplete,
  autoCorrect = false,
  fieldHeight,
  icon,
  iconText,
  inputRef,
  invalid,
  keyboardType,
  onBlur,
  onChangeText,
  onSubmitEditing,
  placeholder,
  returnKeyType,
  rightAccessory,
  secureTextEntry,
  textContentType,
  value,
}: LoginFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        fieldShell: {
          alignItems: 'center',
          backgroundColor: FIELD_SURFACE,
          borderColor: invalid ? FORM_ERROR_BORDER : isFocused ? FIELD_BORDER_FOCUS : FIELD_BORDER,
          borderRadius: 14,
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
      {icon ? (
        <View style={{ width: '9%', alignItems: 'center' }}>{icon}</View>
      ) : iconText ? (
        <Text style={styles.leading}>{iconText}</Text>
      ) : null}
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