import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { router } from "expo-router";

import { Batch } from "@/types";
import { getData, saveData } from "../utils/storage";
import { exportBatchToCSV } from "../utils/scv";
import { useSessionStore } from "@/store/useSessionStore";

export default function ScannerScreen() {
  const batch = useSessionStore((state) => state.batch);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scans, setScans] = useState(batch?.scans ?? []);
  const [scanned, setScanned] = useState(false);

  // 🔒 PROTECT: jika batch kosong
  useEffect(() => {
    if (!batch) {
      router.replace("/batch");
      return;
    }
  }, [batch]);

  // Camera permission
  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then(({ status }) => {
      setHasPermission(status === "granted");
    });
  }, []);

  const handleScan = async ({ data }: { data: string }) => {
    if (!batch) return;
    if (scanned) return;
    setScanned(true);

    // anti duplicate
    if (scans.some((s) => s.code === data)) {
      setTimeout(() => setScanned(false), 800);
      return;
    }

    const updatedScans = [
      ...scans,
      { code: data, scannedAt: new Date().toISOString() },
    ];

    const allBatches = await getData("batches");
    const updatedBatches = allBatches.map((b:any) =>
      b.id === batch.id ? { ...b, scans: updatedScans } : b
    );

    setScans(updatedScans);
    await saveData("batches", updatedBatches);

    setTimeout(() => setScanned(false), 800);
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No camera permission</Text>;
  }

  if (!batch) return null;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Batch: {batch.name}</Text>
      <Text>Total Scan: {scans.length}</Text>

      <BarCodeScanner
        style={{ height: 300 }}
        onBarCodeScanned={handleScan}
      />

      {scans.map((s) => (
        <Text key={s.code}>{s.code}</Text>
      ))}

      <Button
        title="Export CSV"
        onPress={() => exportBatchToCSV({ ...batch, scans })}
      />
    </View>
  );
}
