import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: "Pindai Barcode" }} />
      <Stack.Screen name="user" options={{ title: "User" }} />
      <Stack.Screen name="batch" options={{ title: "Batch" }} />
      <Stack.Screen name="scanner" options={{ title: "Scanner" }} />
    </Stack>
  );
}
