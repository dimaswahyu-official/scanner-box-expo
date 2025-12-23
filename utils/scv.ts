import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Batch, User } from "@/types";
import { getData } from "./storage";

export const exportBatchToCSV = async (batch: Batch) => {
  if (!batch?.scans?.length) {
    alert("Tidak ada data untuk di-export");
    return;
  }

  if (!FileSystem.documentDirectory) {
    alert("File system tidak tersedia");
    return;
  }

  // 🔹 Ambil user
  const users: User[] = await getData("users");
  const user = users.find((u) => u.id === batch.userId);

  // 🔹 Sanitizer untuk nama file
  const safe = (val?: string) =>
    val?.replace(/[^a-z0-9]/gi, "_") || "unknown";

  // Ambil tanggal dari batch.createdAt, format DDMMYYYY
  const d = new Date(batch.createdAt);
  const batchName =
    `${String(d.getDate()).padStart(2, "0")}` +
    `${String(d.getMonth() + 1).padStart(2, "0")}` +
    `${d.getFullYear()}`;
  const userName = safe(user?.name);
  const noSJ = safe(batch.userRequestFrom);

  // ✅ NAMA FILE SESUAI REQUEST
  const fileName = `Scanner-${batchName}-${userName}-${noSJ}.csv`;
  const fileUri = FileSystem.documentDirectory + fileName;

  // ✅ HEADER CSV
  let csv =
    `No SJ;Trx Type;Grade;Dest;Date;Barcode;Gross;Tare;Netto;PT;Kode PT\n`;

  batch.scans.forEach((s) => {
    const d = new Date(s.scannedAt);
    const formattedDate =
      `${String(d.getDate()).padStart(2, "0")}/` +
      `${String(d.getMonth() + 1).padStart(2, "0")}/` +
      `${d.getFullYear()} ` +
      `${String(d.getHours()).padStart(2, "0")}:` +
      `${String(d.getMinutes()).padStart(2, "0")}:` +
      `${String(d.getSeconds()).padStart(2, "0")}`;

    const barcode = String(s.code).replace(/"/g, '""');

    // ✅ No SJ MASUK KE KOLOM PERTAMA
    csv +=
      `${batch.userRequestFrom || ""};;;;` +
      `${formattedDate};` +
      `${barcode};;;;;\n`;
  });

  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Simpan / Bagikan CSV",
    });
  } else {
    alert("File berhasil dibuat di penyimpanan aplikasi");
  }
};
