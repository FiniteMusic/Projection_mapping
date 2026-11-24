
import { useCallback, useRef, useState } from "react";
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
  RotateCcw,
  Save
} from "lucide-react-native";

import {
  isValidQuad,
  type Quad,
  type Surface
} from "@projection/shared";

import { colors } from "@/constants/theme";
import SurfaceCanvas from "@/components/surfaces/SurfaceCanvas";
import {
  getSurface,
  updateSurface
} from "@/services/surface.service";

import {
  useProjectionSession
} from "@/contexts/projection-session.context";

const SURFACE_UPDATE_INTERVAL = 8;

function copyCorners(corners: Quad): Quad {
  return corners.map((point) => ({ ...point })) as Quad;
}

export default function SurfaceEditorScreen() {
  const router = useRouter();

  const {
  session,
  connected,
  updateSurfaceCorners
  } = useProjectionSession();

  const lastUpdateRef = useRef(0);

  const [saving, setSaving] = useState(false);

  const { surfaceId } = useLocalSearchParams<{
    surfaceId: string;
  }>();

  const [surface, setSurface] = useState<Surface | null>(null);
  const [corners, setCorners] = useState<Quad | null>(null);
  const [originalCorners, setOriginalCorners] = useState<Quad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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

          setSurface(response.surface);
          setCorners(copyCorners(response.surface.corners));
          setOriginalCorners(copyCorners(response.surface.corners));
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

    const geometryIsValid =
    corners !== null && isValidQuad(corners);

    const hasChanges =
  corners !== null &&
  originalCorners !== null &&
  corners.some((point, index) => {
    const original = originalCorners[index];

    return (
      point.x !== original.x ||
      point.y !== original.y
    );
  });

  
    function handleCornersChange(nextCorners: Quad) {
      setCorners(nextCorners);

      if (!surface || !connected || !isValidQuad(nextCorners)) {
        return;
      }

      const now = Date.now();

      if (
        now - lastUpdateRef.current <
        SURFACE_UPDATE_INTERVAL
      ) {
        return;
      }

      lastUpdateRef.current = now;

      updateSurfaceCorners(
        surface.projectId,
        surface.id,
        nextCorners
      );
    }

    function handleCornersChangeEnd(nextCorners: Quad) {
      setCorners(nextCorners);

      if (!surface || !connected || !isValidQuad(nextCorners)) {
        return;
      }

      lastUpdateRef.current = Date.now();

      updateSurfaceCorners(
        surface.projectId,
        surface.id,
        nextCorners
      );
    }



    function handleReset() {
      if (!originalCorners) return;

      handleCornersChangeEnd(
        copyCorners(originalCorners)
      );
    }

    async function handleSave() {
    if (
        !surfaceId ||
        !corners ||
        !geometryIsValid ||
        !hasChanges ||
        saving
    ) {
        return;
    }

    setSaving(true);

    try {
        const response = await updateSurface(surfaceId, {
        corners
        });

        const savedCorners = copyCorners(
        response.surface.corners
        );

          setSurface(response.surface);
          setOriginalCorners(copyCorners(savedCorners));

          handleCornersChangeEnd(savedCorners); 

        Alert.alert(
        "Geometría guardada",
        "Los vértices se actualizaron correctamente."
        );
    } catch {
        Alert.alert(
        "Error",
        "No fue posible guardar la geometría. Inténtalo nuevamente."
        );
    } finally {
        setSaving(false);
    }
    }

    const liveProjectionEnabled =
      connected &&
      session?.status === "active" &&
      session.projectId === surface?.projectId;


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
            <Text style={styles.title}>
              Editor geométrico
            </Text>

            <Text style={styles.subtitle}>
              Ajusta los cuatro vértices de la superficie.
            </Text>
          </View>

          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
              <Text style={styles.muted}>
                Cargando geometría...
              </Text>
            </View>
          ) : error || !surface || !corners ? (
            <View style={styles.stateCard}>
              <Text style={styles.muted}>
                {error ?? "No se encontraron datos."}
              </Text>

              <Pressable
                onPress={() => setReloadKey((v) => v + 1)}
              >
                <Text style={styles.retry}>
                  Reintentar
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  {surface.name}
                </Text>

                <Text style={styles.muted}>
                  Arrastra cualquiera de los cuatro puntos.
                </Text>

                <SurfaceCanvas
                  corners={corners}
                  onChange={handleCornersChange}
                  onChangeEnd={handleCornersChangeEnd}
                />
                <View style={styles.validationRow}>
                <View
                  style={[
                    styles.validationIndicator,
                    {
                      backgroundColor: liveProjectionEnabled
                        ? colors.success
                        : colors.textMuted
                    }
                  ]}
                />

                <Text style={styles.validationText}>
                  {liveProjectionEnabled
                    ? "Proyección en tiempo real habilitada"
                    : "Edición local"}
                </Text>
              </View>
                <View style={styles.validationRow}>
                <View
                    style={[
                    styles.validationIndicator,
                    {
                        backgroundColor: geometryIsValid
                        ? colors.success
                        : colors.error
                    }
                    ]}
                />

                <Text style={styles.validationText}>
                    {geometryIsValid
                    ? "Geometría válida"
                    : "Geometría inválida: ajusta los vértices"}
                </Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Coordenadas normalizadas
                </Text>

                {corners.map((point, index) => (
                  <View key={index} style={styles.coordinateRow}>
                    <Text style={styles.coordinateLabel}>
                      {["TL", "TR", "BR", "BL"][index]}
                    </Text>

                    <Text style={styles.coordinateValue}>
                      X: {point.x.toFixed(3)}
                    </Text>

                    <Text style={styles.coordinateValue}>
                      Y: {point.y.toFixed(3)}
                    </Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={handleReset}
                style={styles.resetButton}
                accessibilityRole="button"
              >
                <RotateCcw size={19} color={colors.primary} />

                <Text style={styles.resetText}>
                  Restablecer posiciones
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={
                    saving ||
                    !geometryIsValid ||
                    !hasChanges
                }
                style={[
                    styles.saveButton,
                    (
                    saving ||
                    !geometryIsValid ||
                    !hasChanges
                    ) && styles.saveButtonDisabled
                ]}
                accessibilityRole="button"
                >
                {saving ? (
                    <ActivityIndicator color={colors.white} />
                ) : (
                    <>
                    <Save size={20} color={colors.white} />

                    <Text style={styles.saveButtonText}>
                        Guardar geometría
                    </Text>
                    </>
                )}
                </Pressable>

              <Text style={styles.notice}>
                Los cambios todavía no se guardan en la base de datos.
              </Text>
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
    gap: 10
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textDark
  },
  muted: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDarkSecondary
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
  coordinateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLightBlue
  },
  coordinateLabel: {
    width: 35,
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary
  },
  coordinateValue: {
    fontSize: 14,
    color: colors.textDark
  },
  resetButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  resetText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary
  },
  notice: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    color: colors.textDarkSecondary
  },
  validationRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 9
},
validationIndicator: {
  width: 9,
  height: 9,
  borderRadius: 5
},
validationText: {
  flex: 1,
  fontSize: 13,
  fontWeight: "600",
  color: colors.textDarkSecondary
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
saveButtonDisabled: {
  opacity: 0.45
},
saveButtonText: {
  fontSize: 15,
  fontWeight: "800",
  color: colors.white
}
});
