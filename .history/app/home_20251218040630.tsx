import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { router } from "expo-router";


export default function HomeScreen() {
    const submit = () => {
        router.push("/user");
    }

  return (
    <View style={{ padding: 16, alignItems: "center", justifyContent: "center", flex: 1 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>PINDAI BARCODE</Text>
      <Button title="Pindai Barcode" onPress={submit} />
    </View>style
  );
}
