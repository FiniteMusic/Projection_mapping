
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FolderOpen,
  Layers3,
  Plus,
  Search,
  X
} from "lucide-react-native";

import type {
  Project,
  ProjectStatus
} from "@projection/shared";

import { ProjectCard } from "@/components/projects/project-card";
import { colors } from "@/constants/theme";
import { getProjects } from "@/services/project.service";

type ProjectFilter = "all" | ProjectStatus;

const filters: {
  label: string;
  value: ProjectFilter;
}[] = [
  { label: "Todos", value: "all" },
  { label: "Borradores", value: "draft" },
  { label: "Listos", value: "ready" },
  { label: "Archivados", value: "archived" }
];

export default function ProjectsScreen() {
  const router = useRouter();
  const requestId = useRef(0);

  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async (refresh = false) => {
    const currentRequest = ++requestId.current;

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await getProjects();

      if (currentRequest !== requestId.current) {
        return;
      }

      setProjects(response.projects);
    } catch {
      if (currentRequest !== requestId.current) {
        return;
      }

      setError(
        "No fue posible cargar los proyectos. Verifica la conexión con el servidor."
      );
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProjects();

      return () => {
        requestId.current += 1;
      };
    }, [loadProjects])
  );

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-MX");

    return projects
      .filter((project) => {
        const matchesStatus =
          filter === "all" || project.status === filter;

        const matchesSearch =
          project.name.toLocaleLowerCase("es-MX").includes(query) ||
          (project.description ?? "")
            .toLocaleLowerCase("es-MX")
            .includes(query);

        return matchesStatus && matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      );
  }, [projects, search, filter]);

  function handleProjectPress(projectId: string) {
    router.push({
      pathname: "/(app)/project/[projectId]",
      params: { projectId }
    });
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadProjects(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.eyebrow}>
                TU ESPACIO DE TRABAJO
              </Text>

              <Text style={styles.title}>
                Mis proyectos
              </Text>

              <Text style={styles.subtitle}>
                Organiza y administra tus creaciones
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <FolderOpen
                size={27}
                color={colors.primary}
              />
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Search
              size={21}
              color={colors.textDarkSecondary}
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar proyectos..."
              placeholderTextColor="#91A1B6"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
                accessibilityRole="button"
                accessibilityLabel="Limpiar búsqueda"
              >
                <X
                  size={19}
                  color={colors.textDarkSecondary}
                />
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {filters.map((item) => {
              const selected = filter === item.value;

              return (
                <Pressable
                  key={item.value}
                  onPress={() => setFilter(item.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[
                    styles.filterChip,
                    selected && styles.filterChipActive
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextActive
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Tus proyectos
            </Text>

            <Text style={styles.projectCount}>
              {filteredProjects.length}{" "}
              {filteredProjects.length === 1
                ? "proyecto"
                : "proyectos"}
            </Text>
          </View>

          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />

              <Text style={styles.stateDescription}>
                Cargando proyectos...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>
                No se pudieron cargar los proyectos
              </Text>

              <Text style={styles.stateDescription}>
                {error}
              </Text>

              <Pressable
                onPress={() => void loadProjects()}
                accessibilityRole="button"
              >
                <Text style={styles.retryText}>
                  Reintentar
                </Text>
              </Pressable>
            </View>
          ) : filteredProjects.length === 0 ? (
            <View style={styles.stateCard}>
              <Layers3
                size={44}
                color={colors.primary}
              />

              <Text style={styles.stateTitle}>
                {projects.length === 0
                  ? "Aún no tienes proyectos"
                  : "No encontramos resultados"}
              </Text>

              <Text style={styles.stateDescription}>
                {projects.length === 0
                  ? "Crea tu primer proyecto para comenzar."
                  : "Prueba con otra búsqueda o cambia el filtro."}
              </Text>
            </View>
          ) : (
            <View style={styles.projectList}>
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onPress={handleProjectPress}
                  showDate
                />
              ))}
            </View>
          )}

          <Pressable
            onPress={() =>
              router.push("/(app)/new-project")
            }
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.createButton,
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
              style={styles.createButtonGradient}
            >
              <Plus size={21} color={colors.white} />

              <Text style={styles.createButtonText}>
                Nuevo proyecto
              </Text>
            </LinearGradient>
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
    paddingTop: 20,
    paddingBottom: 36,
    gap: 22
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  headerInfo: {
    flex: 1,
    gap: 6
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.primary
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: colors.textDark
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
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
  searchContainer: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark
  },
  filters: {
    gap: 9,
    paddingRight: 4
  },
  filterChip: {
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue
  },
  filterChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDarkSecondary
  },
  filterTextActive: {
    color: colors.white
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.textDark
  },
  projectCount: {
    fontSize: 12,
    color: colors.textDarkSecondary
  },
  projectList: {
    gap: 13
  },
  stateCard: {
    minHeight: 205,
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    alignItems: "center",
    justifyContent: "center",
    gap: 13
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center"
  },
  stateDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDarkSecondary,
    textAlign: "center"
  },
  retryText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary
  },
  createButton: {
    borderRadius: 16,
    overflow: "hidden"
  },
  pressed: {
    opacity: 0.8
  },
  createButtonGradient: {
    minHeight: 55,
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
