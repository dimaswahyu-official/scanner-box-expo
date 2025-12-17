import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Batch } from "@/types";

export const exportBatchToCSV = async (batch: Batch) => {
  if (!batch || !batch.scans) return;

  // 🔒 sanitize filename
  const safeName =
    batch.name?.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "batch";

  const fileName = `${safeName}_${Date.now()}.csv`;
  const fileUri = FileSystem.cacheDirectory + fileName;

  // 📄 header
  let csv = `"Barcode","Scanned At"\n`;

  batch.scans.forEach((s) => {
    const code = `"${String(s.code).replace(/"/g, '""')}"`;
    const date = new Date(s.scannedAt).toLocaleString("id-ID");
    csv += `${code},"${date}"\n`;
  });

  // 📝 write file
  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // 📤 share
  if (!(await Sharing.isAvailableAsync())) {
    alert("Fitur share tidak tersedia di device ini");
    return;
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "text/csv",
    dialogTitle: "Export CSV",
  });
};
