const RSVP_SPREADSHEET_ID = "1SU899USPNtryqo89lqTXyF8SceGdHnulOsxD-TdLjno";

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (error) {
    return jsonResponse({ ok: false, error: "invalid_json" });
  }

  const name = String(payload.name || "").trim().slice(0, 120);
  const attending = payload.attending === "yes" ? "Có" : "Không";
  const guests = payload.attending === "yes" ? Math.max(1, Math.min(20, Number(payload.guests) || 1)) : 0;
  const message = String(payload.message || "").trim().slice(0, 1000);

  if (!name) {
    return jsonResponse({ ok: false, error: "missing_name" });
  }

  const spreadsheet = SpreadsheetApp.openById(RSVP_SPREADSHEET_ID);

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
