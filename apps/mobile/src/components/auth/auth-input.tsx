
import { useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { colors, borderRadius } from "@/constants/theme";

interface AuthInputProps extends TextInputProps {
  label: string;
  icon: ReactNode;
  error?: string;
  isPassword?: boolean;
}

export function AuthInput({
  label,
  icon,
  error,
  isPassword = false,
  secureTextEntry,
  ...props
}: AuthInputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const shouldHideText = isPassword
    ? !passwordVisible
    : secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null
        ]}
      >
        <View style={styles.icon}>{icon}</View>

        <TextInput
          {...props}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={shouldHideText}
          selectionColor={colors.primaryLight}
        />

        {isPassword && (
          <Pressable
            onPress={() => setPasswordVisible((value) => !value)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible
                ? "Ocultar contraseña"
                : "Mostrar contraseña"
            }
          >
            {passwordVisible ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500"
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceInput
  },
  inputError: {
    borderColor: colors.error
  },
  icon: {
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 12
  },
  error: {
    color: colors.error,
    fontSize: 12
  }
});
