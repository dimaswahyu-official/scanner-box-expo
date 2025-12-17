import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Batch } from "@/types";

export const exportBatchToCSV = async (batch: Batch) => {
  if (!batch || !batch.scans) return;

  if (!FileSystem) {
    alert("Document directory tidak tersedia");
    return;
  }

  const safeName =
    batch.name?.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "batch";

  const fileUri =
    FileSystem.documentDirectory + `${safeName}_${Date.now()}.csv`;

  let csv = `"Barcode","Scanned At"\n`;

  batch.scans.forEach((s) => {
    const code = `"${String(s.code).replace(/"/g, '""')}"`;
    const date = new Date(s.scannedAt).toLocaleString("id-ID");
    csv += `${code},"${date}"\n`;
  });

  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (!(await Sharing.isAvailableAsync())) {
    alert("Sharing tidak tersedia di device ini");
    return;
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "text/csv",
    dialogTitle: "Export CSV",
  });
};
