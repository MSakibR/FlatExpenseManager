import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useFocusEffect } from "expo-router";

import { useCallback, useState } from "react";

import { createMonth, deleteMonth, getAllMonths } from "../utils/storage";

import { MonthlyExpense } from "../models/types";

export default function HistoryScreen() {
  const [months, setMonths] = useState<MonthlyExpense[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadMonths();
    }, []),
  );

  function loadMonths() {
    setMonths(getAllMonths());
  }

  function formatMonth(month: string) {
    const date = new Date(`${month}-01T00:00:00`);

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  function createNewMonth() {
    const now = new Date();

    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    if (months.some((m) => m.month === month)) {
      Alert.alert("Month exists", `${formatMonth(month)} already exists.`);

      return;
    }

    const previous = months.length > 0 ? months[0] : null;

    createMonth(month, previous);

    loadMonths();

    router.push(`/month/${month}`);
  }

  function deleteMonthConfirm(month: MonthlyExpense) {
    Alert.alert("Delete Month", `Delete ${formatMonth(month.month)}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMonth(month.month);

          loadMonths();
        },
      },
    ]);
  }

  function renderMonth({ item }: { item: MonthlyExpense }) {
    const totalExpense = item.members.reduce(
      (sum, member) => sum + member.total,
      0,
    );

    const totalGiven = item.members.reduce(
      (sum, member) => sum + member.given,
      0,
    );

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/month/${item.month}`)}
        onLongPress={() => deleteMonthConfirm(item)}
      >
        <View>
          <Text style={styles.month}>{formatMonth(item.month)}</Text>

          <Text style={styles.members}>{item.members.length} members</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.total}>৳{totalExpense.toLocaleString()}</Text>

          <Text style={styles.given}>Given ৳{totalGiven.toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text
                    style={[
                      styles.title,
                      {
                        fontSize: 24,
                        fontWeight: "700",
                        marginTop: 35,
                      },
                    ]}
                  >Monthly History</Text>

      <Text style={styles.subtitle}>Open any month to view or edit</Text>

      <TouchableOpacity style={styles.newButton} onPress={createNewMonth}>
        <Text style={styles.newButtonText}>+ Add New Month</Text>
      </TouchableOpacity>

      <FlatList
        data={months}
        keyExtractor={(item) => item.month}
        renderItem={renderMonth}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No months created yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    color: "#64748b",
    marginTop: 5,
    marginBottom: 20,
  },

  newButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },

  newButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 17,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  month: {
    fontSize: 18,
    fontWeight: "800",
  },

  members: {
    color: "#64748b",
    marginTop: 4,
  },

  right: {
    alignItems: "flex-end",
  },

  total: {
    fontSize: 16,
    fontWeight: "800",
  },

  given: {
    color: "#16a34a",
    marginTop: 3,
    fontSize: 12,
  },

  empty: {
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 40,
  },
});
