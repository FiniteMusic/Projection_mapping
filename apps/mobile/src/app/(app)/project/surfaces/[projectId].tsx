
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
  Eye,
  EyeOff,
  Layers3,
  Plus
} from "lucide-react-native";

import type { Surface } from "@projection/shared";

import { colors } from "@/constants/theme";
import { getSurfaces } from "@/services/surface.service";

export default function ProjectSurfacesScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{
    projectId: string;
  }>();

  const [surfaces, setSurfaces] = useState<Surface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadSurfaces() {
        setLoading(true);
        setError(null);

        if (!projectId) {
          setError("No se recibió un proyecto válido.");
          setLoading(false);
          return;
        }

        try {
          const response = await getSurfaces(projectId);

          if (active) {
            setSurfaces(response.surfaces);
          }
        } catch {
          if (active) {
            setError("No fue posible cargar las superficies.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      void loadSurfaces();

      return () => {
        active = false;
      };
    }, [projectId, reloadKey])
  );

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

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Layers3 size={29} color={colors.primary} />
            </View>

            <Text style={styles.title}>
              Superficies
            </Text>

            <Text style={styles.subtitle}>
              Administra las áreas de proyección de tu proyecto.
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Superficies del proyecto
            </Text>

            <Text style={styles.count}>
              {surfaces.length}
            </Text>
          </View>

          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />

              <Text style={styles.muted}>
                Cargando superficies...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>
                No se pudieron cargar las superficies
              </Text>

              <Text style={styles.muted}>
                {error}
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
          ) : surfaces.length === 0 ? (
            <View style={styles.stateCard}>
              <Layers3 size={42} color={colors.primary} />

              <Text style={styles.stateTitle}>
                Aún no hay superficies
              </Text>

              <Text style={styles.muted}>
                Las superficies permiten definir regiones
                independientes dentro del lienzo de proyección.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {surfaces.map((surface) => (
                  <Pressable
                    key={surface.id}
                    onPress={() => {
                      router.push({
                        pathname: "/(app)/project/surfaces/detail/[surfaceId]",
                        params: {
                          surfaceId: surface.id
                        }
                      });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver detalles de ${surface.name}`}
                    style={({ pressed }) => [
                      styles.surfaceCard,
                      pressed && { opacity: 0.8 }
                    ]}
                  >
                  <View style={styles.surfaceIcon}>
                    <Layers3
                      size={24}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.surfaceInfo}>
                    <Text style={styles.surfaceName}>
                      {surface.name}
                    </Text>

                    <Text style={styles.surfaceDescription}>
                      Capa {surface.zIndex} · Opacidad{" "}
                      {Math.round(surface.opacity * 100)}%
                    </Text>

                    <View style={styles.visibilityRow}>
                      {surface.visible ? (
                        <Eye
                          size={15}
                          color={colors.primary}
                        />
                      ) : (
                        <EyeOff
                          size={15}
                          color={colors.textDarkSecondary}
                        />
                      )}

                      <Text style={styles.visibilityText}>
                        {surface.visible
                          ? "Visible"
                          : "Oculta"}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          
          <Pressable
            onPress={() => {
              if (!projectId) return;

              router.push({
                pathname: "/(app)/project/surfaces/new/[projectId]",
                params: { projectId }
              });
            }}
            accessibilityRole="button"
            accessibilityLabel="Nueva superficie"
            style={({ pressed }) => [
              styles.createButton,
              pressed && { opacity: 0.8 }
            ]}
          >
            <Plus size={20} color={colors.white} />

            <Text style={styles.createButtonText}>
              Nueva superficie
            </Text>
          </Pressable>

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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textDark
  },
  count: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  },
  stateCard: {
    minHeight: 210,
    padding: 24,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    alignItems: "center",
    justifyContent: "center",
    gap: 13
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center"
  },
  muted: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDarkSecondary,
    textAlign: "center"
  },
  retry: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary
  },
  list: {
    gap: 13
  },
  surfaceCard: {
    flexDirection: "row",
    gap: 14,
    padding: 17,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue
  },
  surfaceIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.surfaceLightBlue,
    alignItems: "center",
    justifyContent: "center"
  },
  surfaceInfo: {
    flex: 1,
    gap: 7
  },
  surfaceName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textDark
  },
  surfaceDescription: {
    fontSize: 13,
    color: colors.textDarkSecondary
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textDarkSecondary
  },
  createButton: {
    minHeight: 55,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white
  }
});
