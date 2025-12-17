import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Batch } from "@/types";

export const exportBatchToCSV = async (batch: Batch) => {
  let csv = "Barcode,Scanned At\n";

  batch.scans.forEach((s) => {
    csv += `${s.code},${s.scannedAt}\n`;
  });

//   const dir = FileSystem.cacheDirectory;
//   if (!dir) {
//     throw new Error("Cache directory not available");
//   }

//   const fileUri = `${dir}${batch.name}.csv`;

//   await FileSystem.writeAsStringAsync(fileUri, csv, {
//     encoding: FileSystem.EncodingType.UTF8,
//   });

  if (!(await Sharing.isAvailableAsync())) {
    alert("Sharing is not available on this device");
    return;
  }

//   await Sharing.shareAsync(fileUri);
};
