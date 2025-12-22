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

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const safeRequestFrom = batch.userRequestFrom?.replace(/[^a-z0-9]/gi, "_") || "unknown";
  const users: User[] = await getData("users");
  const user = users.find((u) => u.id === batch.userId);

  const userName =
    user?.name?.replace(/[^a-z0-9]/gi, "_") || "unknown_user";
  const batchName = batch.name?.replace(/[^a-z0-9]/gi, "_") || "unknown";
  const barcodeCount = batch.scans?.length || 0;
  const batchDate = batch.createdAt
    ? (() => {
      const d = new Date(batch.createdAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    })()
    : `${yyyy}-${mm}-${dd}`;
  const fileName = `Scanner-${userName}-${batchName}-${barcodeCount}-${batchDate}.csv`;
  const fileUri = FileSystem.documentDirectory + fileName;

  let csv =
    `"No SJ";"Trx Type";"Grade";"Dest";"Date";"Barcode";"Gross";"Tare";"Netto";"PT";"Kode PT"\n`;

  batch.scans.forEach((s) => {
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
      `"";"";"";"";` +
      `"${formattedDate}";` +
      `${barcode};"";"";"";"";""\n`;
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
