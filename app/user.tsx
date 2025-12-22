import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { User } from "../types";
import { getData, saveData } from "@/utils/storage";
import { useSessionStore } from "../store/useSessionStore";

export default function UserScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requestFrom, setRequestFrom] = useState("");
  const [date, setDate] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [successVisible, setSuccessVisible] = useState(false);
const [successMessage, setSuccessMessage] = useState("");


  const setUser = useSessionStore((state) => state.setUser);

useFocusEffect(
  useCallback(() => {
    getData("users").then(setUsers);
    getData("batches").then(setBatches);
  }, [])
);

const getUserStats = (userId: string) => {
  const userBatches = batches.filter(
    (b) => b.userId === userId
  );

  const totalScans = userBatches.reduce(
    (sum, b) => sum + (b.scans?.length || 0),
    0
  );

  return {
    batchCount: userBatches.length,
    scanCount: totalScans,
  };
};


  const resetForm = () => {
    setName("");
    setPhone("");
    setRequestFrom("");
    setEditingId(null);
  };

  const saveUser = async () => {
  if (!name || !phone) {
    Alert.alert("Validasi", "Nama dan telepon wajib diisi");
    return;
  }

  let updated;
  const isEdit = !!editingId;

  if (editingId) {
    updated = users.map((u) =>
      u.id === editingId
        ? { ...u, name, phone }
        : u
    );
  } else {
    updated = [
      ...users,
      {
        id: Date.now().toString(),
        name,
        phone,
        requestFrom,
        date: date.toISOString(),
      },
    ];
  }

  setUsers(updated);
  await saveData("users", updated);
  resetForm();

  // ✅ TAMPILKAN SUCCESS DIALOG
  setSuccessMessage(
    isEdit
      ? "User berhasil diperbarui"
      : "User berhasil ditambahkan"
  );
  setSuccessVisible(true);
};

  const editUser = (u: any) => {
    setEditingId(u.id);
    setName(u.name);
    setPhone(u.phone);
    setRequestFrom(u.requestFrom || "");
    setDate(u.date ? new Date(u.date) : new Date());
  };

const deleteUser = (id: string) => {
  Alert.alert(
    "Hapus User",
    "Apakah kamu yakin ingin menghapus user ini?",
    [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const updated = users.filter((u) => u.id !== id);
          setUsers(updated);
          await saveData("users", updated);
        },
      },
    ],
    { cancelable: true }
  );
};


  const selectUser = (u: User) => {
    setUser(u);
    router.push("/batch");
  };

  return (
    <View style={styles.container}>
      {/* FORM */}
      <View style={styles.card}>
        <Text style={styles.title}>Tambah User</Text>

        <Text style={styles.label}>Nama</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama user"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Telepon</Text>
        <TextInput
          style={styles.input}
          placeholder="08xxxxxxxx"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />



        <TouchableOpacity style={styles.primaryBtn} onPress={saveUser}>
          <Text style={styles.primaryText}>
            {editingId ? "Update User" : "Simpan User"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <Text style={styles.section}>Pilih User</Text>

     {users.map((u) => {
  const { batchCount, scanCount } = getUserStats(u.id);

  return (
    <View key={u.id} style={styles.userCard}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={() => selectUser(u)}>
          <Text style={styles.userName}>{u.name}</Text>
          <Text style={styles.userPhone}>{u.phone}</Text>

          {/* 🔢 STAT */}
          <Text style={styles.userStats}>
            {batchCount} Batch • {scanCount} Scan
          </Text>
        </TouchableOpacity>

        <View style={[styles.actionRow, { marginTop: 0 }]}>
          <TouchableOpacity onPress={() => editUser(u)}>
            <Text style={styles.edit}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteUser(u.id)}>
            <Text style={styles.delete}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
})}

<Modal
  transparent
  animationType="fade"
  visible={successVisible}
  onRequestClose={() => setSuccessVisible(false)}
>
  <View style={styles.overlay}>
    <View style={styles.modal}>
      <Text style={styles.modalTitle}>Berhasil 🎉</Text>
      <Text style={{ marginBottom: 16 }}>{successMessage}</Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => setSuccessVisible(false)}
      >
        <Text style={styles.primaryText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFF",
    fontWeight: "600",
  },
  section: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  userCard: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: "500",
  },
  userPhone: {
    fontSize: 13,
    color: "#6B7280",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 16,
  },
  edit: { color: "#2563EB" },
  delete: { color: "#DC2626" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
  },
  userStats: {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 4,
},

});
