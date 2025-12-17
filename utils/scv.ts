import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Batch } from "@/types";

export const exportBatchToCSV = async (batch: Batch) => {
  if (!batch || !batch.scans) return;

  if (!FileSystem.documentDirectory) {
    alert("Document directory tidak tersedia");
    return;
  }

  // 📅 tanggal hari ini untuk nama file
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const fileName = `scanner-${yyyy}-${mm}-${dd}.csv`;
  const fileUri = FileSystem.documentDirectory + fileName;

  // 🧾 Header CSV sesuai template
  let csv =
    `"No SJ","Trx Type","Grade","Dest","Date","Barcode","Gross","Tare","Netto","PT","Kode PT"\n`;

  batch.scans.forEach((s, index) => {
    const dateObj = new Date(s.scannedAt);
    const formattedDate =
      `${String(dateObj.getDate()).padStart(2, "0")}/` +
      `${String(dateObj.getMonth() + 1).padStart(2, "0")}/` +
      `${dateObj.getFullYear()} ` +
      `${String(dateObj.getHours()).padStart(2, "0")}:` +
      `${String(dateObj.getMinutes()).padStart(2, "0")}:` +
      `${String(dateObj.getSeconds()).padStart(2, "0")}`;

    const barcode = `"${String(s.code).replace(/"/g, '""')}"`;

    csv +=
      `"${index + 1}",` +      // No SJ
      `"",` +                  // Trx Type
      `"",` +                  // Grade
      `"",` +                  // Dest
      `"${formattedDate}",` +  // Date
      `${barcode},` +          // Barcode
      `"",` +                  // Gross
      `"",` +                  // Tare
      `"",` +                  // Netto
      `"",` +                  // PT
      `""\n`;                   // Kode PT
  });

  // ✍️ Tulis file
  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // 📤 Share
  if (!(await Sharing.isAvailableAsync())) {
    alert("Sharing tidak tersedia di device ini");
    return;
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "text/csv",
    dialogTitle: "Export Scanner CSV",
  });
};
