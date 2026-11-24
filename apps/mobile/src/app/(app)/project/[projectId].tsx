
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
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
  CalendarDays,
  ChevronRight,
  FolderOpen,
  Image as ImageIcon,
  Layers3,
  Monitor,
  Settings2,
  Pencil,
  Trash2
} from "lucide-react-native";

import type {
  Project,
  ProjectStatus
} from "@projection/shared";



import { colors } from "@/constants/theme";
import {
  getProject,
  deleteProject
} from "@/services/project.service";

const statusLabels: Record<ProjectStatus, string> = {
  draft: "Borrador",
  ready: "Listo",
  archived: "Archivado"
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{
    projectId: string;
  }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProject() {
        setLoading(true);
        setError(null);
        setProject(null);

        if (!projectId) {
          setError("No se recibió un identificador válido.");
          setLoading(false);
          return;
        }

        try {
          const response = await getProject(projectId);

          if (active) {
            setProject(response.project);
          }
        } catch {
          if (active) {
            setError(
              "No fue posible obtener la información del proyecto."
            );
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


  function handleDeleteProject() {
    if (!project || deleting) {
      return;
    }

    Alert.alert(
      "Eliminar proyecto",
      `¿Estás seguro de que deseas eliminar "${project.name}"? Esta acción es permanente y también eliminará su contenido asociado.`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            if (deleting) {
              return;
            }

            setDeleting(true);

            try {
              await deleteProject(project.id);

              router.replace("/(app)/(tabs)/projects");
            } catch (error) {
              Alert.alert(
                "No se pudo eliminar",
                "Ocurrió un problema al eliminar el proyecto. Inténtalo nuevamente."
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

          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
              <Text style={styles.muted}>
                Cargando proyecto...
              </Text>
            </View>
          ) : error || !project ? (
            <View style={styles.stateCard}>
              <Text style={styles.sectionTitle}>
                No se pudo cargar el proyecto
              </Text>

              <Text style={styles.muted}>
                {error ?? "Proyecto no disponible."}
              </Text>

              <Pressable
                onPress={() =>
                  setReloadKey((value) => value + 1)
                }
              >
                <Text style={styles.retry}>
                  Reintentar
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.heading}>
                <View style={styles.headingIcon}>
                  <FolderOpen
                    size={29}
                    color={colors.primary}
                  />
                </View>


                <Pressable
                onPress={() =>
                    router.push({
                    pathname: "/(app)/project/edit/[projectId]",
                    params: { projectId: project.id }
                    })
                }
                accessibilityRole="button"
                accessibilityLabel="Editar proyecto"
                style={({ pressed }) => [
                    styles.editButton,
                    pressed && styles.editButtonPressed
                ]}
                >
                <LinearGradient
                    colors={[
                    colors.primaryLight,
                    colors.primary
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.editButtonGradient}
                >
                    <Pencil size={19} color={colors.white} />

                    <Text style={styles.editButtonText}>
                    Editar proyecto
                    </Text>
                </LinearGradient>
                </Pressable>



                <Text style={styles.title}>
                  {project.name}
                </Text>

                <Text style={styles.subtitle}>
                  {project.description ||
                    "Este proyecto no tiene descripción."}
                </Text>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {statusLabels[project.status]}
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.sectionHeading}>
                  <Settings2
                    size={21}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>
                    Configuración del lienzo
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    Resolución
                  </Text>

                  <Text style={styles.infoValue}>
                    {project.settings.canvas.width} ×{" "}
                    {project.settings.canvas.height}
                  </Text>
                </View>

                <View style={styles.separator} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    Color de fondo
                  </Text>

                  <View style={styles.colorRow}>
                    <View
                      style={[
                        styles.colorPreview,
                        {
                          backgroundColor:
                            project.settings.backgroundColor
                        }
                      ]}
                    />

                    <Text style={styles.infoValue}>
                      {project.settings.backgroundColor}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.groupTitle}>
                Contenido del proyecto
              </Text>

              
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(app)/project/surfaces/[projectId]",
                    params: { projectId: project.id }
                  })
                }
                accessibilityRole="button"
                accessibilityLabel="Administrar superficies"
                style={styles.contentCard}
              >
                <View style={styles.contentIcon}>
                  <Layers3
                    size={25}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.contentInfo}>
                  <Text style={styles.contentTitle}>
                    Superficies
                  </Text>

                  <Text style={styles.contentDescription}>
                    Administra las áreas de proyección.
                  </Text>
                </View>

                <ChevronRight
                  size={21}
                  color={colors.textDarkSecondary}
                />
              </Pressable>

              <Pressable
                style={styles.contentCard}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/project/media/[projectId]",
                    params: { projectId: project.id }
                  })
                }
              >
                <View style={styles.contentIcon}>
                  <ImageIcon
                    size={25}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.contentInfo}>
                  <Text style={styles.contentTitle}>
                    Recursos multimedia
                  </Text>

                  <Text style={styles.contentDescription}>
                    Imágenes y videos del proyecto.
                  </Text>
                </View>

                <ChevronRight
                  size={21}
                  color={colors.textDarkSecondary}
                />
              </Pressable>

              <View style={styles.infoCard}>
                <View style={styles.sectionHeading}>
                  <Monitor
                    size={21}
                    color={colors.primary}
                  />

                  <Text style={styles.sectionTitle}>
                    Información del proyecto
                  </Text>
                </View>

                <View style={styles.dateRow}>
                  <CalendarDays
                    size={18}
                    color={colors.textDarkSecondary}
                  />

                  <Text style={styles.muted}>
                    Creado: {formatDate(project.createdAt)}
                  </Text>
                </View>

                <View style={styles.dateRow}>
                  <CalendarDays
                    size={18}
                    color={colors.textDarkSecondary}
                  />

                  <Text style={styles.muted}>
                    Actualizado: {formatDate(project.updatedAt)}
                  </Text>
                </View>

                
                <Pressable
                  onPress={handleDeleteProject}
                  disabled={deleting}
                  accessibilityRole="button"
                  accessibilityLabel="Eliminar proyecto"
                  accessibilityState={{ disabled: deleting }}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    (pressed || deleting) && styles.deleteButtonPressed
                  ]}
                >
                  {deleting ? (
                    <ActivityIndicator
                      size="small"
                      color="#DC2626"
                    />
                  ) : (
                    <Trash2
                      size={20}
                      color="#DC2626"
                    />
                  )}

                  <Text style={styles.deleteButtonText}>
                    {deleting ? "Eliminando proyecto..." : "Eliminar proyecto"}
                  </Text>
                </Pressable>

              </View>
            </>
          )}
        </ScrollView>
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
  heading: {
    gap: 12,
    alignItems: "flex-start"
  },
  headingIcon: {
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
  statusBadge: {
    backgroundColor: colors.surfaceLightBlue,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 7
  },
  statusText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800"
  },
  infoCard: {
    padding: 21,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    gap: 18
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
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
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLightBlue
  },
  groupTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.textDark
  },
  contentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 17,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue
  },
  contentIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.surfaceLightBlue,
    alignItems: "center",
    justifyContent: "center"
  },
  contentInfo: {
    flex: 1,
    gap: 5
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textDark
  },
  contentDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textDarkSecondary
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  muted: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDarkSecondary
  },
  stateCard: {
    minHeight: 200,
    borderRadius: 24,
    padding: 24,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    gap: 14
  },
  retry: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  },


   
editButton: {
  width: "100%",
  borderRadius: 16,
  overflow: "hidden"
},
editButtonPressed: {
  opacity: 0.8
},
editButtonGradient: {
  width: "100%",
  minHeight: 56,
  paddingHorizontal: 24,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 12
},
editButtonText: {
  color: colors.white,
  fontSize: 16,
  fontWeight: "800",
  textAlign: "center"
},

deleteButton: {
  width: "100%",
  minHeight: 56,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#FECACA",
  backgroundColor: "#FEF2F2",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  paddingHorizontal: 20
},
deleteButtonPressed: {
  opacity: 0.65
},
deleteButtonText: {
  color: "#DC2626",
  fontSize: 16,
  fontWeight: "800",
  textAlign: "center"
}


});
