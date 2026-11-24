
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useLocalSearchParams,
  useRouter
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Layers3,
  Plus
} from "lucide-react-native";

import { colors } from "@/constants/theme";
import { createSurface } from "@/services/surface.service";

export default function NewSurfaceScreen() {
  const router = useRouter();

  const { projectId } = useLocalSearchParams<{
    projectId: string;
  }>();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert(
        "Nombre obligatorio",
        "Introduce un nombre para la superficie."
      );
      return;
    }

    if (trimmedName.length > 100) {
      Alert.alert(
        "Nombre demasiado largo",
        "El nombre no puede superar 100 caracteres."
      );
      return;
    }

    if (!projectId || saving) {
      return;
    }

    setSaving(true);

    try {
      await createSurface(projectId, {
        name: trimmedName
      });

      router.back();
    } catch (error) {
      console.error(
        "[SURFACE] Creation failed:",
        error
      );

      Alert.alert(
        "No se pudo crear",
        "Ocurrió un problema al guardar la superficie."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          colors.backgroundLight,
          colors.backgroundLightSecondary,
          colors.backgroundLight
        ]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Regresar"
              disabled={saving}
            >
              <ArrowLeft
                size={23}
                color={colors.navy}
              />
            </Pressable>

            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Layers3
                  size={29}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.title}>
                Nueva superficie
              </Text>

              <Text style={styles.subtitle}>
                Crea una nueva región dentro del
                lienzo de proyección.
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>
                Información de la superficie
              </Text>

              <Text style={styles.label}>
                Nombre
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ej. Superficie principal"
                placeholderTextColor={
                  colors.textDarkSecondary
                }
                maxLength={100}
                autoCapitalize="sentences"
                editable={!saving}
                style={styles.input}
              />

              <Text style={styles.helperText}>
                Utiliza un nombre que permita
                identificar fácilmente esta región.
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                Configuración inicial
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Visibilidad
                </Text>
                <Text style={styles.infoValue}>
                  Visible
                </Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Opacidad
                </Text>
                <Text style={styles.infoValue}>
                  100 %
                </Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Capa
                </Text>
                <Text style={styles.infoValue}>
                  0
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => void handleCreate()}
              disabled={saving || !name.trim()}
              accessibilityRole="button"
              accessibilityLabel="Crear superficie"
              style={({ pressed }) => [
                styles.createButton,
                (pressed || saving || !name.trim()) &&
                  styles.buttonDisabled
              ]}
            >
              {saving ? (
                <ActivityIndicator
                  color={colors.white}
                />
              ) : (
                <Plus
                  size={20}
                  color={colors.white}
                />
              )}

              <Text style={styles.createButtonText}>
                {saving
                  ? "Creando superficie..."
                  : "Crear superficie"}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight
  },
  safeArea: {
    flex: 1
  },
  keyboardView: {
    flex: 1
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 22
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    gap: 12
  },
  headerIcon: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: colors.surfaceLightBlue,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    color: colors.textDark
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textDarkSecondary
  },
  formCard: {
    padding: 21,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    gap: 14
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textDark
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark
  },
  input: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.textDark
  },
  helperText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textDarkSecondary
  },
  infoCard: {
    padding: 21,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    gap: 17
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textDarkSecondary
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLightBlue
  },
  createButton: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white
  },
  buttonDisabled: {
    opacity: 0.6
  }
});
