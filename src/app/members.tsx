import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useState } from "react";

import {
  addMember,
  deleteMember,
  getMembers,
  updateMember,
} from "../utils/storage";

import { Member } from "../models/types";

export default function MembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  function loadMembers() {
    const data = getMembers();
    setMembers(data);
  }

  function resetForm() {
    setName("");
    setPhone("");
    setEditingId(null);
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter member name.");

      return;
    }

    if (editingId) {
      const updatedMember: Member = {
        id: editingId,
        name: name.trim(),
        phone: phone.trim(),
      };

      updateMember(updatedMember);
    } else {
      const newMember: Member = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone.trim(),
      };

      addMember(newMember);
    }

    loadMembers();
    resetForm();
  }

  function handleEdit(member: Member) {
    setEditingId(member.id);
    setName(member.name);
    setPhone(member.phone ?? "");
  }

  function handleDelete(member: Member) {
    Alert.alert(
      "Delete Member",
      `Are you sure you want to delete ${member.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMember(member.id);
            loadMembers();
          },
        },
      ],
    );
  }

  function renderMember({ item }: { item: Member }) {
    return (
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View>
            <Text style={styles.memberName}>{item.name}</Text>

            {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : null}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <Text style={styles.edit}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Text style={styles.delete}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text
                    style={[
                      styles.title,
                      {
                        fontSize: 27,
                        fontWeight: "700",
                        marginTop: 35,
                      },
                    ]}
                  >Manage Members</Text>

      <Text style={styles.subtitle}>Add the people living in your flat</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Member name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Phone number (optional)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {editingId ? "Update Member" : "Add Member"}
          </Text>
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.cancelText}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.listTitle}>Members ({members.length})</Text>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No members added yet.</Text>
        }
      />
    </KeyboardAvoidingView>
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
    fontWeight: "700",
    marginTop: 20,
  },

  subtitle: {
    color: "#64748b",
    marginTop: 6,
    marginBottom: 20,
  },

  form: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f8fafc",
  },

  saveButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
  },

  saveButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },

  cancelButton: {
    marginTop: 10,
    padding: 12,
  },

  cancelText: {
    textAlign: "center",
    color: "#64748b",
  },

  listTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  list: {
    paddingBottom: 30,
  },

  memberCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
  },

  memberName: {
    fontSize: 17,
    fontWeight: "600",
  },

  phone: {
    color: "#64748b",
    marginTop: 3,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  edit: {
    color: "#2563eb",
    fontWeight: "600",
  },

  delete: {
    color: "#dc2626",
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    color: "#94a3b8",
    marginTop: 30,
  },
});
