
import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
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
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  FilePlus2,
  AlignLeft
} from "lucide-react-native";

import { colors } from "@/constants/theme";
import { createProject } from "@/services/project.service";

export default function NewProjectScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (loading) return;

    const projectName = name.trim();
    const projectDescription = description.trim();

    if (!projectName) {
      Alert.alert(
        "Nombre obligatorio",
        "Ingresa un nombre para el proyecto."
      );
      return;
    }

    if (projectName.length > 100) {
      Alert.alert(
        "Nombre demasiado largo",
        "El nombre no puede superar 100 caracteres."
      );
      return;
    }

    if (projectDescription.length > 500) {
      Alert.alert(
        "Descripción demasiado larga",
        "La descripción no puede superar 500 caracteres."
      );
      return;
    }

    try {
      setLoading(true);

      await createProject({
        name: projectName,
        description: projectDescription || null
      });

      router.replace("/(app)/(tabs)/home");
    } catch {
      Alert.alert(
        "No se pudo crear el proyecto",
        "Verifica la conexión con el servidor e inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
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
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Volver"
            >
              <ArrowLeft
                size={23}
                color={colors.navy}
              />
            </Pressable>

            <View style={styles.heading}>
              <View style={styles.headingIcon}>
                <FilePlus2
                  size={28}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.title}>
                Nuevo proyecto
              </Text>

              <Text style={styles.subtitle}>
                Comienza configurando la información básica
                de tu proyecto de proyección.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>
                Nombre del proyecto
              </Text>

              <View style={styles.inputContainer}>
                <FilePlus2
                  size={20}
                  color={colors.textDarkSecondary}
                />

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej. Proyección de prueba"
                  placeholderTextColor="#91A1B6"
                  style={styles.input}
                  maxLength={100}
                  autoCapitalize="sentences"
                />
              </View>

              <Text style={styles.label}>
                Descripción
              </Text>

              <View style={styles.textAreaContainer}>
                <AlignLeft
                  size={20}
                  color={colors.textDarkSecondary}
                  style={styles.textAreaIcon}
                />

                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe brevemente tu proyecto..."
                  placeholderTextColor="#91A1B6"
                  style={styles.textArea}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>

              <Text style={styles.counter}>
                {description.length}/500
              </Text>

              <Pressable
                onPress={() => void handleCreate()}
                disabled={loading}
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed
                ]}
              >
                <LinearGradient
                  colors={[
                    colors.primaryLight,
                    colors.primary
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.buttonText}>
                      Crear proyecto
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight
  },
  safeArea: {
    flex: 1
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 28
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center"
  },
  heading: {
    gap: 12
  },
  headingIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.surfaceLightBlue,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textDark
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textDarkSecondary
  },
  card: {
    padding: 24,
    borderRadius: 26,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    gap: 16
  },
  label: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: "700"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    borderRadius: 14,
    paddingHorizontal: 15,
    backgroundColor: colors.backgroundLight
  },
  input: {
    flex: 1,
    color: colors.textDark,
    fontSize: 15
  },
  textAreaContainer: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    borderRadius: 14,
    padding: 15,
    backgroundColor: colors.backgroundLight
  },
  textAreaIcon: {
    marginTop: 3
  },
  textArea: {
    flex: 1,
    minHeight: 110,
    color: colors.textDark,
    fontSize: 15
  },
  counter: {
    textAlign: "right",
    color: colors.textDarkSecondary,
    fontSize: 12
  },
  button: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 10
  },
  buttonPressed: {
    opacity: 0.8
  },
  buttonGradient: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700"
  }
});
