import { Batch } from "@/types";
import { getData, saveData } from "@/utils/storage";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";


export default function BatchScreen({ user, onSelect }: any) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    getData("batches").then((data) =>
      setBatches(data.filter((b: Batch) => b.userId === user.id))
    );
  }, []);

  const addBatch = async () => {
    const newBatch = {
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

  return (
    <View style={{ padding: 16 }}>
      <Text>User: {user.name}</Text>

      <TextInput placeholder="Nama Batch" value={name} onChangeText={setName} />
      <Button title="Add Batch" onPress={addBatch} />

      {batches.map((b) => (
        <TouchableOpacity key={b.id} onPress={() => onSelect(b)}>
          <Text>{b.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
