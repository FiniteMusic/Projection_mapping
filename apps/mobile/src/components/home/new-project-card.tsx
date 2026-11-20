
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Projector } from "lucide-react-native";

import { colors } from "@/constants/theme";

interface NewProjectCardProps {
  onPress: () => void;
}

export function NewProjectCard({
  onPress
}: NewProjectCardProps) {
  return (
    <LinearGradient
      colors={[
        colors.navy,
        colors.navySoft,
        colors.navyDeep
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View pointerEvents="none" style={styles.decoration}>
        <View style={styles.glow} />

        <View style={styles.projector}>
          <Projector
            size={76}
            strokeWidth={1.1}
            color={colors.primaryLight}
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Crea un nuevo{"\n"}proyecto
        </Text>

        <Text style={styles.description}>
          Configura superficies, contenido y proyecciones en minutos.
        </Text>

        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
        >
          <LinearGradient
            colors={[
              colors.primaryLight,
              colors.primary
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Plus
              size={22}
              color={colors.white}
              strokeWidth={2.5}
            />

            <Text style={styles.buttonText}>
              Nuevo proyecto
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 250,
    borderRadius: 28,
    padding: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#28598A"
  },
  decoration: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden"
  },
  glow: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    right: -100,
    top: -35,
    backgroundColor: "#0875CE",
    opacity: 0.25
  },
  projector: {
    position: "absolute",
    right: -12,
    top: 75,
    opacity: 0.65,
    transform: [{ rotate: "-12deg" }]
  },
  content: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18
  },
  title: {
    color: colors.white,
    fontSize: 27,
    fontWeight: "800",
    lineHeight: 33,
    letterSpacing: -0.6
  },
  description: {
    color: "#C1D3E8",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: "75%"
  },
  button: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4
  },
  buttonPressed: {
    opacity: 0.8
  },
  buttonGradient: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700"
  }
});
