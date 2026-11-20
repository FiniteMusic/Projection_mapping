
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";

interface AuthBackgroundProps {
  children: ReactNode;
}

export function AuthBackground({
  children
}: AuthBackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          colors.background,
          "#102B49",
          colors.background
        ]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View
        pointerEvents="none"
        style={styles.decorationContainer}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
        <View style={styles.shapeTop} />
        <View style={styles.shapeBottom} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden"
  },
  safeArea: {
    flex: 1
  },
 decorationContainer: {
  ...StyleSheet.absoluteFill,
  overflow: "hidden"
},
  glowTop: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#0B4667",
    opacity: 0.35,
    top: -160,
    right: -130
  },
  glowBottom: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#123D84",
    opacity: 0.25,
    bottom: -180,
    left: -150
  },
  shapeTop: {
    position: "absolute",
    width: 220,
    height: 220,
    backgroundColor: "#0A3456",
    opacity: 0.28,
    transform: [{ rotate: "45deg" }],
    top: -140,
    left: -100
  },
  shapeBottom: {
    position: "absolute",
    width: 240,
    height: 240,
    backgroundColor: "#17438A",
    opacity: 0.2,
    transform: [{ rotate: "45deg" }],
    bottom: 90,
    right: -180
  }
});
