
import { Tabs } from "expo-router";
import {
  Folder,
  House,
  MonitorPlay,
  Settings
} from "lucide-react-native";

import { colors } from "@/constants/theme";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: "#AABCD2",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4
        },
        tabBarStyle: {
          backgroundColor: colors.navyDeep,
          borderTopWidth: 0,
          borderRadius: 24,
          marginHorizontal: 16,
          marginBottom: 12,
          height: 76,
          paddingTop: 10,
          paddingBottom: 10,
          elevation: 8,
          shadowColor: colors.navy,
          shadowOpacity: 0.18,
          shadowRadius: 14
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <House size={size} color={color} strokeWidth={2} />
          )
        }}
      />

      <Tabs.Screen
        name="projects"
        options={{
          title: "Proyectos",
          tabBarIcon: ({ color, size }) => (
            <Folder size={size} color={color} strokeWidth={2} />
          )
        }}
      />

      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sesiones",
          tabBarIcon: ({ color, size }) => (
            <MonitorPlay size={size} color={color} strokeWidth={2} />
          )
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          )
        }}
      />

    </Tabs>
  );
}
