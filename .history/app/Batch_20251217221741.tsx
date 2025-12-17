import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { Batch } from "../types";
import { getData, saveData } from "@/utils/storage";
import { useSessionStore } from "@/store/useSessionStore";

export default function BatchScreen() {
  const user = useSessionStore((state) => state.user);
  const setBatch = useSessionStore((state) => state.setBatch);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [name, setName] = useState("");

  // 🔥 PROTECT: kalau user belum dipilih
  useEffect(() => {
    if (!user) {
      router.replace("/user");
      return;
    }

    getData<Batch>("batches").then((data) => {
      setBatches(data.filter((b) => b.userId === user.id));
    });
  }, [user]);

  const addBatch = async () => {
    if (!user || !name) return;

    const newBatch: Batch = {
      id: Date.now().toString(),
      name,
      userId: user.id,
      createdAt: new Date().toISOString(),
      scans: [],
    };

    const allBatches = await getData<Batch>("batches");
    const updated = [...allBatches, newBatch];

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
    <View style={{ padding: 16 }}>
      <Text>User: {user.name}</Text>

      <TextInput
        placeholder="Nama Batch"
        value={name}
        onChangeText={setName}
      />

      <Button title="Add Batch" onPress={addBatch} />

      {batches.map((b) => (
        <TouchableOpacity key={b.id} onPress={() => selectBatch(b)}>
          <Text>{b.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
