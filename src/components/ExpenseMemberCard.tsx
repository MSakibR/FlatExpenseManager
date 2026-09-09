import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { MonthlyMember } from "../models/types";

import StatusBadge from "./StatusBadge";

interface Props {
  memberName: string;
  member: MonthlyMember;
  currency: string;
  onEdit: () => void;
}

export default function ExpenseMemberCard({
  memberName,
  member,
  currency,
  onEdit,
}: Props) {
  const backText =
    member.back < 0
      ? `Due: ${currency}${Math.abs(member.back)}`
      : member.back > 0
        ? `Advance: ${currency}${member.back}`
        : "Cleared";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.name}>{memberName}</Text>

          <Text style={styles.small}>Monthly Expense</Text>
        </View>

        <StatusBadge status={member.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Total</Text>

        <Text style={styles.value}>
          {currency}
          {member.total.toLocaleString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Previous Due</Text>

        <Text style={styles.value}>
          {currency}
          {member.dueFromPrevMonth.toLocaleString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Grand Total Owed</Text>

        <Text style={styles.bold}>
          {currency}
          {member.grandTotalOwed.toLocaleString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Given</Text>

        <Text style={styles.given}>
          {currency}
          {member.given.toLocaleString()}
        </Text>
      </View>

      <View style={styles.backBox}>
        <Text style={styles.backLabel}>Back</Text>

        <Text
          style={[
            styles.backValue,
            {
              color:
                member.back < 0
                  ? "#dc2626"
                  : member.back > 0
                    ? "#2563eb"
                    : "#16a34a",
            },
          ]}
        >
          {backText}
        </Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Text style={styles.editText}>Edit Expenses</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },

  small: {
    marginTop: 3,
    color: "#64748b",
  },

  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    color: "#64748b",
    fontSize: 14,
  },

  value: {
    color: "#334155",
    fontWeight: "600",
  },

  bold: {
    color: "#0f172a",
    fontWeight: "800",
  },

  given: {
    color: "#16a34a",
    fontWeight: "700",
  },

  backBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  backLabel: {
    fontWeight: "700",
    color: "#334155",
  },

  backValue: {
    fontWeight: "800",
  },

  editButton: {
    backgroundColor: "#2563eb",
    padding: 13,
    borderRadius: 10,
  },

  editText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "700",
  },
});
