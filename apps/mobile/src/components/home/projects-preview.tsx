
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronRight,
  FolderOpen,
  Layers3
} from "lucide-react-native";

import type { Project } from "@projection/shared";
import { colors } from "@/constants/theme";
import { ProjectCard } from "@/components/projects/project-card";


interface ProjectsPreviewProps {
  projects: Project[];
  loading: boolean;
  error?: string | null;
  onViewAll: () => void;
  onProjectPress: (projectId: string) => void;
  onRetry: () => void;
}

const statusLabels = {
  draft: "Borrador",
  ready: "Listo",
  archived: "Archivado"
} as const;

export function ProjectsPreview({
  projects,
  loading,
  error,
  onViewAll,
  onProjectPress,
  onRetry
}: ProjectsPreviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis proyectos</Text>

        <Pressable
          onPress={onViewAll}
          accessibilityRole="button"
          style={styles.viewAll}
        >
          <Text style={styles.viewAllText}>
            Ver todos
          </Text>

          <ChevronRight
            size={20}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.messageCard}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
          <Text style={styles.message}>
            Cargando proyectos...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.messageCard}>
          <Text style={styles.emptyTitle}>
            No se pudieron cargar los proyectos
          </Text>

          <Text style={styles.emptyDescription}>
            {error}
          </Text>

          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
          >
            <Text style={styles.retryText}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      ) : projects.length === 0 ? (
        <LinearGradient
          colors={[
            colors.surfaceLight,
            colors.surfaceLightBlue,
            colors.backgroundLightSecondary
          ]}
          locations={[0, 0.65, 1]}
          style={styles.emptyCard}
        >
          <Layers3
            size={48}
            strokeWidth={1.7}
            color={colors.primary}
          />

          <Text style={styles.emptyTitle}>
            Aún no tienes proyectos
          </Text>

          <Text style={styles.emptyDescription}>
            Crea tu primer proyecto para comenzar.
          </Text>
        </LinearGradient>
      ) : (
        <View style={styles.projectList}>
          {projects.slice(0, 3).map((project) => (
            <ProjectCard
                key={project.id}
                project={project}
                onPress={onProjectPress}
            />
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    color: colors.textDark,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.6
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 8
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700"
  },
  emptyCard: {
    minHeight: 215,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
    gap: 12
  },
  messageCard: {
    minHeight: 180,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 14
  },
  message: {
    color: colors.textDarkSecondary,
    fontSize: 14
  },
  emptyTitle: {
    color: colors.textDark,
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center"
  },
  emptyDescription: {
    color: colors.textDarkSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center"
  },
  retryText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  },
  projectList: {
    gap: 12
  },
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    backgroundColor: colors.surfaceLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLightBlue
  },
  pressed: {
    opacity: 0.75
  },
  projectIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.surfaceLightBlue,
    alignItems: "center",
    justifyContent: "center"
  },
  projectInfo: {
    flex: 1,
    gap: 5
  },
  projectName: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: "800"
  },
  projectDescription: {
    color: colors.textDarkSecondary,
    fontSize: 13,
    lineHeight: 18
  },
  projectStatus: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700"
  }
});
