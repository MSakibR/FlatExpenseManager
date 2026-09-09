import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { router } from "expo-router";

import { getAllMonths } from "../utils/storage";

export default function HomeScreen() {
  const months = getAllMonths();

  const currentMonth = months.length > 0 ? months[0] : null;

  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        <Image
          source={require("../../assets/banner.png")}
          style={styles.banner}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Flat Expense Manager</Text>

      <Text style={styles.subtitle}>Manage your monthly flat expenses</Text>

      {currentMonth && (
        <TouchableOpacity
          style={styles.currentCard}
          onPress={() => router.push(`/month/${currentMonth.month}`)}
        >
          <Text style={styles.currentLabel}>Current Month</Text>

          <Text style={styles.currentMonth}>{currentMonth.month}</Text>

          <Text style={styles.open}>Open Expense Sheet →</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/members")}
      >
        <Text style={styles.buttonText}>Manage Members</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/history")}
      >
        <Text style={styles.buttonText}>View History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/settings")}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },

  bannerContainer: {
    width: "100%",
    height: 180,
    alignSelf: "center",
    marginBottom: 20,
  },

  banner: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: -5,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 25,
  },

  currentCard: {
    backgroundColor: "#eff6ff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },

  currentLabel: {
    color: "#64748b",
    fontSize: 13,
  },

  currentMonth: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1d4ed8",
    marginTop: 4,
  },

  open: {
    color: "#2563eb",
    marginTop: 8,
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});
