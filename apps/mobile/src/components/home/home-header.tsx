
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Layers3 } from "lucide-react-native";

import { useAuth } from "@/contexts/auth.context";
import { colors } from "@/constants/theme";

export function HomeHeader() {
  const { user } = useAuth();

  const firstName = user?.name?.trim().split(/\s+/)[0] || "Usuario";

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <LinearGradient
          colors={[
            colors.primary,
            colors.primaryLight
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <Layers3
            size={27}
            color={colors.white}
            strokeWidth={2}
          />
        </LinearGradient>

        <Text style={styles.brandName}>
          Projection{"\n"}Mapping
        </Text>
      </View>

      <View style={styles.welcome}>
        <Text style={styles.greeting}>
          Hola,{" "}
          <Text style={styles.userName}>
            {firstName}
          </Text>
        </Text>

        <Text style={styles.description}>
          Gestiona tus proyectos de proyección.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 38
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  brandName: {
    color: colors.textDark,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 22,
    letterSpacing: -0.5
  },
  welcome: {
    gap: 8
  },
  greeting: {
    color: colors.textDark,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1
  },
  userName: {
    color: colors.primary
  },
  description: {
    color: colors.textDarkSecondary,
    fontSize: 15,
    lineHeight: 22
  }
});
