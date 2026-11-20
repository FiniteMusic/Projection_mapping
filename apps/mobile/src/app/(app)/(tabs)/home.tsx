
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Project } from "@projection/shared";

import { HomeHeader } from "@/components/home/home-header";
import { NewProjectCard } from "@/components/home/new-project-card";
import { ProjectsPreview } from "@/components/home/projects-preview";

import { getProjects } from "@/services/project.service";
import { colors } from "@/constants/theme";

export default function HomeScreen() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProjects() {
        setLoading(true);
        setError(null);

        try {
          const response = await getProjects();

          if (active) {
            setProjects(
              [...response.projects].sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              )
            );
          }
        } catch {
          if (active) {
            setError(
              "Verifica tu conexión con el servidor."
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      void loadProjects();

      return () => {
        active = false;
      };
    }, [reloadKey])
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
          <HomeHeader />

          <NewProjectCard
            onPress={() =>
              router.push("/(app)/new-project")
            }
          />

          <ProjectsPreview
            projects={projects}
            loading={loading}
            error={error}
            onRetry={() =>
              setReloadKey((value) => value + 1)
            }
            onViewAll={() =>
              router.push("/(app)/(tabs)/projects")
            }
            onProjectPress={(projectId) =>
              router.push({
                pathname: "/(app)/project/[projectId]",
                params: { projectId }
              })
            }
          />
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
    paddingBottom: 32,
    gap: 32
  }
});
