import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { router } from "expo-router";

import { User } from "../types";
import { getData, saveData } from "@/utils/storage";
import { useSessionStore } from "../store/useSessionStore";

export default function UserScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requestFrom, setRequestFrom] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const setUser = useSessionStore((state) => state.setUser);

  useEffect(() => {
    getData("users").then(setUsers);
  }, []);

  const resetForm = () => {
    setName("");
    setPhone("");
    setRequestFrom("");
    setEditingId(null);
  };

  const saveUser = async () => {
    if (!name || !phone) return;

    let updated;

    if (editingId) {
      updated = users.map((u) =>
        u.id === editingId
          ? { ...u, name, phone, requestFrom, date: date.toISOString() }
          : u
      );
    } else {
      updated = [
        ...users,
        {
          id: Date.now().toString(),
          name,
          phone,
          requestFrom,
          date: date.toISOString(),
        },
      ];
    }

    setUsers(updated);
    await saveData("users", updated);
    resetForm();
  };

  const editUser = (u: any) => {
    setEditingId(u.id);
    setName(u.name);
    setPhone(u.phone);
    setRequestFrom(u.requestFrom || "");
    setDate(u.date ? new Date(u.date) : new Date());
  };

  const deleteUser = async (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    await saveData("users", updated);
  };

  const selectUser = (u: User) => {
    setUser(u);
    router.push("/batch");
  };

  return (
    <View style={styles.container}>
      {/* FORM */}
      <View style={styles.card}>
        <Text style={styles.title}>Tambah User</Text>

        <Text style={styles.label}>Nama</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama user"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Telepon</Text>
        <TextInput
          style={styles.input}
          placeholder="08xxxxxxxx"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
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

        <TouchableOpacity style={styles.primaryBtn} onPress={saveUser}>
          <Text style={styles.primaryText}>
            {editingId ? "Update User" : "Simpan User"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <Text style={styles.section}>Pilih User</Text>

      {users.map((u) => (
        <View key={u.id} style={styles.userCard}>
          <TouchableOpacity onPress={() => selectUser(u)}>
            <Text style={styles.userName}>{u.name}</Text>
            <Text style={styles.userPhone}>{u.phone}</Text>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => editUser(u)}>
              <Text style={styles.edit}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteUser(u.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* DATE MODAL */}
      <Modal visible={showDate} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Pilih Tanggal</Text>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setDate(new Date());
                setShowDate(false);
              }}
            >
              <Text>Hari Ini</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                setDate(d);
                setShowDate(false);
              }}
            >
              <Text>Besok</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowDate(false)}>
              <Text style={{ color: "#DC2626", marginTop: 12 }}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

