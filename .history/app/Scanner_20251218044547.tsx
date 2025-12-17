import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
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
  const [cameraOn, setCameraOn] = useState(false);
  const [scanned, setScanned] = useState(false);

  // 🔒 Protect route
  useEffect(() => {
    if (!batch) router.replace("/batch");
  }, [batch]);

  const handleScan = async ({ data }: { data: string }) => {
    if (!batch || scanned) return;

    setScanned(true);
    setCameraOn(false); // 🔥 auto off setelah scan

    if (scans.some((s) => s.code === data)) {
      setScanned(false);
      return;
    }

    const newScan = {
      code: data,
      scannedAt: new Date().toISOString(),
    };

    const updatedScans = [...scans, newScan];

    // 🔥 simpan ke batch
    const allBatches = await getData("batches");
    const updatedBatches = allBatches.map((b: Batch) =>
      b.id === batch.id ? { ...b, scans: updatedScans } : b
    );

    await saveData("batches", updatedBatches);
    setScans(updatedScans);

    setTimeout(() => setScanned(false), 600);
  };

  if (!permission) {
    return <Text style={styles.center}>Requesting camera permission…</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Kamera belum diizinkan</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!batch) return null;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerCard}>
        <Text style={styles.batchName}>{batch.name}</Text>
        <Text style={styles.batchInfo}>
          Total Scan: {scans.length}
        </Text>
      </View>

      {/* CAMERA */}
      {cameraOn && (
        <View style={styles.cameraWrapper}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "code128", "ean13"],
            }}
            onBarcodeScanned={scanned ? undefined : handleScan}
          />
        </View>
      )}

      {/* ACTION */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => setCameraOn((v) => !v)}
      >
        <Text style={styles.primaryText}>
          {cameraOn ? "Tutup Kamera" : "Mulai Scan"}
        </Text>
      </TouchableOpacity>

      {/* LIST SCAN */}
      <Text style={styles.section}>Hasil Scan</Text>

      <FlatList
        data={scans}
        keyExtractor={(item) => item.code}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada scan</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.scanItem}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.time}>
              {new Date(item.scannedAt).toLocaleTimeString("id-ID")}
            </Text>
          </View>
        )}
      />

      {/* EXPORT */}
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => exportBatchToCSV({ ...batch, scans })}
      >
        <Text style={styles.secondaryText}>Export CSV</Text>
      </TouchableOpacity>
    </View>
  );
}
