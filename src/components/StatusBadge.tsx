import { StyleSheet, Text, View } from "react-native";

import { ExpenseStatus } from "../models/types";

interface Props {
  status: ExpenseStatus;
}

export default function StatusBadge({ status }: Props) {
  let backgroundColor = "#dcfce7";
  let color = "#166534";

  if (status === "Due") {
    backgroundColor = "#fee2e2";
    color = "#b91c1c";
  }

  if (status === "Partially Paid") {
    backgroundColor = "#ffedd5";
    color = "#c2410c";
  }

  if (status === "Advance") {
    backgroundColor = "#dbeafe";
    color = "#1d4ed8";
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
