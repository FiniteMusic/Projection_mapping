
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
  Eye,
  Layers3,
  Move,
  Save,
  Trash2,
  X,
  ImageIcon
} from "lucide-react-native";

import type { MediaAsset, Surface } from "@projection/shared";

import { colors } from "@/constants/theme";
import {
  deleteSurface,
  getSurface,
  updateSurface
} from "@/services/surface.service";

import { getProjectMedia } from "@/services/media.service";
import MediaThumbnail from "@/components/media/MediaThumbnail";

export default function SurfaceDetailScreen() {
  const router = useRouter();

  const { surfaceId } = useLocalSearchParams<{
    surfaceId: string;
  }>();

  const [surface, setSurface] = useState<Surface | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [name, setName] = useState("");
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(100);
  const [zIndex, setZIndex] = useState("0");

  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [assignedMedia, setAssignedMedia] = useState<MediaAsset | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadSurface() {
        setLoading(true);
        setError(null);

        if (!surfaceId) {
          setError("No se recibió una superficie válida.");
          setLoading(false);
          return;
        }

        try {
          const response = await getSurface(surfaceId);

          if (!active) return;

          const data = response.surface;

          setAssignedMedia(null);

          if (data.mediaId) {
            try {
              const mediaResponse = await getProjectMedia(data.projectId);

              if (!active) return;

              const selectedMedia = mediaResponse.media.find(
                (item) => item.id === data.mediaId
              );

              setAssignedMedia(selectedMedia ?? null);
            } catch (error) {
              console.error(
                "[SURFACE] Error loading assigned media:",
                error
              );
            }
          }

          setSurface(data);
          setName(data.name);
          setVisible(data.visible);
          setOpacity(Math.round(data.opacity * 100));
          setZIndex(String(data.zIndex));
        } catch {
          if (active) {
            setError("No fue posible cargar la superficie.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      void loadSurface();

      return () => {
        active = false;
      };
    }, [surfaceId, reloadKey])
  );

 const busy = saving || deleting || savingMedia;

  const hasChanges =
    surface !== null &&
    (
      name.trim() !== surface.name ||
      visible !== surface.visible ||
      opacity !== Math.round(surface.opacity * 100) ||
      zIndex.trim() !== String(surface.zIndex)
    );


async function openMediaSelector() {
  if (!surface || busy) return;

  setMediaModalVisible(true);
  setLoadingMedia(true);
  setMediaError(null);

  try {
    const response = await getProjectMedia(surface.projectId);
    setMediaList(response.media);
  } catch (error) {
    console.error("[SURFACE] Media loading failed:", error);
    setMediaError("No fue posible cargar los recursos multimedia.");
  } finally {
    setLoadingMedia(false);
  }
}

async function assignMedia(mediaId: string | null) {
  if (!surface || busy) return;

  if (surface.mediaId === mediaId) {
    setMediaModalVisible(false);
    return;
  }

  try {
    setSavingMedia(true);

    const response = await updateSurface(surface.id, {
      mediaId
    });

    setSurface(response.surface);
    setAssignedMedia(
      mediaId
        ? mediaList.find((item) => item.id === mediaId) ?? null
        : null
    );
    setMediaModalVisible(false);

    Alert.alert(
      "Contenido actualizado",
      mediaId
        ? "El recurso multimedia se asignó correctamente."
        : "El recurso multimedia se desvinculó correctamente."
    );
  } catch (error) {
    console.error("[SURFACE] Media assignment failed:", error);

    Alert.alert(
      "Error",
      "No fue posible actualizar el contenido de la superficie."
    );
  } finally {
    setSavingMedia(false);
  }
}




  async function handleSave() {
    if (!surfaceId || !surface || busy) return;

    const trimmedName = name.trim();
    const trimmedZIndex = zIndex.trim();
    const parsedZIndex = Number(trimmedZIndex);

    if (!trimmedName || trimmedName.length > 100) {
      Alert.alert(
        "Nombre inválido",
        "El nombre debe contener entre 1 y 100 caracteres."
      );
      return;
    }

    if (
      !/^-?\d+$/.test(trimmedZIndex) ||
      !Number.isSafeInteger(parsedZIndex)
    ) {
      Alert.alert(
        "Orden de capa inválido",
        "Introduce un número entero válido."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await updateSurface(surfaceId, {
        name: trimmedName,
        visible,
        opacity: opacity / 100,
        zIndex: parsedZIndex
      });

      const updated = response.surface;

      setSurface(updated);
      setName(updated.name);
      setVisible(updated.visible);
      setOpacity(Math.round(updated.opacity * 100));
      setZIndex(String(updated.zIndex));

      Alert.alert(
        "Cambios guardados",
        "La superficie se actualizó correctamente."
      );
    } catch {
      Alert.alert(
        "Error",
        "No fue posible actualizar la superficie."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!surfaceId || busy) return;

    Alert.alert(
      "Eliminar superficie",
      "¿Deseas eliminar esta superficie? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteSurface(surfaceId);
              router.back();
            } catch {
              Alert.alert(
                "Error",
                "No fue posible eliminar la superficie."
              );
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Regresar"
            style={styles.backButton}
            disabled={busy}
          >
            <ArrowLeft size={23} color={colors.navy} />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Layers3 size={29} color={colors.primary} />
            </View>

            <Text style={styles.title}>
              Detalle de superficie
            </Text>

            <Text style={styles.subtitle}>
              Consulta y modifica las propiedades
              de esta región de proyección.
            </Text>
          </View>

          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
              <Text style={styles.muted}>
                Cargando superficie...
              </Text>
            </View>
          ) : error || !surface ? (
            <View style={styles.stateCard}>
              <Text style={styles.sectionTitle}>
                No se pudo cargar la superficie
              </Text>

              <Text style={styles.muted}>
                {error ?? "No se encontraron datos."}
              </Text>

              <Pressable
                onPress={() => setReloadKey((v) => v + 1)}
              >
                <Text style={styles.retry}>Reintentar</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Información general
                </Text>

                <Text style={styles.label}>
                  Nombre de la superficie
                </Text>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Nombre de la superficie"
                  placeholderTextColor={colors.textDarkSecondary}
                  maxLength={100}
                  editable={!busy}
                  style={styles.input}
                />

                <Text style={styles.helper}>
                  Identifica esta región dentro del proyecto.
                </Text>
              </View>
            

              <View style={styles.card}>
                <View style={styles.sectionHeading}>
                  <ImageIcon size={20} color={colors.primary} />

                  <Text style={styles.sectionTitle}>
                    Contenido multimedia
                  </Text>
                </View>

                <Text style={styles.helper}>
                  Selecciona la imagen o video que se mostrará
                  sobre esta superficie.
                </Text>

                  {surface.mediaId && assignedMedia ? (
                  <View style={styles.assignedMediaCard}>
                    <MediaThumbnail media={assignedMedia} />

                    <View style={styles.assignedMediaInfo}>
                      <Text
                        style={styles.settingTitle}
                        numberOfLines={2}
                      >
                        {assignedMedia.name}
                      </Text>

                      <Text style={styles.helper}>
                        {assignedMedia.dimensions.width} ×{" "}
                        {assignedMedia.dimensions.height}
                      </Text>

                      <Text style={styles.assignedMediaStatus}>
                        Recurso asignado
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.helper}>
                    {surface.mediaId
                      ? "No fue posible cargar la información del recurso."
                      : "Esta superficie no tiene contenido multimedia."}
                  </Text>
                )}

                <Pressable
                  style={styles.geometryButton}
                  onPress={() => void openMediaSelector()}
                  disabled={busy}
                  accessibilityRole="button"
                >
                  <ImageIcon size={20} color={colors.primary} />

                  <Text style={styles.geometryButtonText}>
                    {surface.mediaId
                      ? "Cambiar recurso"
                      : "Seleccionar recurso"}
                  </Text>
                </Pressable>

                {surface.mediaId && (
                  <Pressable
                    style={styles.removeMediaButton}
                    onPress={() => void assignMedia(null)}
                    disabled={busy}
                    accessibilityRole="button"
                  >
                    <X size={18} color={colors.error} />

                    <Text style={styles.removeMediaText}>
                      Desvincular recurso
                    </Text>
                  </Pressable>
                )}
              </View>


              <View style={styles.card}>
                <View style={styles.sectionHeading}>
                  <Eye size={20} color={colors.primary} />
                  <Text style={styles.sectionTitle}>
                    Visualización
                  </Text>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>
                      Superficie visible
                    </Text>
                    <Text style={styles.helper}>
                      Controla si la superficie se muestra
                      en la proyección.
                    </Text>
                  </View>

                  <Switch
                    value={visible}
                    onValueChange={setVisible}
                    disabled={busy}
                    trackColor={{
                      false: colors.borderLightBlue,
                      true: colors.primaryLight
                    }}
                    thumbColor={
                      visible ? colors.primary : colors.white
                    }
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.settingRow}>
                  <Text style={styles.settingTitle}>
                    Opacidad
                  </Text>
                  <Text style={styles.valueText}>
                    {opacity}%
                  </Text>
                </View>

                <View style={styles.stepper}>
                  <Pressable
                    onPress={() =>
                      setOpacity((v) => Math.max(0, v - 10))
                    }
                    disabled={busy || opacity === 0}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>−</Text>
                  </Pressable>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${opacity}%` }
                      ]}
                    />
                  </View>

                  <Pressable
                    onPress={() =>
                      setOpacity((v) => Math.min(100, v + 10))
                    }
                    disabled={busy || opacity === 100}
                    style={styles.stepButton}
                  >
                    <Text style={styles.stepText}>+</Text>
                  </Pressable>
                </View>

                <Text style={styles.helper}>
                  Ajusta la transparencia en incrementos
                  de 10 puntos porcentuales.
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Orden de capa
                </Text>

                <Text style={styles.helper}>
                  Las superficies con un valor mayor
                  se muestran encima de las que tienen
                  un valor menor.
                </Text>

                <TextInput
                  value={zIndex}
                  onChangeText={setZIndex}
                  keyboardType="numbers-and-punctuation"
                  placeholder="0"
                  placeholderTextColor={colors.textDarkSecondary}
                  editable={!busy}
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={() => void handleSave()}
                disabled={busy || !hasChanges}
                accessibilityRole="button"
                style={[
                  styles.saveButton,
                  (busy || !hasChanges) && styles.disabledButton
                ]}
              >
                {saving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Save size={20} color={colors.white} />
                )}

                <Text style={styles.saveButtonText}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                    if (!surfaceId) return;

                    router.push({
                    pathname: "/(app)/project/surfaces/editor/[surfaceId]",
                    params: { surfaceId }
                    });
                }}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Editar geometría"
                style={[styles.geometryButton, busy && styles.disabledButton]}
                >
                <Move size={20} color={colors.primary} />

                <Text style={styles.geometryButtonText}>
                    Editar geometría
                </Text>
                </Pressable>

              <View style={styles.dangerCard}>
                <Text style={styles.sectionTitle}>
                  Eliminar superficie
                </Text>

                <Text style={styles.helper}>
                  Esta acción eliminará la superficie
                  del proyecto de forma permanente.
                </Text>

                <Pressable
                  onPress={handleDelete}
                  disabled={busy}
                  accessibilityRole="button"
                  style={[
                    styles.deleteButton,
                    busy && styles.disabledButton
                  ]}
                >
                  {deleting ? (
                    <ActivityIndicator color={colors.error} />
                  ) : (
                    <Trash2 size={19} color={colors.error} />
                  )}

                  <Text style={styles.deleteButtonText}>
                    {deleting
                      ? "Eliminando..."
                      : "Eliminar superficie"}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={mediaModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!savingMedia) setMediaModalVisible(false);
        }}
      >
        <View style={styles.mediaModalOverlay}>
          <View style={styles.mediaModalCard}>
            <View style={styles.mediaModalHeader}>
              <Text style={styles.sectionTitle}>
                Seleccionar recurso
              </Text>

              <Pressable
                onPress={() => setMediaModalVisible(false)}
                disabled={savingMedia}
                accessibilityRole="button"
                accessibilityLabel="Cerrar selector"
              >
                <X size={23} color={colors.textDark} />
              </Pressable>
            </View>

            {loadingMedia ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
            ) : mediaError ? (
              <Text style={styles.muted}>
                {mediaError}
              </Text>
            ) : mediaList.length === 0 ? (
              <Text style={styles.muted}>
                Este proyecto todavía no tiene recursos multimedia.
              </Text>
            ) : (
              <ScrollView
                contentContainerStyle={styles.mediaModalList}
                showsVerticalScrollIndicator={false}
              >
                {mediaList
                  .filter((item) => item.status === "ready")
                  .map((item) => (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.mediaOption,
                        surface?.mediaId === item.id &&
                          styles.mediaOptionSelected
                      ]}
                      onPress={() => void assignMedia(item.id)}
                      disabled={savingMedia}
                      accessibilityRole="button"
                    >
                      <MediaThumbnail media={item} />

                      <View style={styles.mediaOptionInfo}>
                        <Text
                          style={styles.settingTitle}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>

                        <Text style={styles.helper}>
                          {item.dimensions.width} ×{" "}
                          {item.dimensions.height}
                        </Text>
                      </View>

                      {surface?.mediaId === item.id && (
                        <Text style={styles.selectedLabel}>
                          Asignado
                        </Text>
                      )}
                    </Pressable>
                  ))}
              </ScrollView>
            )}

            {savingMedia && (
              <ActivityIndicator
                size="small"
                color={colors.primary}
              />
            )}
          </View>
        </View>
      </Modal>

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
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20
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
    fontSize: 28,
    fontWeight: "800",
    color: colors.textDark
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textDarkSecondary
  },
  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    gap: 15
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
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
    minHeight: 52,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    color: colors.textDark,
    fontSize: 15
  },
  helper: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textDarkSecondary
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  settingText: {
    flex: 1,
    gap: 5
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textDark
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLightBlue
  },
  valueText: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.primary
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  stepButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.surfaceLightBlue,
    alignItems: "center",
    justifyContent: "center"
  },
  stepText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.borderLightBlue,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 5
  },
  muted: {
    fontSize: 14,
    color: colors.textDarkSecondary,
    textAlign: "center"
  },
  stateCard: {
    minHeight: 210,
    padding: 24,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    gap: 14
  },
  retry: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary
  },
  saveButton: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800"
  },
  disabledButton: {
    opacity: 0.5
  },
  dangerCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    gap: 14
  },
  deleteButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.error
  },
  geometryButton: {
  minHeight: 56,
  borderRadius: 16,
  backgroundColor: colors.surfaceLight,
  borderWidth: 1,
  borderColor: colors.borderLightBlue,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 10
},
geometryButtonText: {
  fontSize: 15,
  fontWeight: "800",
  color: colors.primary
},
removeMediaButton: {
  minHeight: 44,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8
},
removeMediaText: {
  fontSize: 14,
  fontWeight: "700",
  color: colors.error
},
mediaModalOverlay: {
  flex: 1,
  justifyContent: "flex-end",
  backgroundColor: "rgba(12, 25, 48, 0.5)"
},
mediaModalCard: {
  maxHeight: "80%",
  minHeight: 250,
  backgroundColor: colors.surfaceLight,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 24,
  gap: 20
},
mediaModalHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
},
mediaModalList: {
  gap: 12,
  paddingBottom: 20
},
mediaOption: {
  flexDirection: "row",
  alignItems: "center",
  padding: 12,
  borderWidth: 1,
  borderColor: colors.borderLightBlue,
  borderRadius: 14,
  gap: 12
},
mediaOptionSelected: {
  borderColor: colors.primary,
  backgroundColor: colors.surfaceLightBlue
},
mediaOptionInfo: {
  flex: 1,
  gap: 4
},
selectedLabel: {
  fontSize: 12,
  fontWeight: "700",
  color: colors.primary
},
assignedMediaCard: {
  flexDirection: "row",
  alignItems: "center",
  padding: 14,
  borderRadius: 14,
  backgroundColor: colors.surfaceLightBlue,
  borderWidth: 1,
  borderColor: colors.borderLightBlue,
  gap: 14
},
assignedMediaInfo: {
  flex: 1,
  gap: 5
},
assignedMediaStatus: {
  fontSize: 12,
  fontWeight: "700",
  color: colors.primary
}
});
