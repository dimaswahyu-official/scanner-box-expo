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

  // 🔒 PROTECT
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

  const addBatch = async () => {
    if (!user || !name) return;

    const newBatch: Batch = {
      id: Date.now().toString(),
      name,
      userId: user.id,
      createdAt: user.date || new Date().toISOString(), // 🔥 ambil tanggal dari user
      scans: [],
    };

    const all = await getData("batches");
    const updated = [...all, newBatch];

    await saveData("batches", updated);
    setBatches((prev) => [...prev, newBatch]);
    setName("");
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

      {/* ADD BATCH */}
      <View style={styles.card}>
        <Text style={styles.title}>Tambah Batch</Text>

        <Text style={styles.label}>Nama Batch</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Batch Pagi"
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={addBatch}>
          <Text style={styles.primaryText}>Simpan Batch</Text>
        </TouchableOpacity>
      </View>

      {/* LIST BATCH */}
      <Text style={styles.section}>Daftar Batch</Text>

      {batches.length === 0 && (
        <Text style={styles.empty}>Belum ada batch</Text>
      )}

      {batches.map((b) => (
        <TouchableOpacity
          key={b.id}
          style={styles.batchCard}
          onPress={() => selectBatch(b)}
        >
          <Text style={styles.batchName}>{b.name}</Text>
          <Text style={styles.batchDate}>
            {new Date(b.createdAt).toLocaleDateString("id-ID")}
          </Text>
        </TouchableOpacity>
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
});
