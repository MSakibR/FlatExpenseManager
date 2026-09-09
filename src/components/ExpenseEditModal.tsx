import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useState } from "react";

import { MonthlyExpense, MonthlyMember } from "../models/types";

import { calculateMember } from "../utils/calculations";

interface Props {
  visible: boolean;

  month: MonthlyExpense;

  member: MonthlyMember | null;

  memberName: string;

  currency: string;

  onClose: () => void;

  onSave: (updated: MonthlyMember) => void;
}

export default function ExpenseEditModal({
  visible,
  month,
  member,
  memberName,
  currency,
  onClose,
  onSave,
}: Props) {
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  const [previousDue, setPreviousDue] = useState("0");

  const [given, setGiven] = useState("0");

  useEffect(() => {
    if (!member) return;

    setAmounts({
      ...member.amounts,
    });

    setPreviousDue(String(member.dueFromPrevMonth));

    setGiven(String(member.given));
  }, [member, visible]);

  if (!member) {
    return null;
  }

  const tempMember = calculateMember({
    memberId: member.memberId,
    amounts,
    dueFromPrevMonth: Number(previousDue) || 0,
    given: Number(given) || 0,
  });

  function updateAmount(category: string, value: string) {
    const numberValue = Number(value.replace(/[^0-9.]/g, "")) || 0;

    setAmounts((prev) => ({
      ...prev,
      [category]: numberValue,
    }));
  }

  function handleSave() {
    if (!member) {
      return;
    }

    const calculated = calculateMember({
      memberId: member.memberId,
      amounts,
      dueFromPrevMonth: Number(previousDue) || 0,
      given: Number(given) || 0,
    });

    onSave(calculated);
  }

  const backText =
    tempMember.back < 0
      ? `Due: ${currency}${Math.abs(tempMember.back).toLocaleString()}`
      : tempMember.back > 0
        ? `Advance: ${currency}${tempMember.back.toLocaleString()}`
        : "Cleared";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{memberName}</Text>

              <Text style={styles.subtitle}>{month.month}</Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Expense Bills</Text>

            {month.categories.map((category) => (
              <View key={category} style={styles.inputRow}>
                <Text style={styles.category}>{category}</Text>

                <TextInput
                  value={String(amounts[category] ?? 0)}
                  onChangeText={(value) => updateAmount(category, value)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            ))}

            <View style={styles.separator} />

            <View style={styles.inputRow}>
              <Text style={styles.category}>Previous Due / Advance</Text>

              <TextInput
                value={previousDue}
                onChangeText={setPreviousDue}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <Text style={styles.helper}>
              Positive = previous due, negative = previous advance
            </Text>

            <View style={styles.inputRow}>
              <Text style={styles.category}>Given</Text>

              <TextInput
                value={given}
                onChangeText={setGiven}
                keyboardType="numeric"
                style={[styles.input, styles.givenInput]}
              />
            </View>

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text>Total</Text>

                <Text>
                  {currency}
                  {tempMember.total.toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>Grand Total Owed</Text>

                <Text style={styles.bold}>
                  {currency}
                  {tempMember.grandTotalOwed.toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>Given</Text>

                <Text style={styles.green}>
                  {currency}
                  {tempMember.given.toLocaleString()}
                </Text>
              </View>

              <View style={styles.backRow}>
                <Text style={styles.bold}>Back</Text>

                <Text
                  style={[
                    styles.back,
                    {
                      color:
                        tempMember.back < 0
                          ? "#dc2626"
                          : tempMember.back > 0
                            ? "#2563eb"
                            : "#16a34a",
                    },
                  ]}
                >
                  {backText}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
  },

  subtitle: {
    color: "#64748b",
    marginTop: 3,
  },

  close: {
    fontSize: 24,
    color: "#64748b",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 12,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  category: {
    flex: 1,
    color: "#334155",
    fontSize: 15,
  },

  input: {
    width: 120,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 9,
    padding: 10,
    textAlign: "right",
  },

  givenInput: {
    borderColor: "#86efac",
  },

  helper: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 12,
  },

  separator: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },

  summary: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 15,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  backRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  bold: {
    fontWeight: "800",
  },

  green: {
    color: "#16a34a",
    fontWeight: "700",
  },

  back: {
    fontWeight: "800",
  },

  saveButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 11,
  },

  saveText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },

  cancelButton: {
    padding: 14,
  },

  cancelText: {
    textAlign: "center",
    color: "#64748b",
    fontWeight: "600",
  },
});
