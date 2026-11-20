
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/auth.context";
import { colors } from "@/constants/theme";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  async function handleLogout() {
    try {
      await signOut();
    } catch {
      Alert.alert(
        "Aviso",
        "La sesión local se cerró, pero no fue posible confirmar el cierre en el servidor."
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>

      <Text style={styles.description}>
        {user?.name}
      </Text>

      <Text style={styles.email}>
        {user?.email}
      </Text>

      <Pressable
        onPress={() => void handleLogout()}
        style={styles.button}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          Cerrar sesión
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.backgroundLight
  },
  title: {
    color: colors.textDark,
    fontSize: 28,
    fontWeight: "800"
  },
  description: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24
  },
  email: {
    color: colors.textDarkSecondary,
    fontSize: 14,
    marginTop: 6
  },
  button: {
    backgroundColor: colors.navy,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 15,
    marginTop: 32
  },
  buttonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15
  }
});
