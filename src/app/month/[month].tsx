import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";

import { useEffect, useState } from "react";

import { MonthlyExpense, MonthlyMember } from "../../models/types";

import {
  getMonth,
  saveMonth,
  getSettings,
  getMembers,
} from "../../utils/storage";

import { calculateMonthTotals } from "../../utils/calculations";

import ExpenseEditModal from "../../components/ExpenseEditModal";

import { generateInvoice, shareInvoice } from "../../utils/pdf";

export default function MonthScreen() {
  const params = useLocalSearchParams();

  const monthId = Array.isArray(params.month) ? params.month[0] : params.month;

  const [month, setMonth] = useState<MonthlyExpense | null>(null);

  const [selectedMember, setSelectedMember] = useState<MonthlyMember | null>(
    null,
  );

  const [modalVisible, setModalVisible] = useState(false);

  const [currency, setCurrency] = useState("৳");

  /*
   * Owner payment input.
   */
  const [ownerGivenInput, setOwnerGivenInput] = useState("0");

  useEffect(() => {
    loadMonth();
  }, [monthId]);

  function loadMonth() {
    if (!monthId) {
      return;
    }

    const data = getMonth(monthId);

    if (!data) {
      Alert.alert("Month not found", "This month could not be found.");

      return;
    }

    /*
     * Backward compatibility:
     *
     * If old month doesn't have owner fields,
     * initialize them.
     */
    const fixedMonth: MonthlyExpense = {
      ...data,

      ownerTotal: Number(data.ownerTotal || 0),

      ownerGiven: Number(data.ownerGiven || 0),

      ownerDue: Number(data.ownerDue || 0),
    };

    setMonth(fixedMonth);

    setOwnerGivenInput(String(fixedMonth.ownerGiven));

    const settings = getSettings();

    setCurrency(settings.currency || "৳");
  }

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  function openMember(member: MonthlyMember) {
    setSelectedMember(member);

    setModalVisible(true);
  }

  // ==========================================
  // SAVE MEMBER CHANGES
  // ==========================================

  function handleSaveMember(updatedMember: MonthlyMember) {
    if (!month) {
      return;
    }

    const updatedMembers = month.members.map((member: MonthlyMember) =>
      member.memberId === updatedMember.memberId ? updatedMember : member,
    );

    const updatedMonth: MonthlyExpense = {
      ...month,

      members: updatedMembers,

      updatedAt: new Date().toISOString(),
    };

    /*
     * Save member changes.
     */
    saveMonth(updatedMonth);

    setMonth(updatedMonth);

    setSelectedMember(null);

    setModalVisible(false);
  }

  // ==========================================
  // OWNER PAYMENT
  // ==========================================

  function handleOwnerGivenChange(value: string) {
    /*
     * Allow only numbers and decimal point.
     */
    const cleaned = value.replace(/[^0-9.]/g, "");

    setOwnerGivenInput(cleaned);
  }

  function handleSaveOwnerPayment() {
    if (!month) {
      return;
    }

    const ownerGiven = Number(ownerGivenInput) || 0;

    const totals = calculateMonthTotals({
      ...month,

      ownerGiven,
    });

    const updatedMonth: MonthlyExpense = {
      ...month,

      ownerTotal: totals.ownerTotal,

      ownerGiven,

      ownerDue: totals.ownerDue,

      updatedAt: new Date().toISOString(),
    };

    saveMonth(updatedMonth);

    setMonth(updatedMonth);

    setOwnerGivenInput(String(ownerGiven));

    Alert.alert("Saved", "Flat owner payment has been updated.");
  }

  // ==========================================
  // GENERATE PDF
  // ==========================================

  async function handleGeneratePDF(data: MonthlyMember) {
    try {
      if (!month) {
        return;
      }

      const members = getMembers();

      const actualMember = members.find((item) => item.id === data.memberId);

      if (!actualMember) {
        Alert.alert("Member not found", "Could not find this member.");

        return;
      }

      const uri = await generateInvoice(month, actualMember, data);

      Alert.alert(
        "PDF Generated",
        `${actualMember.name}'s invoice has been generated successfully.`,
        [
          {
            text: "Share PDF",
            onPress: async () => {
              try {
                await shareInvoice(uri);
              } catch (error) {
                console.error("PDF sharing failed:", error);

                Alert.alert("Sharing Failed", "Could not share the PDF.");
              }
            },
          },

          {
            text: "OK",
            style: "cancel",
          },
        ],
      );
    } catch (error) {
      console.error("PDF generation failed:", error);

      Alert.alert("PDF Error", "Could not generate the expense invoice.");
    }
  }

  // ==========================================

  if (!month) {
    return (
      <View style={styles.center}>
        <Text>Loading month...</Text>
      </View>
    );
  }

  const totals = calculateMonthTotals(month);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text
              style={[
                styles.title,
                {
                  fontSize: 24,
                  fontWeight: "700",
                  marginTop: 35,
                },
              ]}
            >
              {month.flatName}
            </Text>

            <Text style={styles.subtitle}>{month.month}</Text>
          </View>
        </View>

        {/* ================= SUMMARY ================= */}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Monthly Summary</Text>

          <View style={styles.summaryRow}>
            <Text>Total Expense</Text>

            <Text style={styles.bold}>
              {currency}
              {totals.totalExpense.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text>Total Given</Text>

            <Text style={styles.green}>
              {currency}
              {totals.totalGiven.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text>Total Due</Text>

            <Text style={styles.red}>
              {currency}
              {totals.totalDue.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text>Total Advance</Text>

            <Text style={styles.blue}>
              {currency}
              {totals.totalAdvance.toLocaleString()}
            </Text>
          </View>

          <View style={styles.memberSummary}>
            <Text>Members: {totals.memberCount}</Text>

            <Text style={styles.green}>Paid: {totals.paidMembers}</Text>

            <Text style={styles.red}>Due: {totals.dueMembers}</Text>
          </View>
        </View>

        {/* ================= OWNER PAYMENT ================= */}

        <View style={styles.ownerCard}>
          <Text style={styles.ownerTitle}>Flat Owner Payment</Text>

          <Text style={styles.ownerDescription}>
            Room costs + Water Bill + Gas Bill + Electric Bill
          </Text>

          {/* OWNER TOTAL */}

          <View style={styles.summaryRow}>
            <Text>Owner Will Get</Text>

            <Text style={styles.bold}>
              {currency}
              {totals.ownerTotal.toLocaleString()}
            </Text>
          </View>

          {/* OWNER GIVEN */}

          <View style={styles.ownerInputRow}>
            <Text style={styles.ownerInputLabel}>Given</Text>

            <TextInput
              value={ownerGivenInput}
              onChangeText={handleOwnerGivenChange}
              keyboardType="numeric"
              placeholder="0"
              style={styles.ownerInput}
            />
          </View>

          {/* OWNER DUE */}

          <View style={styles.ownerDueRow}>
            <Text style={styles.bold}>Due to Owner</Text>

            <Text
              style={[
                styles.bold,
                totals.ownerDue > 0 ? styles.red : styles.green,
              ]}
            >
              {currency}
              {totals.ownerDue.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.ownerSaveButton}
            onPress={handleSaveOwnerPayment}
            activeOpacity={0.8}
          >
            <Text style={styles.ownerSaveText}>Save Owner Payment</Text>
          </TouchableOpacity>
        </View>

        {/* ================= MEMBERS ================= */}

        <Text style={styles.sectionTitle}>Member Expenses</Text>

        {month.members.map((monthlyMember: MonthlyMember) => {
          const backText =
            monthlyMember.back < 0
              ? `Due: ${currency}${Math.abs(
                  monthlyMember.back,
                ).toLocaleString()}`
              : monthlyMember.back > 0
                ? `Advance: ${currency}${monthlyMember.back.toLocaleString()}`
                : "Cleared";

          const actualMember = getMembers().find(
            (item) => item.id === monthlyMember.memberId,
          );

          const memberName = actualMember?.name ?? monthlyMember.memberId;

          return (
            <View key={monthlyMember.memberId} style={styles.memberCard}>
              {/* MEMBER HEADER */}

              <TouchableOpacity
                onPress={() => openMember(monthlyMember)}
                activeOpacity={0.8}
              >
                <View style={styles.memberHeader}>
                  <Text style={styles.memberName}>{memberName}</Text>

                  <Text
                    style={[
                      styles.status,

                      monthlyMember.status === "Paid" && styles.statusPaid,

                      monthlyMember.status === "Partially Paid" &&
                        styles.statusPartial,

                      monthlyMember.status === "Due" && styles.statusDue,

                      monthlyMember.status === "Advance" &&
                        styles.statusAdvance,
                    ]}
                  >
                    {monthlyMember.status}
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* TOTAL */}

                <View style={styles.row}>
                  <Text>Total</Text>

                  <Text>
                    {currency}
                    {monthlyMember.total.toLocaleString()}
                  </Text>
                </View>

                {/* PREVIOUS DUE */}

                <View style={styles.row}>
                  <Text>Previous Due</Text>

                  <Text>
                    {currency}
                    {monthlyMember.dueFromPrevMonth.toLocaleString()}
                  </Text>
                </View>

                {/* GRAND TOTAL */}

                <View style={styles.row}>
                  <Text>Grand Total</Text>

                  <Text style={styles.bold}>
                    {currency}
                    {monthlyMember.grandTotalOwed.toLocaleString()}
                  </Text>
                </View>

                {/* GIVEN */}

                <View style={styles.row}>
                  <Text>Given</Text>

                  <Text style={styles.green}>
                    {currency}
                    {monthlyMember.given.toLocaleString()}
                  </Text>
                </View>

                {/* BACK */}

                <View style={styles.backRow}>
                  <Text style={styles.bold}>Back</Text>

                  <Text
                    style={[
                      styles.bold,

                      monthlyMember.back < 0
                        ? styles.red
                        : monthlyMember.back > 0
                          ? styles.blue
                          : styles.green,
                    ]}
                  >
                    {backText}
                  </Text>
                </View>

                {/* EDIT */}

                <Text style={styles.editHint}>Tap to edit expenses</Text>
              </TouchableOpacity>

              {/* PDF BUTTON */}

              <TouchableOpacity
                style={styles.pdfButton}
                onPress={() => handleGeneratePDF(monthlyMember)}
                activeOpacity={0.8}
              >
                <Text style={styles.pdfButtonText}>📄 Generate PDF</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* ================= EDIT MODAL ================= */}

      {selectedMember && (
        <ExpenseEditModal
          visible={modalVisible}
          month={month}
          member={selectedMember}
          memberName={
            getMembers().find((item) => item.id === selectedMember.memberId)
              ?.name ?? selectedMember.memberId
          }
          currency={currency}
          onClose={() => {
            setModalVisible(false);
            setSelectedMember(null);
          }}
          onSave={handleSaveMember}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    fontSize: 30,
    marginRight: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
  },

  subtitle: {
    color: "#64748b",
    marginTop: 3,
  },

  summaryCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  memberSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
    marginTop: 5,
  },

  /* ================= OWNER ================= */

  ownerCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 24,
  },

  ownerTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 5,
  },

  ownerDescription: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 16,
  },

  ownerInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  ownerInputLabel: {
    fontSize: 15,
    fontWeight: "600",
  },

  ownerInput: {
    width: 130,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 10,
    padding: 11,
    textAlign: "right",
    fontSize: 16,
  },

  ownerDueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 13,
    marginTop: 5,
  },

  ownerSaveButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
  },

  ownerSaveText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "700",
  },

  /* ================= MEMBERS ================= */

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },

  memberCard: {
    backgroundColor: "#ffffff",
    padding: 17,
    borderRadius: 18,
    marginBottom: 14,
  },

  memberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  memberName: {
    fontSize: 18,
    fontWeight: "800",
  },

  status: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "700",
  },

  statusPaid: {
    color: "#16a34a",
    backgroundColor: "#dcfce7",
  },

  statusPartial: {
    color: "#ea580c",
    backgroundColor: "#ffedd5",
  },

  statusDue: {
    color: "#dc2626",
    backgroundColor: "#fee2e2",
  },

  statusAdvance: {
    color: "#2563eb",
    backgroundColor: "#dbeafe",
  },

  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  backRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 11,
    marginTop: 4,
  },

  bold: {
    fontWeight: "800",
  },

  green: {
    color: "#16a34a",
    fontWeight: "700",
  },

  red: {
    color: "#dc2626",
    fontWeight: "700",
  },

  blue: {
    color: "#2563eb",
    fontWeight: "700",
  },

  editHint: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 14,
  },

  pdfButton: {
    marginTop: 12,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingVertical: 11,
    borderRadius: 10,
  },

  pdfButtonText: {
    textAlign: "center",
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "700",
  },
});
