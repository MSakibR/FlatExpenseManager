import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Member, MonthlyMember } from "../models/types";

import StatusBadge from "./StatusBadge";

interface Props {
  member: Member;
  data: MonthlyMember;
  currency: string;
  onInvoice: () => void;
}

export default function MemberCard({
  member,
  data,
  currency,
  onInvoice,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{member.name}</Text>

          {member.phone ? (
            <Text style={styles.phone}>{member.phone}</Text>
          ) : null}
        </View>

        <StatusBadge status={data.status} />
      </View>

      <View style={styles.row}>
        <Text>Total</Text>

        <Text style={styles.amount}>
          {currency}
          {data.total.toLocaleString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Text>Previous Due</Text>

        <Text style={styles.amount}>
          {currency}
          {data.dueFromPrevMonth.toLocaleString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Text>Grand Total</Text>

        <Text style={styles.amount}>
          {currency}
          {data.grandTotalOwed.toLocaleString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Text>Given</Text>

        <Text style={styles.amount}>
          {currency}
          {data.given.toLocaleString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Text>
          {data.back < 0 ? "Due" : data.back > 0 ? "Advance" : "Balance"}
        </Text>

        <Text style={styles.amount}>
          {currency}
          {Math.abs(data.back).toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity style={styles.invoiceButton} onPress={onInvoice}>
        <Text style={styles.invoiceText}>Generate Invoice</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
  },

  phone: {
    color: "#64748b",
    marginTop: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  amount: {
    fontWeight: "600",
  },

  invoiceButton: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
  },

  invoiceText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
  },
});
