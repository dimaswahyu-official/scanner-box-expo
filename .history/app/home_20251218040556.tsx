import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { router } from "expo-router";


export default function HomeScreen() {
    const submit = () => {
        router.push("/user");
    }

  return (
    <View style={{ padding: 16 }}>
        <h1>PINDAI BARCODE</h1>
      <Button title="Pindai Barcode" onPress={submit} />
    </View>
  );
}
