
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle2,
  ChevronDown,
  Link2,
  MonitorPlay,
  RefreshCw,
  Unplug,
  Wifi
} from "lucide-react-native";

import type {
  Project
} from "@projection/shared";

import { colors } from "@/constants/theme";
import { getProjects } from "@/services/project.service";
import {
  endSession,
  getSession,
  pairSession
} from "@/services/session.service";
import {
  useProjectionSession
} from "@/contexts/projection-session.context";

export default function SessionsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [showProjects, setShowProjects] = useState(false);
  const [pairingCode, setPairingCode] = useState("");

const {
  session,
  setSession,
  connected,
  restoring,
  restoreError,
  restoreSession
} = useProjectionSession();

  const [loading, setLoading] = useState(true);
  const [pairing, setPairing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProject = projects.find(
    (project) => project.id === projectId
  );

  const availableProjects = projects.filter(
    (project) => project.status !== "archived"
  );

  const busy = pairing || refreshing || ending;

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProjects();
      setProjects(response.projects);
    } catch (err) {
      console.error("[SESSIONS] Projects:", err);
      setError("No fue posible cargar los proyectos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProjects();
    }, [loadProjects])
  );

  async function handlePair() {
    if (busy) return;

    if (!projectId) {
      Alert.alert(
        "Selecciona un proyecto",
        "Debes elegir el proyecto que deseas proyectar."
      );
      return;
    }

    if (!/^\d{6}$/.test(pairingCode)) {
      Alert.alert(
        "Código inválido",
        "Introduce los seis dígitos mostrados en el reproductor."
      );
      return;
    }

    try {
      setPairing(true);
      setError(null);

      const response = await pairSession({
        pairingCode,
        projectId
      });

      setSession(response.session);
      setPairingCode("");

      Alert.alert(
        "Vinculación exitosa",
        "El reproductor fue vinculado al proyecto."
      );
    } catch (err) {
      console.error("[SESSIONS] Pairing:", err);

      setError(
        "No fue posible vincular el reproductor. " +
        "Comprueba que el código sea correcto, " +
        "esté vigente y no haya sido utilizado."
      );
    } finally {
      setPairing(false);
    }
  }

  async function handleRefresh() {
    if (!session || busy) return;

    try {
      setRefreshing(true);
      setError(null);

      const response = await getSession(session.id);
      setSession(response.session);
    } catch (err) {
      console.error("[SESSIONS] Refresh:", err);
      setError("No fue posible consultar la sesión.");
    } finally {
      setRefreshing(false);
    }
  }

  async function finishSession() {
    if (!session || busy) return;

    try {
      setEnding(true);
      setError(null);

      const response = await endSession(session.id);
      setSession(response.session);

      Alert.alert(
        "Sesión finalizada",
        "La sesión de proyección se cerró correctamente."
      );
    } catch (err) {
      console.error("[SESSIONS] End:", err);
      setError("No fue posible finalizar la sesión.");
    } finally {
      setEnding(false);
    }
  }

  function confirmEndSession() {
    Alert.alert(
      "Finalizar sesión",
      "¿Deseas desconectar el reproductor?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          style: "destructive",
          onPress: () => void finishSession()
        }
      ]
    );
  }

  const sessionActive =
    session !== null && session.status !== "ended";

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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                CENTRO DE PROYECCIÓN
              </Text>

              <Text style={styles.title}>
                Sesiones
              </Text>

              <Text style={styles.subtitle}>
                Vincula y administra tus dispositivos de proyección.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <MonitorPlay
                size={27}
                color={colors.primary}
              />
            </View>
          </View>

          
              {restoring ? (
                <View style={styles.card}>
                  <ActivityIndicator
                    size="large"
                    color={colors.primary}
                  />

                  <Text style={styles.sectionTitle}>
                    Recuperando sesión
                  </Text>

                  <Text style={styles.description}>
                    Comprobando la vinculación del reproductor.
                  </Text>
                </View>
              ) : restoreError ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>
                    Sesión no disponible
                  </Text>

                  <Text style={styles.description}>
                    {restoreError}
                  </Text>

                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => void restoreSession()}
                  >
                    <RefreshCw
                      size={19}
                      color={colors.primary}
                    />

                    <Text style={styles.secondaryButtonText}>
                      Reintentar conexión
                    </Text>
                  </Pressable>
                </View>
              ) : sessionActive ? (
                <View style={styles.card}>

              <View style={styles.sectionHeader}>
                <CheckCircle2
                  size={23}
                  color={colors.success}
                />

                <Text style={styles.sectionTitle}>
                  Sesión vinculada
                </Text>
              </View>

              <Text style={styles.description}>
                El proyecto está asociado a un reproductor.
              </Text>

              <View style={styles.statusBox}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>
                    Estado de sesión
                  </Text>
                  <Text style={styles.statusValue}>
                    {session.status === "active"
                      ? "Activa"
                      : "En espera"}
                  </Text>
                </View>

                
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>
                      Reproductor
                    </Text>

                    <Text style={styles.statusValue}>
                      {session.playerConnectionStatus === "connected"
                        ? "Conectado"
                        : "Desconectado"}
                    </Text>
                  </View>

                  
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>
                      Controlador móvil
                    </Text>

                    <Text
                      style={[
                        styles.statusValue,
                        {
                          color: connected
                            ? colors.success
                            : colors.error
                        }
                      ]}
                    >
                      {connected ? "Conectado" : "Desconectado"}
                    </Text>
                  </View>


                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>
                    Proyecto
                  </Text>
                  <Text style={styles.statusValue}>
                    {projects.find(
                      (project) => project.id === session.projectId
                    )?.name ?? session.projectId}
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => void handleRefresh()}
                disabled={busy}
              >
                {refreshing ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <RefreshCw
                    size={19}
                    color={colors.primary}
                  />
                )}

                <Text style={styles.secondaryButtonText}>
                  Actualizar estado
                </Text>
              </Pressable>

              <Pressable
                style={styles.endButton}
                onPress={confirmEndSession}
                disabled={busy}
              >
                {ending ? (
                  <ActivityIndicator color={colors.error} />
                ) : (
                  <Unplug
                    size={19}
                    color={colors.error}
                  />
                )}

                <Text style={styles.endButtonText}>
                  Finalizar sesión
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <Link2
                    size={23}
                    color={colors.primary}
                  />

                  <Text style={styles.sectionTitle}>
                    Vincular reproductor
                  </Text>
                </View>

                <Text style={styles.description}>
                  Selecciona un proyecto e introduce el código
                  que aparece en la pantalla del reproductor.
                </Text>

                <Text style={styles.fieldLabel}>
                  Proyecto
                </Text>

                {loading ? (
                  <ActivityIndicator
                    color={colors.primary}
                  />
                ) : (
                  <>
                    <Pressable
                      style={styles.selectButton}
                      onPress={() =>
                        setShowProjects(!showProjects)
                      }
                    >
                      <Text style={styles.selectText}>
                        {selectedProject?.name ??
                          "Seleccionar proyecto"}
                      </Text>

                      <ChevronDown
                        size={20}
                        color={colors.textDarkSecondary}
                      />
                    </Pressable>

                    {showProjects && (
                      <View style={styles.projectOptions}>
                        {availableProjects.length === 0 ? (
                          <Text style={styles.description}>
                            No hay proyectos disponibles.
                          </Text>
                        ) : (
                          availableProjects.map((project) => (
                            <Pressable
                              key={project.id}
                              style={styles.projectOption}
                              onPress={() => {
                                setProjectId(project.id);
                                setShowProjects(false);
                              }}
                            >
                              <Text style={styles.projectOptionText}>
                                {project.name}
                              </Text>

                              {project.id === projectId && (
                                <CheckCircle2
                                  size={18}
                                  color={colors.primary}
                                />
                              )}
                            </Pressable>
                          ))
                        )}
                      </View>
                    )}
                  </>
                )}

                <Text style={styles.fieldLabel}>
                  Código de emparejamiento
                </Text>

                <TextInput
                  value={pairingCode}
                  onChangeText={(value) =>
                    setPairingCode(
                      value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  placeholder="000000"
                  placeholderTextColor="#9AA9BE"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.codeInput}
                  textAlign="center"
                  autoCorrect={false}
                  editable={!busy}
                  accessibilityLabel="Código de seis dígitos"
                />

                <Text style={styles.hint}>
                  El código tiene una vigencia de cinco minutos.
                </Text>

                <Pressable
                  style={[
                    styles.primaryButton,
                    (busy ||
                      loading ||
                      !projectId ||
                      pairingCode.length !== 6) &&
                      styles.disabled
                  ]}
                  onPress={() => void handlePair()}
                  disabled={
                    busy ||
                    loading ||
                    !projectId ||
                    pairingCode.length !== 6
                  }
                >
                  {pairing ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Link2
                      size={20}
                      color={colors.white}
                    />
                  )}

                  <Text style={styles.primaryButtonText}>
                    {pairing
                      ? "Vinculando..."
                      : "Vincular reproductor"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.infoCard}>
                <Wifi size={22} color={colors.primary} />

                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>
                    ¿Cómo funciona?
                  </Text>

                  <Text style={styles.description}>
                    Abre el reproductor web, consulta su
                    código de seis dígitos e introdúcelo
                    aquí para vincular el proyecto.
                  </Text>
                </View>
              </View>
            </>
          )}

          {session?.status === "ended" && (
            <View style={styles.infoCard}>
              <CheckCircle2
                size={22}
                color={colors.success}
              />

              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>
                  Sesión finalizada
                </Text>

                <Text style={styles.description}>
                  Puedes iniciar una nueva vinculación.
                </Text>

                <Pressable
                  onPress={() => {
                    setSession(null);
                    setProjectId("");
                    setPairingCode("");
                    setError(null);
                  }}
                >
                  <Text style={styles.linkText}>
                    Nueva vinculación
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
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
    paddingTop: 24,
    paddingBottom: 120,
    gap: 22
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 10
  },
  headerText: {
    flex: 1,
    gap: 7
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.primary
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
  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: colors.surfaceLightBlue,
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    gap: 18
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textDark
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textDarkSecondary
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textDark,
    marginTop: 5
  },
  selectButton: {
    minHeight: 58,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark
  },
  projectOptions: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    overflow: "hidden"
  },
  projectOption: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLightBlue
  },
  projectOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark
  },
  codeInput: {
    minHeight: 78,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.borderLightBlue,
    backgroundColor: colors.backgroundLight,
    color: colors.textDark,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 8
  },
  hint: {
    fontSize: 12,
    color: colors.textDarkSecondary,
    textAlign: "center"
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white
  },
  disabled: {
    opacity: 0.5
  },
  infoCard: {
    backgroundColor: colors.surfaceLightBlue,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14
  },
  infoText: {
    flex: 1,
    gap: 8
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textDark
  },
  statusBox: {
    backgroundColor: colors.surfaceLightBlue,
    borderRadius: 16,
    padding: 16,
    gap: 16
  },
  statusRow: {
    gap: 5
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textDarkSecondary
  },
  statusValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textDark
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  },
  endButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.error
  },
  linkText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary
  },
  errorCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFF0F2",
    borderWidth: 1,
    borderColor: "#F5CBD1"
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#A42C42"
  }
});
