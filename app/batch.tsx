import { router, Stack, useRootNavigationState } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";

import { useSessionStore } from "../store/useSessionStore";
import { Batch } from "../types";
import { getData, saveData } from "../utils/storage";
import DatePickerModal from "./components/date-picker-modals";

export default function BatchScreen() {
  const user = useSessionStore((state) => state.user);
  const setBatch = useSessionStore((state) => state.setBatch);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [name, setName] = useState("");
  const [requestFrom, setRequestFrom] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const rootNavigationState = useRootNavigationState();
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");


  // 🔒 PROTECT + LOAD
  useEffect(() => {
    if (!rootNavigationState?.key) return; // ⛔ tunggu router siap

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
  }, [rootNavigationState?.key, user]);


  const resetForm = () => {
    setName("");
    setRequestFrom("");
    setDate(new Date());
    setEditingId(null);
  };

  const saveBatch = async () => {
    if (!user || !name || !requestFrom) {
      Alert.alert("Validasi", "Nama batch dan permintaan dari wajib diisi");
      return;
    }

    const all: Batch[] = await getData("batches");
    let updated: Batch[];
    const isEdit = !!editingId;

    if (editingId) {
      // ✏️ UPDATE
      updated = all.map((b) =>
        b.id === editingId
          ? {
            ...b,
            name,
            userRequestFrom: requestFrom,
            createdAt: date.toISOString(),
          }
          : b
      );
    } else {
      // ➕ ADD
      updated = [
        ...all,
        {
          id: Date.now().toString(),
          name,
          userId: user.id,
          userRequestFrom: requestFrom,
          createdAt: date.toISOString(),
          scans: [],
        },
      ];
    }

    await saveData("batches", updated);
    setBatches(updated.filter((b) => b.userId === user.id));
    resetForm();

    // ✅ SUCCESS DIALOG
    setSuccessMessage(
      isEdit
        ? "Batch berhasil diperbarui"
        : "Batch berhasil ditambahkan"
    );
    setSuccessVisible(true);
  };



  const editBatch = (batch: Batch) => {
    setEditingId(batch.id);
    setName(batch.name);
    setRequestFrom(batch.userRequestFrom);
    setDate(new Date(batch.createdAt));
  };


  const deleteBatch = async (id: string) => {

    Alert.alert(
      "Hapus User",
      "Apakah kamu yakin ingin menghapus user ini?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            const all = await getData("batches");
            const updated = all.filter((b: Batch) => b.id !== id);

            await saveData("batches", updated);
            setBatches(updated.filter((b: any) => b.userId === user?.id));
          },
        },
      ],
      { cancelable: true }
    );


  };

  const selectBatch = (batch: Batch) => {
    setBatch(batch);
    router.push("/scanner");
  };


  if (!user) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: `BATCH | ${(user?.name ?? "").toUpperCase()}`
        }}
      />
      <View style={styles.container}>

        {/* FORM */}
        <View style={styles.card}>
          <Text style={styles.title}>
            {editingId ? "Edit Batch" : "Tambah Batch"}
          </Text>

          <Text style={styles.label}>Nama Batch</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Batch Pagi"
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.label}>Permintaan Dari</Text>
          <TextInput
            style={styles.input}
            placeholder="Gudang / Customer / Internal"
            value={requestFrom}
            onChangeText={setRequestFrom}
          />

          <Text style={styles.label}>Tanggal</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDate(true)}
          >
            <Text>{date.toLocaleDateString("id-ID")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={saveBatch}>
            <Text style={styles.primaryText}>
              {editingId ? "Update Batch" : "Simpan Batch"}
            </Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.cancel}>Batal Edit</Text>
            </TouchableOpacity>
          )}

          {/* DATE MODAL */}
          <DatePickerModal
            visible={showDate}
            value={date}
            onChange={setDate}
            onClose={() => setShowDate(false)}
          />
        </View>

        {/* LIST */}
        <Text style={styles.section}>Daftar Batch</Text>

        {batches.length === 0 && (
          <Text style={styles.empty}>Belum ada batch</Text>
        )}

        {batches.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={styles.batchCard}
            activeOpacity={0.8}
            onPress={() => selectBatch(b)}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* CONTENT */}
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text
                  style={styles.batchName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {b.name}
                </Text>

                <Text style={styles.batchDate}>
                  {b.userRequestFrom} •{" "}
                  {new Date(b.createdAt).toLocaleDateString("id-ID")}
                </Text>
              </View>

              {/* ACTIONS */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={() => editBatch(b)}
                  hitSlop={10}
                >
                  <Text style={styles.edit}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteBatch(b.id)}
                  hitSlop={10}
                >
                  <Text style={styles.delete}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <Modal
          transparent
          animationType="fade"
          visible={successVisible}
          onRequestClose={() => setSuccessVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Berhasil 🎉</Text>
              <Text style={{ marginBottom: 16 }}>{successMessage}</Text>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setSuccessVisible(false)}
              >
                <Text style={styles.primaryText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  headerLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  headerDate: {
    marginTop: 6,
    fontSize: 13,
    color: "#374151",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cancel: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
  },

  section: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  empty: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 12,
  },

  batchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  batchName: {
    fontSize: 15,
    fontWeight: "500",
  },
  batchDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  actionRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  edit: {
    color: "#2563EB",
    fontWeight: "500",
  },
  delete: {
    color: "#DC2626",
    fontWeight: "500",
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
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
});
