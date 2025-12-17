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
    setBatches(updated.filter((b) => b.userId === user?.id));
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
          <TouchableOpacity onPress={() => selectBatch(b)}>
            <Text style={styles.batchName}>{b.name}</Text>
            <Text style={styles.batchDate}>
              {new Date(b.createdAt).toLocaleDateString("id-ID")}
            </Text>
          </TouchableOpacity>

          {/* ACTIONS */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => editBatch(b)}>
              <Text style={styles.edit}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteBatch(b.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}
