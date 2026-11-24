
import { Stack } from "expo-router";

import {
  ProjectionSessionProvider
} from "@/contexts/projection-session.context";

export default function AppLayout() {
  return (
    <ProjectionSessionProvider>
      <Stack
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="new-project"
          options={{
            presentation: "card",
            animation: "slide_from_right"
          }}
        />

        <Stack.Screen
          name="project/surfaces/new/[projectId]"
          options={{
            animation: "slide_from_right"
          }}
        />

        <Stack.Screen
          name="project/surfaces/editor/[surfaceId]"
          options={{
            animation: "slide_from_right"
          }}
        />

        <Stack.Screen
          name="project/media/[projectId]"
          options={{
            animation: "slide_from_right"
          }}
        />
      </Stack>
    </ProjectionSessionProvider>
  );
}
