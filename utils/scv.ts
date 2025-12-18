import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Batch } from "@/types";

export const exportBatchToCSV = async (batch: Batch) => {
  if (!batch || !batch.scans || batch.scans.length === 0) {
    alert("Tidak ada data untuk di-export");
    return;
  }

  if (!FileSystem.documentDirectory) {
    alert("File system tidak tersedia");
    return;
  }

  // 📅 tanggal hari ini (YYYY-MM-DD)
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  // 🧼 amankan nama file
  const safeRequestFrom =
    batch.userRequestFrom?.replace(/[^a-z0-9]/gi, "_") || "unknown";

  const fileName = `scanner-${safeRequestFrom}-${yyyy}-${mm}-${dd}.csv`;
  const fileUri = FileSystem.documentDirectory + fileName;

  // 🧾 HEADER SESUAI TEMPLATE
  let csv =
    `"No SJ","Trx Type","Grade","Dest","Date","Barcode","Gross","Tare","Netto","PT","Kode PT"\n`;

  batch.scans.forEach((s, index) => {
    const d = new Date(s.scannedAt);
    const formattedDate =
      `${String(d.getDate()).padStart(2, "0")}/` +
      `${String(d.getMonth() + 1).padStart(2, "0")}/` +
      `${d.getFullYear()} ` +
      `${String(d.getHours()).padStart(2, "0")}:` +
      `${String(d.getMinutes()).padStart(2, "0")}:` +
      `${String(d.getSeconds()).padStart(2, "0")}`;

    const barcode = `"${String(s.code).replace(/"/g, '""')}"`;

    csv +=
      `"";` +             // No SJ
      `"";` +             // Trx Type
      `"";` +             // Grade
      `"";` +             // Dest
      `"${formattedDate}";` +
      `${barcode};` +
      `"";` +             // Gross
      `"";` +             // Tare
      `"";` +             // Netto
      `"";` +             // PT
      `""\n`;              // Kode PT
  });

  // ✍️ TULIS FILE
  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // 📤 SHARE → USER PILIH "SAVE TO DOWNLOADS"
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Export Scanner CSV",
    });
  } else {
    alert("File berhasil dibuat");
  }
};
