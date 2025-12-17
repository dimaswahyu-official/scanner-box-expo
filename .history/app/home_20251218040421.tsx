import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { router } from "expo-router";


export default function HomeScreen() {

  return (
    <View style={{ padding: 16 }}>
      <Text>Tambah User</Text>

      <TextInput
        placeholder="Nama"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Telepon"
        value={phone}
        onChangeText={setPhone}
      />

      <Button title="Add User" onPress={addUser} />

      <Text style={{ marginTop: 20 }}>Pilih User</Text>

      {users.map((u) => (
        <TouchableOpacity key={u.id} onPress={() => selectUser(u)}>
          <Text>{u.name} - {u.phone}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
