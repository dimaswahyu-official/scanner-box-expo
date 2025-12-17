import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Batch } from "../types";
import { getData, saveData } from "../utils/storage";
import { exportBatchToCSV } from "../utils/scv";

export default function ScannerScreen({ batch }: any) {
  const [hasPermission, setHasPermission] = useState(false);
  const [scans, setScans] = useState(batch.scans);

  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then(({ status }) =>
      setHasPermission(status === "granted")
    );
  }, []);

  const handleScan = async ({ data }: any) => {
    if (scans.some((s: any) => s.code === data)) return;

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
  };

  if (!hasPermission) return <Text>No Camera Permission</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Text>Total Scan: {scans.length}</Text>

      <BarCodeScanner
        style={{ height: 300 }}
        onBarCodeScanned={handleScan}
      />

      {scans.map((s: any) => (
        <Text key={s.code}>{s.code}</Text>
      ))}

      <Button title="Export CSV" onPress={() => exportBatchToCSV({ ...batch, scans })} />
    </View>
  );
}
