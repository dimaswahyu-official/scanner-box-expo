import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useSessionStore } from "../store/useSessionStore";
import { Batch } from "../types";
import { getData, saveData } from "../utils/storage";

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

   getData("batches").then((data) => {
      setBatches(data.filter((b: Batch) => b.userId === user.id));
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

    const allBatches = await getData("batches");
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
