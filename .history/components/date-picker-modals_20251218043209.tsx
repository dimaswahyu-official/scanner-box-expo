import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
  visible: boolean;
}

export default function DatePickerModal({
  value,
  onChange,
  visible,
  onClose,
}: Props) {
  const [day, setDay] = useState(value.getDate());
  const [month, setMonth] = useState(value.getMonth() + 1);
  const [year, setYear] = useState(value.getFullYear());

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 20 }, (_, i) => 2020 + i);

  const confirm = () => {
    onChange(new Date(year, month - 1, day));
    onClose();
  };

  const Item = ({ v:any, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.item, selected && styles.selected]}
      onPress={onPress}
    >
      <Text style={selected && { color: "#fff" }}>{v}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Pilih Tanggal</Text>

          <View style={styles.row}>
            <ScrollView>
              {days.map((d) => (
                <Item
                  key={d}
                  v={d}
                  selected={d === day}
                  onPress={() => setDay(d)}
                />
              ))}
            </ScrollView>

            <ScrollView>
              {months.map((m) => (
                <Item
                  key={m}
                  v={m}
                  selected={m === month}
                  onPress={() => setMonth(m)}
                />
              ))}
            </ScrollView>

            <ScrollView>
              {years.map((y) => (
                <Item
                  key={y}
                  v={y}
                  selected={y === year}
                  onPress={() => setYear(y)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirm}>
              <Text style={styles.confirm}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 14,
    padding: 16,
    maxHeight: "70%",
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    height: 220,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#2563EB",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 16,
  },
  cancel: {
    color: "#6B7280",
  },
  confirm: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
