
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Link } from "expo-router";
import { LockKeyhole, Mail, UserRound } from "lucide-react-native";

import { AuthBackground } from "@/components/auth/auth-background";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthInput } from "@/components/auth/auth-input";

import { useAuth } from "@/contexts/auth.context";
import { colors } from "@/constants/theme";

interface FormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  async function handleRegister() {
    if (loading) return;

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const nextErrors: FormErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    };

    if (normalizedName.length < 2) {
      nextErrors.name = "Ingresa al menos 2 caracteres.";
    } else if (normalizedName.length > 100) {
      nextErrors.name = "El nombre no puede superar 100 caracteres.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    } else if (normalizedEmail.length > 254) {
      nextErrors.email = "El correo electrónico es demasiado largo.";
    }

    if (password.length < 8) {
      nextErrors.password = "Utiliza al menos 8 caracteres.";
    } else if (password.length > 128) {
      nextErrors.password = "La contraseña no puede superar 128 caracteres.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirma tu contraseña.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    try {
      setLoading(true);

      await signUp({
        name: normalizedName,
        email: normalizedEmail,
        password
      });

      // Stack.Protected habilita automáticamente
      // el grupo (app) cuando cambia isAuthenticated.
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "";

      if (message.includes("409")) {
        Alert.alert(
          "Correo ya registrado",
          "Ya existe una cuenta con este correo electrónico."
        );
      } else {
        Alert.alert(
          "No se pudo crear la cuenta",
          "Verifica tus datos y la conexión con el servidor."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <AuthHeader />

            <AuthCard
              title="Crear cuenta"
              description="Comienza a crear y gestionar tus propios proyectos."
            >
              <AuthInput
                label="Nombre completo"
                icon={
                  <UserRound
                    size={20}
                    color={colors.textSecondary}
                  />
                }
                placeholder="Tu nombre completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                error={errors.name}
              />

              <AuthInput
                label="Correo electrónico"
                icon={
                  <Mail
                    size={20}
                    color={colors.textSecondary}
                  />
                }
                placeholder="correo@ejemplo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                error={errors.email}
              />

              <AuthInput
                label="Contraseña"
                icon={
                  <LockKeyhole
                    size={20}
                    color={colors.textSecondary}
                  />
                }
                placeholder="Crea una contraseña"
                value={password}
                onChangeText={setPassword}
                isPassword
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                error={errors.password}
              />

              <Text style={styles.helper}>
                La contraseña debe tener al menos 8 caracteres.
              </Text>

              <AuthInput
                label="Confirmar contraseña"
                icon={
                  <LockKeyhole
                    size={20}
                    color={colors.textSecondary}
                  />
                }
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                error={errors.confirmPassword}
              />

              <AuthButton
                title="Crear cuenta"
                onPress={handleRegister}
                loading={loading}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  ¿Ya tienes una cuenta?{" "}
                </Text>

                <Link href="/(auth)/login" asChild>
                  <Pressable accessibilityRole="link">
                    <Text style={styles.footerLink}>
                      Inicia sesión
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </AuthCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32
  },
  content: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: 32
  },
  helper: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -8
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 8
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14
  },
  footerLink: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: "700"
  }
});
