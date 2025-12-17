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

