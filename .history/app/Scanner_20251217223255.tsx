import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";

import { Batch } from "@/types";
import { getData, saveData } from "@/utils/storage";
import { exportBatchToCSV } from "@/utils/scv";
import { useSessionStore } from "@/store/useSessionStore";

export default function ScannerScreen() {
  const batch = useSessionStore((state) => state.batch);

  const [permission, requestPermission] = useCameraPermissions();
  const [scans, setScans] = useState(batch?.scans ?? []);
  const [scanned, setScanned] = useState(false);

  // 🔒 protect route
  useEffect(() => {
    if (!batch) {
      router.replace("/batch");
    }
  }, [batch]);

  const handleScan = async ({ data }: { data: string }) => {
    if (!batch || scanned) return;
    setScanned(true);

    if (scans.some((s) => s.code === data)) {
      setTimeout(() => setScanned(false), 800);
      return;
    }

    const updatedScans = [
      ...scans,
      { code: data, scannedAt: new Date().toISOString() },
    ];

    const allBatches = await getData("batches");
    const updatedBatches = allBatches.map((b: Batch) =>
      b.id === batch.id ? { ...b, scans: updatedScans } : b
    );

    setScans(updatedScans);
    await saveData("batches", updatedBatches);

    setTimeout(() => setScanned(false), 800);
  };

  if (!permission) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (!permission.granted) {
    return (
      <View>
        <Text>No camera permission</Text>
        <Button title="Grant permission" onPress={requestPermission} />
      </View>
    );
  }

  if (!batch) return null;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Batch: {batch.name}</Text>
      <Text>Total Scan: {scans.length}</Text>

      <CameraView
        style={{ height: 300 }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "code128", "ean13"],
        }}
        onBarcodeScanned={scanned ? undefined : handleScan}
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
