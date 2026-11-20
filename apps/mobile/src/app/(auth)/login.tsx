
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
import { Link, useRouter } from "expo-router";
import { LockKeyhole, Mail } from "lucide-react-native";

import { AuthBackground } from "@/components/auth/auth-background";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthInput } from "@/components/auth/auth-input";

import { useAuth } from "@/contexts/auth.context";
import { colors } from "@/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    const nextErrors = {
      email: "",
      password: ""
    };

    if (!normalizedEmail) {
      nextErrors.email = "Ingresa tu correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }

    if (!password) {
      nextErrors.password = "Ingresa tu contraseña.";
    }

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    try {
      setLoading(true);

      await signIn({
        email: normalizedEmail,
        password
      });

      router.replace("/(app)/(tabs)/home");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "";

      if (message.includes("401")) {
        Alert.alert(
          "No se pudo iniciar sesión",
          "El correo electrónico o la contraseña son incorrectos."
        );
      } else {
        Alert.alert(
          "Error de conexión",
          "No fue posible iniciar sesión. Verifica tu conexión e inténtalo nuevamente."
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
              title="Iniciar sesión"
              description="Accede a tu cuenta para administrar tus proyectos."
            >
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
                placeholder="Ingresa tu contraseña"
                value={password}
                onChangeText={setPassword}
                isPassword
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                error={errors.password}
              />

              <AuthButton
                title="Iniciar sesión"
                onPress={handleLogin}
                loading={loading}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  ¿No tienes una cuenta?{" "}
                </Text>

                <Link href="/(auth)/register" asChild>
                  <Pressable accessibilityRole="link">
                    <Text style={styles.footerLink}>
                      Regístrate
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
