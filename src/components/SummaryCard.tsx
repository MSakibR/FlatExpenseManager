import { StyleSheet, Text, View } from "react-native";

interface Props {
  title: string;
  value: number;
  currency: string;
}

export default function SummaryCard({ title, value, currency }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.value}>
        {currency}
        {value.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  title: {
    color: "#64748b",
    fontSize: 14,
  },

  value: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
  },
});
