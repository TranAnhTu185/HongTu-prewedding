function doPost(e) {
  const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  const name = String(payload.name || "").trim().slice(0, 120);
  const attending = payload.attending === "yes" ? "Có" : "Không";
  const guests = payload.attending === "yes" ? Math.max(1, Math.min(20, Number(payload.guests) || 1)) : 0;
  const message = String(payload.message || "").trim().slice(0, 1000);

  if (!name) {
    return jsonResponse({ ok: false, error: "missing_name" });
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("Bind this Apps Script project to the RSVP spreadsheet.");
  }

  const sheet = spreadsheet.getSheetByName("RSVP") || spreadsheet.insertSheet("RSVP");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Thời gian nhận", "Họ tên", "Tham dự", "Số khách", "Lời chúc"]);
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    name,
    attending,
    guests,
    message,
  ]);

  return jsonResponse({ ok: true });
}

function doGet() {
  return jsonResponse({ ok: true, service: "wedding-rsvp" });
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
