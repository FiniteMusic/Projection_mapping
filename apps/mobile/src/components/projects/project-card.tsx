
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  ChevronRight,
  FolderOpen
} from "lucide-react-native";

import type {
  Project,
  ProjectStatus
} from "@projection/shared";

import { colors } from "@/constants/theme";

interface ProjectCardProps {
  project: Project;
  onPress: (projectId: string) => void;
  showDate?: boolean;
}

const statusLabels: Record<ProjectStatus, string> = {
  draft: "Borrador",
  ready: "Listo",
  archived: "Archivado"
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function ProjectCard({
  project,
  onPress,
  showDate = false
}: ProjectCardProps) {
  return (
    <Pressable
      onPress={() => onPress(project.id)}
      accessibilityRole="button"
      accessibilityLabel={`Abrir proyecto ${project.name}`}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed
      ]}
    >
      <View style={styles.main}>
        <View style={styles.iconContainer}>
          <FolderOpen
            size={26}
            color={colors.primary}
          />
        </View>

        <View style={styles.information}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {project.name}
          </Text>

          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {project.description || "Sin descripción"}
          </Text>

          {!showDate && (
            <Text style={styles.compactStatus}>
              {statusLabels[project.status]}
            </Text>
          )}
        </View>

        <ChevronRight
          size={22}
          color={colors.textDarkSecondary}
        />
      </View>

      {showDate && (
        <View style={styles.footer}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {statusLabels[project.status]}
            </Text>
          </View>

          <Text style={styles.date}>
            Actualizado: {formatDate(project.updatedAt)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLightBlue,
    padding: 16,
    gap: 16
  },
  pressed: {
    opacity: 0.75
  },
  main: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.surfaceLightBlue,
    alignItems: "center",
    justifyContent: "center"
  },
  information: {
    flex: 1,
    gap: 5
  },
  name: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: "800"
  },
  description: {
    color: colors.textDarkSecondary,
    fontSize: 13,
    lineHeight: 18
  },
  compactStatus: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700"
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  statusBadge: {
    backgroundColor: colors.surfaceLightBlue,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 6
  },
  statusText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800"
  },
  date: {
    color: colors.textDarkSecondary,
    fontSize: 11
  }
});
