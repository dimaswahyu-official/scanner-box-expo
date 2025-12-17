import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useSessionStore } from "../store/useSessionStore";
import { Batch } from "../types";
import { getData, saveData } from "../utils/storage";

export default function BatchScreen() {
  const user = useSessionStore((state) => state.user);
  const setBatch = useSessionStore((state) => state.setBatch);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // 🔒 PROTECT + LOAD
  useEffect(() => {
    if (!user) {
      router.replace("/user");
      return;
    }

    getData("batches").then((data) => {
      const filtered = data.filter(
        (b: Batch) => b.userId === user.id
      );
      setBatches(filtered);
    });
  }, [user]);

  const resetForm = () => {
    setName("");
    setEditingId(null);
  };

  const saveBatch = async () => {
    if (!user || !name) return;

    const all = await getData("batches");
    let updated: Batch[];

    if (editingId) {
      // ✏️ UPDATE
      updated = all.map((b: Batch) =>
        b.id === editingId ? { ...b, name } : b
      );
    } else {
      // ➕ ADD
      updated = [
        ...all,
        {
          id: Date.now().toString(),
          name,
          userId: user.id,
          createdAt: user.date || new Date().toISOString(),
          scans: [],
        },
      ];
    }

    await saveData("batches", updated);
    setBatches(updated.filter((b) => b.userId === user.id));
    resetForm();
  };

  const editBatch = (batch: Batch) => {
    setEditingId(batch.id);
    setName(batch.name);
  };

  const deleteBatch = async (id: string) => {
    const all = await getData("batches");
    const updated = all.filter((b: Batch) => b.id !== id);

    await saveData("batches", updated);
    setBatches(updated.filter((b:any) => b.userId === user?.id));
  };

  const selectBatch = (batch: Batch) => {
    setBatch(batch);
    router.push("/scanner");
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* HEADER USER */}
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>User</Text>
        <Text style={styles.headerName}>{user.name}</Text>

        {user.date && (
          <Text style={styles.headerDate}>
            Tanggal Batch:{" "}
            {new Date(user.date).toLocaleDateString("id-ID")}
          </Text>
        )}
      </View>

      {/* FORM */}
      <View style={styles.card}>
        <Text style={styles.title}>
          {editingId ? "Edit Batch" : "Tambah Batch"}
        </Text>

        <Text style={styles.label}>Nama Batch</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Batch Pagi"
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={saveBatch}>
          <Text style={styles.primaryText}>
            {editingId ? "Update Batch" : "Simpan Batch"}
          </Text>
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity onPress={resetForm}>
            <Text style={styles.cancel}>Batal Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LIST */}
      <Text style={styles.section}>Daftar Batch</Text>

      {batches.length === 0 && (
        <Text style={styles.empty}>Belum ada batch</Text>
      )}

      {batches.map((b) => (
        <View key={b.id} style={styles.batchCard}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => selectBatch(b)}>
              <Text style={styles.batchName}>{b.name}</Text>
              <Text style={styles.batchDate}>
              {new Date(b.createdAt).toLocaleDateString("id-ID")}
              </Text>
            </TouchableOpacity>
            <View style={[styles.actionRow, { marginTop: 0 }]}>
              <TouchableOpacity onPress={() => editBatch(b)}>
              <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteBatch(b.id)}>
              <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
            </View>
            </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  headerLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  headerDate: {
    marginTop: 6,
    fontSize: 13,
    color: "#374151",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cancel: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
  },

  section: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  empty: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 12,
  },

  batchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  batchName: {
    fontSize: 15,
    fontWeight: "500",
  },
  batchDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  actionRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  edit: {
    color: "#2563EB",
    fontWeight: "500",
  },
  delete: {
    color: "#DC2626",
    fontWeight: "500",
  },
});
