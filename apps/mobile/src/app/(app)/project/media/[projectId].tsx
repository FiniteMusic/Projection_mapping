
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
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
  FileImage,
  ImagePlus,
  MoreVertical,
  RefreshCw,
  Plus
} from "lucide-react-native";

import type { MediaAsset } from "@projection/shared";

import { colors } from "@/constants/theme";
import {
  deleteMedia,
  getProjectMedia,
  updateMedia,
  uploadMedia
} from "@/services/media.service";
import MediaThumbnail from "@/components/media/MediaThumbnail";
import * as ImagePicker from "expo-image-picker";

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ProjectMediaScreen() {
  const router = useRouter();


  const [selectedAsset, setSelectedAsset] =
  useState<ImagePicker.ImagePickerAsset | null>(null);

const [uploadName, setUploadName] = useState("");
  const [uploading, setUploading] = useState(false);
  const { projectId } = useLocalSearchParams<{
    projectId: string;
  }>();

  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<MediaAsset | null>(null);
  const [newName, setNewName] = useState("");

  const loadMedia = useCallback(async () => {
    if (!projectId) {
      setError("No se recibió un proyecto válido.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);

      const response = await getProjectMedia(projectId);

      setMedia(response.media);
    } catch {
      setError("No fue posible cargar los recursos multimedia.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadMedia();
    }, [loadMedia])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadMedia();
  }

  async function handleDelete(item: MediaAsset) {
    if (deletingId || renamingId || uploading) {
      return;
    }

    setDeletingId(item.id);

    try {
      await deleteMedia(item.id);

      setMedia((current) =>
        current.filter((resource) => resource.id !== item.id)
      );
    } catch (error) {
      console.error("[MEDIA] Delete failed:", error);

      Alert.alert(
        "Error al eliminar",
        "No fue posible eliminar el recurso multimedia. Inténtalo nuevamente."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function openOptions(item: MediaAsset) {
    if (deletingId || renamingId || uploading) return;

    Alert.alert(item.name, "Selecciona una acción", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Renombrar",
        onPress: () => {
          setRenameTarget(item);
          setNewName(item.name);
        }
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => confirmDelete(item)
      }
    ]);
  }

  function closeRename() {
    if (renamingId) return;
    setRenameTarget(null);
    setNewName("");
  }

  async function handleRename() {
    if (!renameTarget || renamingId || deletingId || uploading) return;

    const name = newName.trim();
    if (!name || name.length > 120 || /[\u0000-\u001F\u007F]/.test(name)) {
      Alert.alert("Nombre no válido", "Introduce un nombre de 1 a 120 caracteres sin caracteres de control.");
      return;
    }

    if (name === renameTarget.name) {
      closeRename();
      return;
    }

    setRenamingId(renameTarget.id);
    try {
      const response = await updateMedia(renameTarget.id, { name });
      setMedia(current => current.map(item =>
        item.id === renameTarget.id ? response.media : item
      ));
      setRenameTarget(null);
      setNewName("");
    } catch (error) {
      console.error("[MEDIA] Rename failed:", error);
      Alert.alert("Error al renombrar", "No fue posible guardar el nuevo nombre. Inténtalo nuevamente.");
    } finally {
      setRenamingId(null);
    }
  }

  function confirmDelete(item: MediaAsset) {
    if (deletingId || renamingId || uploading) {
      return;
    }

    Alert.alert(
      "Eliminar recurso",
      `¿Deseas eliminar "${item.name}"?\n\nEsta acción es permanente. Si el recurso está asignado a una superficie, dejará de estar disponible en ella.`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void handleDelete(item);
          }
        }
      ]
    );
  }



async function handleUpload() {
  if (
    !projectId ||
    uploading ||
    deletingId ||
    renamingId ||
    renameTarget ||
    selectedAsset
  ) {
    return;
  }

  try {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tus archivos multimedia."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: false,
      quality: 1
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const asset = result.assets[0];

    const originalName =
      asset.fileName ??
      `recurso-${Date.now()}${asset.type === "video" ? ".mp4" : ".jpg"}`;

    const suggestedName = originalName
      .replace(/\.[^.]+$/, "")
      .replace(
        /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i,
        ""
      )
      .trim();

    setSelectedAsset(asset);
    setUploadName(suggestedName || "");
  } catch (error) {
    console.error("[MEDIA] File selection failed:", error);

    Alert.alert(
      "Error de selección",
      "No fue posible seleccionar el archivo."
    );
  }
}

function closeUpload() {
  if (uploading) return;

  setSelectedAsset(null);
  setUploadName("");
}

async function confirmUpload() {
  if (
    !projectId ||
    !selectedAsset ||
    uploading ||
    deletingId ||
    renamingId
  ) {
    return;
  }

  const name = uploadName.trim();

  if (
    !name ||
    name.length > 120 ||
    /[\u0000-\u001F\u007F]/.test(name)
  ) {
    Alert.alert(
      "Nombre no válido",
      "Introduce un nombre de 1 a 120 caracteres."
    );
    return;
  }

  const asset = selectedAsset;

  const fileName =
    asset.fileName ??
    `recurso-${Date.now()}${asset.type === "video" ? ".mp4" : ".jpg"}`;

  const mimeType =
    asset.mimeType ??
    (asset.type === "video" ? "video/mp4" : "image/jpeg");

  setUploading(true);

  try {
    await uploadMedia(
      projectId,
      {
        uri: asset.uri,
        name: fileName,
        mimeType
      },
      name
    );

    setSelectedAsset(null);
    setUploadName("");

    await loadMedia();

    Alert.alert(
      "Carga completada",
      `"${name}" se agregó correctamente al proyecto.`
    );
  } catch (error) {
    console.error("[MEDIA] Upload failed:", error);

    Alert.alert(
      "Error al cargar",
      "No fue posible cargar el recurso. Verifica su formato, tamaño y conexión."
    );
  } finally {
    setUploading(false);
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
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Regresar"
          >
            <ArrowLeft size={23} color={colors.navy} />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>
              Recursos multimedia
            </Text>

            <Text style={styles.subtitle}>
              Administra las imágenes y videos de tu proyecto.
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <FileImage size={25} color={colors.primary} />
            </View>

            <View>
              <Text style={styles.summaryNumber}>
                {media.length}
              </Text>

              <Text style={styles.summaryLabel}>
                Recursos registrados
              </Text>
            </View>
          </View>
          

          <Pressable
            style={[
              styles.uploadButton,
              uploading && styles.uploadButtonDisabled
            ]}
            onPress={() => {
              void handleUpload();
            }}
            disabled={uploading || deletingId !== null || renamingId !== null || renameTarget !== null}
            accessibilityRole="button"
            accessibilityLabel="Agregar recurso multimedia"
          >
            {uploading ? (
              <ActivityIndicator
                size="small"
                color={colors.surfaceLight}
              />
            ) : (
              <Plus size={21} color={colors.surfaceLight} />
            )}

            <Text style={styles.uploadButtonText}>
              {uploading ? "Cargando recurso..." : "Agregar recurso"}
            </Text>
          </Pressable>



          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />

              <Text style={styles.muted}>
                Cargando biblioteca...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.stateCard}>
              <Text style={styles.muted}>{error}</Text>

              <Pressable
                style={styles.retryButton}
                onPress={() => {
                  setLoading(true);
                  void loadMedia();
                }}
              >
                <RefreshCw size={18} color={colors.primary} />

                <Text style={styles.retryText}>
                  Reintentar
                </Text>
              </Pressable>
            </View>
          ) : media.length === 0 ? (
            <View style={styles.stateCard}>
              <ImagePlus
                size={44}
                color={colors.primary}
              />

              <Text style={styles.emptyTitle}>
                Tu biblioteca está vacía
              </Text>

              <Text style={styles.muted}>
                Aquí aparecerán las imágenes y videos que
                agregues a este proyecto.
              </Text>
            </View>
          ) : (
            <View style={styles.mediaList}>
              {media.map((item) => (
                <View key={item.id} style={styles.mediaCard}>
                  <MediaThumbnail media={item} />

                  <View style={styles.mediaInfo}>
                    <Text
                      style={styles.mediaName}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>

                    <Text style={styles.mediaDetails}>
                      {item.dimensions.width} ×{" "}
                      {item.dimensions.height}
                      {"  ·  "}
                      {formatSize(item.sizeBytes)}
                    </Text>

                    <Text style={styles.mediaStatus}>
                      {item.status === "ready"
                        ? "Disponible"
                        : item.status === "processing"
                          ? "Procesando"
                          : "Error de procesamiento"}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.optionsButton}
                    onPress={() => openOptions(item)}
                    disabled={deletingId !== null || renamingId !== null || uploading}
                    accessibilityRole="button"
                    accessibilityLabel={`Opciones de ${item.name}`}
                  >
                    {deletingId === item.id ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.primary}
                      />
                    ) : (
                      <MoreVertical
                        size={21}
                        color={colors.textDarkSecondary}
                      />
                    )}
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={renameTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={closeRename}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Renombrar recurso</Text>
            <Text style={styles.modalDescription}>
              Escribe un nombre descriptivo para identificar el archivo.
            </Text>
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              maxLength={120}
              autoFocus
              selectTextOnFocus
              editable={renamingId === null}
              placeholder="Nombre del recurso"
              placeholderTextColor={colors.textDarkSecondary}
              accessibilityLabel="Nuevo nombre del recurso"
            />
            <Text style={styles.nameCounter}>{newName.length}/120</Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeRename}
                disabled={renamingId !== null}
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, renamingId !== null && styles.uploadButtonDisabled]}
                onPress={() => void handleRename()}
                disabled={renamingId !== null}
                accessibilityRole="button"
              >
                {renamingId ? (
                  <ActivityIndicator size="small" color={colors.surfaceLight} />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={selectedAsset !== null}
        transparent
        animationType="fade"
        onRequestClose={closeUpload}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Agregar recurso
            </Text>

            <Text style={styles.modalDescription}>
              Asigna un nombre para identificar el archivo
              dentro de tu proyecto.
            </Text>

            <View style={styles.selectedFileCard}>
              {selectedAsset?.type === "video" ? (
                <Text style={styles.selectedFileType}>
                  Video
                </Text>
              ) : (
                <Text style={styles.selectedFileType}>
                  Imagen
                </Text>
              )}

              <Text
                style={styles.selectedFileName}
                numberOfLines={2}
              >
                {selectedAsset?.fileName ?? "Archivo seleccionado"}
              </Text>
            </View>

            <TextInput
              style={styles.nameInput}
              value={uploadName}
              onChangeText={setUploadName}
              maxLength={120}
              placeholder="Nombre del recurso"
              placeholderTextColor={colors.textDarkSecondary}
              editable={!uploading}
              autoFocus
              accessibilityLabel="Nombre del nuevo recurso"
            />

            <Text style={styles.nameCounter}>
              {uploadName.length}/120
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeUpload}
                disabled={uploading}
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.saveButton,
                  uploading && styles.uploadButtonDisabled
                ]}
                onPress={() => void confirmUpload()}
                disabled={uploading}
                accessibilityRole="button"
              >
                {uploading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.surfaceLight}
                  />
                ) : (
                  <Text style={styles.saveButtonText}>
                    Subir recurso
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    gap: 9
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textDark
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textDarkSecondary
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue
  },
  summaryIcon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: colors.surfaceLightBlue,
    alignItems: "center",
    justifyContent: "center"
  },
  summaryNumber: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.textDark
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textDarkSecondary
  },
  stateCard: {
    minHeight: 250,
    borderRadius: 22,
    padding: 24,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    alignItems: "center",
    justifyContent: "center",
    gap: 13
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center"
  },
  muted: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textDarkSecondary
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  },
  mediaList: {
    gap: 12
  },
  mediaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue
  },
  mediaInfo: {
    flex: 1,
    gap: 6
  },
  mediaName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textDark
  },
  mediaDetails: {
    fontSize: 12,
    color: colors.textDarkSecondary
  },
  mediaStatus: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.success
  },
  optionsButton: {
    width: 36,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12
  },
  uploadButton: {
  minHeight: 52,
  borderRadius: 16,
  backgroundColor: colors.primary,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  paddingHorizontal: 18
},
uploadButtonDisabled: {
  opacity: 0.65
},
uploadButtonText: {
  fontSize: 15,
  fontWeight: "700",
  color: colors.surfaceLight
},
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(12, 25, 48, 0.5)",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  modalCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 22,
    padding: 24,
    gap: 12
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textDark
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDarkSecondary
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textDark
  },
  nameCounter: {
    textAlign: "right",
    fontSize: 12,
    color: colors.textDarkSecondary
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center"
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDarkSecondary
  },
  saveButton: {
    minWidth: 96,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.surfaceLight
  },
  selectedFileCard: {
  padding: 14,
  borderRadius: 12,
  backgroundColor: colors.surfaceLightBlue,
  gap: 5
},
selectedFileType: {
  fontSize: 12,
  fontWeight: "700",
  color: colors.primary
},
selectedFileName: {
  fontSize: 13,
  color: colors.textDarkSecondary
}
});
