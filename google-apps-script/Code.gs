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

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === "wishes") {
    const result = getWishes();
    // JSONP giúp trang thiệp đọc dữ liệu công khai từ Apps Script mà không vướng CORS.
    const callback = String(params.callback || "");
    if (/^[A-Za-z_$][\w$]*$/.test(callback)) {
      return ContentService
        .createTextOutput(`${callback}(${JSON.stringify(result)});`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return jsonResponse(result);
  }
  return jsonResponse({ ok: true, service: "wedding-rsvp" });
}

function getWishes() {
  const spreadsheet = SpreadsheetApp.openById(RSVP_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName("RSVP");
  if (!sheet || sheet.getLastRow() < 2) return { ok: true, wishes: [] };

  const values = sheet.getDataRange().getValues();
  const headers = values[0].map((value) => String(value).trim().toLowerCase());
  const nameIndex = headers.findIndex((header) => ["họ tên", "họ và tên", "họ và tên khách mời"].includes(header));
  const messageIndex = headers.findIndex((header) => ["lời chúc", "lời nhắn", "lời chúc mừng"].includes(header));
  if (nameIndex < 0 || messageIndex < 0) return { ok: true, wishes: [] };

  const wishes = values.slice(1)
    .map((row, index) => ({
      id: `${index + 2}-${row[0] instanceof Date ? row[0].getTime() : String(row[0])}`,
      name: String(row[nameIndex] || "").trim().slice(0, 120),
      message: String(row[messageIndex] || "").trim().slice(0, 1000),
    }))
    .filter((wish) => wish.name && wish.message);

  return { ok: true, wishes };
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
