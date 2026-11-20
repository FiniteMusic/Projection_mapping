
import { useCallback, useState } from "react";
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
  useFocusEffect,
  useLocalSearchParams,
  useRouter
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  FilePenLine,
  Monitor,
  Palette,
  Save
} from "lucide-react-native";

import { colors } from "@/constants/theme";
import {
  getProject,
  updateProject
} from "@/services/project.service";

export default function EditProjectScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{
    projectId: string;
  }>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [backgroundColor, setBackgroundColor] =
    useState("#000000");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProject() {
        setLoading(true);
        setError(null);

        if (!projectId) {
          setError("Identificador de proyecto inválido.");
          setLoading(false);
          return;
        }

        try {
          const response = await getProject(projectId);

          if (!active) return;

          const project = response.project;

          setName(project.name);
          setDescription(project.description ?? "");
          setWidth(String(project.settings.canvas.width));
          setHeight(String(project.settings.canvas.height));
          setBackgroundColor(
            project.settings.backgroundColor
          );
        } catch {
          if (active) {
            setError("No fue posible cargar el proyecto.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      void loadProject();

      return () => {
        active = false;
      };
    }, [projectId, reloadKey])
  );

  async function handleSave() {
    if (saving || !projectId) return;

    const projectName = name.trim();
    const projectDescription = description.trim();
    const canvasWidth = Number(width);
    const canvasHeight = Number(height);
    const color = backgroundColor.trim();

    if (!projectName || projectName.length > 100) {
      Alert.alert(
        "Nombre inválido",
        "El nombre debe contener entre 1 y 100 caracteres."
      );
      return;
    }

    if (projectDescription.length > 500) {
      Alert.alert(
        "Descripción inválida",
        "La descripción no puede superar 500 caracteres."
      );
      return;
    }

    if (
      !Number.isInteger(canvasWidth) ||
      !Number.isInteger(canvasHeight) ||
      canvasWidth < 1 ||
      canvasWidth > 8192 ||
      canvasHeight < 1 ||
      canvasHeight > 8192
    ) {
      Alert.alert(
        "Resolución inválida",
        "El ancho y el alto deben ser números enteros entre 1 y 8192."
      );
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      Alert.alert(
        "Color inválido",
        "Introduce un color hexadecimal válido, por ejemplo #000000."
      );
      return;
    }

    try {
      setSaving(true);

      await updateProject(projectId, {
        name: projectName,
        description: projectDescription || null,
        settings: {
          canvas: {
            width: canvasWidth,
            height: canvasHeight
          },
          backgroundColor: color
        }
      });

      router.back();
    } catch {
      Alert.alert(
        "Error al guardar",
        "No fue posible actualizar el proyecto. Verifica la conexión con el servidor."
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
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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
            >
              <ArrowLeft size={23} color={colors.navy} />
            </Pressable>

            <View style={styles.heading}>
              <View style={styles.headingIcon}>
                <FilePenLine
                  size={28}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.title}>
                Editar proyecto
              </Text>

              <Text style={styles.subtitle}>
                Actualiza la información y configuración
                de tu proyecto.
              </Text>
            </View>

            {loading ? (
              <View style={styles.stateCard}>
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                />
                <Text style={styles.hint}>
                  Cargando información...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.stateCard}>
                <Text style={styles.hint}>{error}</Text>
                <Pressable
                  onPress={() =>
                    setReloadKey((value) => value + 1)
                  }
                >
                  <Text style={styles.retryText}>
                    Reintentar
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>
                    Información general
                  </Text>

                  <Text style={styles.label}>
                    Nombre del proyecto
                  </Text>

                  <TextInput
                    value={name}
                    onChangeText={setName}
                    maxLength={100}
                    placeholder="Nombre del proyecto"
                    placeholderTextColor="#91A1B6"
                    style={styles.input}
                  />

                  <Text style={styles.label}>
                    Descripción
                  </Text>

                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    maxLength={500}
                    multiline
                    textAlignVertical="top"
                    placeholder="Descripción del proyecto"
                    placeholderTextColor="#91A1B6"
                    style={[styles.input, styles.textArea]}
                  />

                  <Text style={styles.counter}>
                    {description.length}/500
                  </Text>
                </View>

                <View style={styles.card}>
                  <View style={styles.sectionHeading}>
                    <Monitor
                      size={21}
                      color={colors.primary}
                    />
                    <Text style={styles.sectionTitle}>
                      Configuración del lienzo
                    </Text>
                  </View>

                  <Text style={styles.label}>
                    Resolución (píxeles)
                  </Text>

                  <View style={styles.dimensionRow}>
                    <View style={styles.dimensionField}>
                      <Text style={styles.hint}>Ancho</Text>
                      <TextInput
                        value={width}
                        onChangeText={setWidth}
                        keyboardType="number-pad"
                        style={styles.input}
                        placeholder="1920"
                        placeholderTextColor="#91A1B6"
                      />
                    </View>

                    <View style={styles.dimensionField}>
                      <Text style={styles.hint}>Alto</Text>
                      <TextInput
                        value={height}
                        onChangeText={setHeight}
                        keyboardType="number-pad"
                        style={styles.input}
                        placeholder="1080"
                        placeholderTextColor="#91A1B6"
                      />
                    </View>
                  </View>

                  <View style={styles.sectionHeading}>
                    <Palette
                      size={21}
                      color={colors.primary}
                    />
                    <Text style={styles.label}>
                      Color de fondo
                    </Text>
                  </View>

                  <View style={styles.colorRow}>
                    <View
                      style={[
                        styles.colorPreview,
                        /^#[0-9A-Fa-f]{6}$/.test(
                          backgroundColor
                        ) && {
                          backgroundColor
                        }
                      ]}
                    />

                    <TextInput
                      value={backgroundColor}
                      onChangeText={setBackgroundColor}
                      autoCapitalize="characters"
                      maxLength={7}
                      style={[styles.input, styles.colorInput]}
                      placeholder="#000000"
                      placeholderTextColor="#91A1B6"
                    />
                  </View>
                </View>

                <Pressable
                  onPress={() => void handleSave()}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.saveButton,
                    pressed && styles.pressed
                  ]}
                >
                  <LinearGradient
                    colors={[
                      colors.primaryLight,
                      colors.primary
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveGradient}
                  >
                    {saving ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <>
                        <Save size={20} color={colors.white} />
                        <Text style={styles.saveText}>
                          Guardar cambios
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight
  },
  safeArea: { flex: 1 },
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
  heading: { gap: 12 },
  headingIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.surfaceLightBlue,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.textDark
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textDarkSecondary
  },
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    padding: 22,
    gap: 15
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  sectionTitle: {
    fontSize: 18,
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
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    borderRadius: 14,
    paddingHorizontal: 15,
    backgroundColor: colors.backgroundLight,
    color: colors.textDark,
    fontSize: 15
  },
  textArea: {
    minHeight: 105,
    paddingTop: 14
  },
  counter: {
    textAlign: "right",
    fontSize: 12,
    color: colors.textDarkSecondary
  },
  dimensionRow: {
    flexDirection: "row",
    gap: 12
  },
  dimensionField: {
    flex: 1,
    gap: 7
  },
  hint: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textDarkSecondary
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    backgroundColor: colors.navy
  },
  colorInput: { flex: 1 },
  stateCard: {
    minHeight: 180,
    backgroundColor: colors.surfaceLight,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 15
  },
  retryText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden"
  },
  pressed: { opacity: 0.75 },
  saveGradient: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  saveText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white
  }
});
