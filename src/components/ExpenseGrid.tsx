import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Member, MonthlyMember } from "../models/types";

interface Props {
  members: Member[];
  monthlyMembers: MonthlyMember[];
  categories: string[];
  currency: string;

  onAmountChange: (memberId: string, category: string, value: number) => void;

  onGivenChange: (memberId: string, value: number) => void;

  onPreviousDueChange: (memberId: string, value: number) => void;
}

export default function ExpenseGrid({
  members,
  monthlyMembers,
  categories,
  currency,
  onAmountChange,
  onGivenChange,
  onPreviousDueChange,
}: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <View style={styles.headerRow}>
          <Text style={styles.memberHeader}>Member</Text>

          {categories.map((category) => (
            <Text key={category} style={styles.headerCell}>
              {category}
            </Text>
          ))}

          <Text style={styles.headerCell}>Previous</Text>

          <Text style={styles.headerCell}>Total</Text>

          <Text style={styles.headerCell}>Given</Text>

          <Text style={styles.headerCell}>Back</Text>
        </View>

        {members.map((member) => {
          const data = monthlyMembers.find(
            (item) => item.memberId === member.id,
          );

          if (!data) {
            return null;
          }

          return (
            <View key={member.id} style={styles.row}>
              <Text style={styles.memberCell}>{member.name}</Text>

              {categories.map((category) => (
                <TextInput
                  key={category}
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(data.amounts[category] ?? 0)}
                  onChangeText={(text) =>
                    onAmountChange(member.id, category, Number(text) || 0)
                  }
                />
              ))}

              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(data.dueFromPrevMonth)}
                onChangeText={(text) =>
                  onPreviousDueChange(member.id, Number(text) || 0)
                }
              />

              <Text style={styles.totalCell}>
                {currency}
                {data.total}
              </Text>

              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(data.given)}
                onChangeText={(text) =>
                  onGivenChange(member.id, Number(text) || 0)
                }
              />

              <Text
                style={[
                  styles.backCell,
                  data.back < 0
                    ? styles.due
                    : data.back > 0
                      ? styles.advance
                      : styles.paid,
                ]}
              >
                {currency}
                {Math.abs(data.back)}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },

  memberHeader: {
    width: 130,
    padding: 12,
    color: "#ffffff",
    fontWeight: "700",
  },

  headerCell: {
    width: 110,
    padding: 12,
    color: "#ffffff",
    fontWeight: "700",
    textAlign: "center",
  },

  memberCell: {
    width: 130,
    padding: 10,
    fontWeight: "600",
  },

  input: {
    width: 110,
    height: 45,
    margin: 4,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: "center",
  },

  totalCell: {
    width: 110,
    textAlign: "center",
    fontWeight: "700",
  },

  backCell: {
    width: 110,
    textAlign: "center",
    fontWeight: "700",
  },

  due: {
    color: "#dc2626",
  },

  advance: {
    color: "#2563eb",
  },

  paid: {
    color: "#16a34a",
  },
});
