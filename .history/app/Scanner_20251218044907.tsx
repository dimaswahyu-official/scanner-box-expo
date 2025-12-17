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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  batchName: {
    fontSize: 18,
    fontWeight: "600",
  },
  batchInfo: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  cameraWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  camera: {
    height: 280,
  },

  primaryBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  section: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  empty: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginVertical: 12,
  },

  scanItem: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  code: {
    fontSize: 14,
    fontWeight: "500",
  },
  time: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  overlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},
modal: {
  backgroundColor: "#FFF",
  padding: 20,
  borderRadius: 14,
  width: "80%",
},
modalTitle: {
  fontSize: 16,
  fontWeight: "600",
  marginBottom: 8,
},
modalText: {
  fontSize: 14,
  color: "#374151",
  marginBottom: 12,
},
modalActions: {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: 16,
},
cancel: {
  color: "#6B7280",
},
});
