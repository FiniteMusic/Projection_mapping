
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, borderRadius } from "@/constants/theme";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthCard({
  title,
  description,
  children
}: AuthCardProps) {
  return (
    <LinearGradient
      colors={[
        "#1B3854",
        "#152840",
        "#101D31"
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.description}>
          {description}
        </Text>
      </View>

      <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    gap: 28,
    overflow: "hidden"
  },
  header: {
    gap: 8
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23
  },
  content: {
    gap: 16
  }
});
