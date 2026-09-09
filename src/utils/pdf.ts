import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { Member, MonthlyExpense, MonthlyMember } from "../models/types";

// ==========================================
// GENERATE PDF
// ==========================================

export async function generateInvoice(
  month: MonthlyExpense,
  member: Member,
  data: MonthlyMember,
): Promise<string> {
  const rows = month.categories
    .map(
      (category) => `
        <tr>
          <td class="cell">
            ${escapeHtml(category)}
          </td>

          <td class="cell amount">
            ${data.amounts[category] ?? 0}
          </td>
        </tr>
      `,
    )
    .join("");

  const finalBalance =
    data.back < 0
      ? `Due: ${Math.abs(data.back)}`
      : data.back > 0
        ? `Advance: ${data.back}`
        : "Cleared";

  const html = `
    <!DOCTYPE html>

    <html>

      <head>

        <meta charset="UTF-8" />

        <style>

          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            color: #1e293b;
          }

          h1 {
            margin-bottom: 4px;
            font-size: 26px;
          }

          h2 {
            color: #64748b;
            margin-top: 0;
            font-size: 18px;
          }

          .info {
            margin-top: 20px;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 10px;
            text-align: left;
          }

          .cell {
            border: 1px solid #cbd5e1;
            padding: 10px;
          }

          .amount {
            text-align: right;
          }

          .summary {
            margin-top: 25px;
          }

          .balance {
            margin-top: 25px;
            padding: 15px;
            background-color: #f1f5f9;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
          }

          .footer {
            margin-top: 35px;
            color: #64748b;
            font-size: 12px;
          }

        </style>

      </head>

      <body>

        <h1>
          ${escapeHtml(month.flatName)}
        </h1>

        <h2>
          Flat Expense Invoice
        </h2>

        <div class="info">

          <p>
            <strong>Month:</strong>
            ${escapeHtml(month.month)}
          </p>

          <p>
            <strong>Member:</strong>
            ${escapeHtml(member.name)}
          </p>

          ${
            member.phone
              ? `
                <p>
                  <strong>Phone:</strong>
                  ${escapeHtml(member.phone)}
                </p>
              `
              : ""
          }

        </div>

        <table>

          <tr>
            <th>
              Category
            </th>

            <th style="text-align:right;">
              Amount
            </th>
          </tr>

          ${rows}

        </table>

        <div class="summary">

          <p>
            <strong>Total:</strong>
            ${data.total}
          </p>

          <p>
            <strong>
              Previous Due / Advance:
            </strong>
            ${data.dueFromPrevMonth}
          </p>

          <p>
            <strong>
              Grand Total Owed:
            </strong>
            ${data.grandTotalOwed}
          </p>

          <p>
            <strong>
              Given:
            </strong>
            ${data.given}
          </p>

        </div>

        <div class="balance">
          Final Balance: ${escapeHtml(finalBalance)}
        </div>

        <div class="footer">
          Generated: ${escapeHtml(new Date().toLocaleString())}
        </div>

      </body>

    </html>
  `;

  // ==========================================
  // CREATE PDF
  // ==========================================

  const result = await Print.printToFileAsync({
    html,
  });

  // ==========================================
  // CREATE READABLE APP FILE
  // ==========================================

  const pdfDirectory =
    FileSystem.documentDirectory + "FlatExpenseData/invoices/";

  const directoryInfo = await FileSystem.getInfoAsync(pdfDirectory);

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(pdfDirectory, {
      intermediates: true,
    });
  }

  // ==========================================
  // SAFE FILE NAME
  // ==========================================

  const safeName = member.name.replace(/[^\p{L}\p{N}_-]/gu, "_");

  const safeMonth = month.month.replace(/[^\p{L}\p{N}_-]/gu, "_");

  const filename = `${safeName}_${safeMonth}.pdf`;

  const destination = pdfDirectory + filename;

  // ==========================================
  // DELETE OLD PDF
  // ==========================================

  const oldFile = await FileSystem.getInfoAsync(destination);

  if (oldFile.exists) {
    await FileSystem.deleteAsync(destination, {
      idempotent: true,
    });
  }

  // ==========================================
  // COPY PDF
  // ==========================================
  //
  // IMPORTANT:
  // expo-print result.uri is a temporary cache file.
  // We copy it using the legacy FileSystem API,
  // which works with the URI returned by expo-print.
  //

  await FileSystem.copyAsync({
    from: result.uri,
    to: destination,
  });

  return destination;
}

// ==========================================
// SHARE PDF
// ==========================================

export async function shareInvoice(uri: string) {
  const available = await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error("Sharing is not available on this device.");
  }

  // Make sure the file actually exists
  const fileInfo = await FileSystem.getInfoAsync(uri);

  if (!fileInfo.exists) {
    throw new Error("Generated PDF file could not be found.");
  }

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: "Share Expense Invoice",
    UTI: "com.adobe.pdf",
  });
}

// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
