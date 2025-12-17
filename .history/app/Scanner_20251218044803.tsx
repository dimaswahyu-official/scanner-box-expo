import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
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

  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [duplicateCode, setDuplicateCode] = useState<string | null>(null);

  // 🔒 Protect route
  useEffect(() => {
    if (!batch) router.replace("/batch");
  }, [batch]);

  const playSuccess = async () => {
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
  };

  const playError = async () => {
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Error
    );
  };

  const handleScan = async ({ data }: { data: string }) => {
    if (!batch || scanned) return;

    setScanned(true);
    setCameraOn(false);

    const exists = scans.some((s) => s.code === data);

    if (exists) {
      await playError();
      setDuplicateCode(data);

      setTimeout(() => {
        setScanned(false);
        setCameraOn(true);
      }, 1200);

      return;
    }

    await playSuccess();

    const newScan = {
      code: data,
      scannedAt: new Date().toISOString(),
    };

    const updatedScans = [...scans, newScan];

    const allBatches = await getData("batches");
    const updatedBatches = allBatches.map((b: Batch) =>
      b.id === batch.id ? { ...b, scans: updatedScans } : b
    );

    await saveData("batches", updatedBatches);
    setScans(updatedScans);

    // 🔁 auto scan ulang
    setTimeout(() => {
      setScanned(false);
      setCameraOn(true);
    }, 800);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !batch) return;

    const updatedScans = scans.filter(
      (s) => s.code !== deleteTarget.code
    );

    const allBatches = await getData("batches");
    const updatedBatches = allBatches.map((b: Batch) =>
      b.id === batch.id ? { ...b, scans: updatedScans } : b
    );

    await saveData("batches", updatedBatches);
    setScans(updatedScans);
    setDeleteTarget(null);
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

      {/* TRIGGER */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => setCameraOn((v) => !v)}
      >
        <Text style={styles.primaryText}>
          {cameraOn ? "Tutup Kamera" : "Mulai Scan"}
        </Text>
      </TouchableOpacity>

      {/* LIST */}
      <Text style={styles.section}>Hasil Scan</Text>

      <FlatList
        data={scans}
        keyExtractor={(item) => item.code}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada scan</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.scanItem}
            onLongPress={() => setDeleteTarget(item)}
          >
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.time}>
              {new Date(item.scannedAt).toLocaleTimeString("id-ID")}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* EXPORT */}
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => exportBatchToCSV({ ...batch, scans })}
      >
        <Text style={styles.secondaryText}>Export CSV</Text>
      </TouchableOpacity>

      {/* DELETE CONFIRM */}
      <Modal transparent visible={!!deleteTarget} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Hapus Scan?</Text>
            <Text style={styles.modalText}>{deleteTarget?.code}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setDeleteTarget(null)}>
                <Text style={styles.cancel}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete}>
                <Text style={styles.delete}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DUPLICATE DIALOG */}
      <Modal transparent visible={!!duplicateCode} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Duplikat</Text>
            <Text style={styles.modalText}>
              Kode sudah discan:
            </Text>
            <Text style={styles.code}>{duplicateCode}</Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setDuplicateCode(null)}
            >
              <Text style={styles.primaryText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

