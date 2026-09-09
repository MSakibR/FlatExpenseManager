import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useState } from "react";

import { getSettings, saveSettings } from "../utils/storage";

import { AppSettings } from "../models/types";

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function save() {
    saveSettings(settings);

    Alert.alert("Saved", "Settings updated successfully.");
  }

  function addCategory() {
    const category = newCategory.trim();

    if (!category) {
      return;
    }

    if (settings.categories.includes(category)) {
      Alert.alert("Already exists", "This category already exists.");

      return;
    }

    setSettings({
      ...settings,
      categories: [...settings.categories, category],
    });

    setNewCategory("");
  }

  function removeCategory(category: string) {
    Alert.alert("Remove Category", `Remove ${category}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setSettings({
            ...settings,
            categories: settings.categories.filter((item) => item !== category),
          });
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text
                    style={[
                      styles.title,
                      {
                        fontSize: 30,
                        fontWeight: "700",
                        marginTop: 35,
                      },
                    ]}
                  >Settings</Text>

      <Text style={styles.label}>Flat / House Name</Text>

      <TextInput
        style={styles.input}
        value={settings.flatName}
        onChangeText={(text) =>
          setSettings({
            ...settings,
            flatName: text,
          })
        }
      />

      <Text style={styles.label}>Currency</Text>

      <TextInput
        style={styles.input}
        value={settings.currency}
        onChangeText={(text) =>
          setSettings({
            ...settings,
            currency: text,
          })
        }
      />

      <Text style={styles.sectionTitle}>Expense Categories</Text>

      {settings.categories.map((category) => (
        <View key={category} style={styles.categoryRow}>
          <Text style={styles.category}>{category}</Text>

          <TouchableOpacity onPress={() => removeCategory(category)}>
            <Text style={styles.remove}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.addRow}>
        <TextInput
          style={styles.categoryInput}
          placeholder="New category"
          value={newCategory}
          onChangeText={setNewCategory}
        />

        <TouchableOpacity style={styles.addButton} onPress={addCategory}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={save}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  categoryRow: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  category: {
    fontSize: 16,
  },

  remove: {
    color: "#dc2626",
    fontWeight: "600",
  },

  addRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
  },

  categoryInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 14,
  },

  addButton: {
    marginLeft: 8,
    backgroundColor: "#16a34a",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 10,
  },

  addButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  saveButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
  },

  saveButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});
