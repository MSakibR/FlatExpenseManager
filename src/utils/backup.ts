import { Directory, File, Paths } from "expo-file-system";

import * as Sharing from "expo-sharing";

import { getMembers, getSettings, getAllMonths } from "./storage";

export async function exportBackup() {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),

    members: getMembers(),

    settings: getSettings(),

    months: getAllMonths(),
  };

  const backupDir = new Directory(Paths.document, "FlatExpenseData", "backups");

  if (!backupDir.exists) {
    backupDir.create();
  }

  const filename = `FlatExpenseBackup_${Date.now()}.json`;

  const file = new File(backupDir, filename);

  file.create();

  file.write(JSON.stringify(backup, null, 2));

  const available = await Sharing.isAvailableAsync();

  if (available) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Export Flat Expense Backup",
    });
  }

  return file.uri;
}
