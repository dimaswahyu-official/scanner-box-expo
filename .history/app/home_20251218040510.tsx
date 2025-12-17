import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { router } from "expo-router";


export default function HomeScreen() {
    const submit = () => {

  return (
    <View style={{ padding: 16 }}>
      <Text>Tambah User</Text>
      <Button title="Pindai Barcode" onPress={submit} />
    </View>
  );
}
