
import { StyleSheet, Text, View } from "react-native";
import { Box, Scan } from "lucide-react-native";

import { colors } from "@/constants/theme";

export function AuthHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Scan
          size={92}
          strokeWidth={1.2}
          color={colors.primaryLight}
        />

        <View style={styles.cube}>
          <Box
            size={43}
            strokeWidth={1.4}
            color={colors.white}
          />
        </View>
      </View>

      <Text style={styles.title}>
        <Text style={styles.titleBold}>Projection</Text>
        {" Mapping"}
      </Text>

      <Text style={styles.subtitle}>
        Gestión y control de proyecciones
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12
  },
  logoContainer: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center"
  },
  cube: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: "300",
    textAlign: "center",
    letterSpacing: -0.8
  },
  titleBold: {
    fontWeight: "700"
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center"
  }
});
