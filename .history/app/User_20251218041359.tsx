import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";

import { User } from "../types";
import { getData, saveData } from "@/utils/storage";
import { useSessionStore } from "../store/useSessionStore";

export default function UserScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requestFrom, setRequestFrom] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
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

    let updated: User[];

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

  const editUser = (user: any) => {
    setEditingId(user.id);
    setName(user.name);
    setPhone(user.phone);
    setRequestFrom(user.requestFrom || "");
    setDate(user.date ? new Date(user.date) : new Date());
  };

  const deleteUser = async (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    await saveData("users", updated);
  };

  const selectUser = (user: User) => {
    setUser(user);
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
          placeholder="Masukkan nama"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Telepon</Text>
        <TextInput
          style={styles.input}
          placeholder="08xxxxxxxxxx"
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
          onPress={() => setShowPicker(true)}
        >
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selected) => {
              setShowPicker(false);
              if (selected) setDate(selected);
            }}
          />
        )}

        <TouchableOpacity style={styles.primaryBtn} onPress={saveUser}>
          <Text style={styles.primaryText}>
            {editingId ? "Update User" : "Simpan User"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST USER */}
      <Text style={styles.sectionTitle}>Pilih User</Text>

      {users.map((u: any) => (
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
    </View>
  );
}

