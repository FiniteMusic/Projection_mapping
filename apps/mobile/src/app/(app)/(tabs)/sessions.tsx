
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/theme";

export default function SessionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sesiones</Text>
      <Text style={styles.description}>
        Gestiona las conexiones con tus dispositivos de proyección.
      </Text>
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
    color: colors.textDarkSecondary,
    fontSize: 15,
    textAlign: "center",
    marginTop: 10
  }
});
