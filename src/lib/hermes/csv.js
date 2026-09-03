const TRUE_CONSENT = new Set(["si", "sí", "yes", "true", "1", "opted_in"]);

function splitCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') { current += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(current.trim()); current = ""; }
    else current += char;
  }
  cells.push(current.trim());
  return cells;
}

export function normalizePreviewPhone(value) {
  const compact = String(value || "").trim().replace(/[\s\-()]/g, "");
  if (!/^\+?\d+$/.test(compact)) return null;
  let digits = compact.replace(/^\+/, "");
  if (/^09\d{8}$/.test(digits)) digits = `593${digits.slice(1)}`;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

export function parseCampaignCsv(text) {
  const lines = String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { rows: [], summary: { total: 0, valid: 0, invalid: 0, duplicates: 0, withoutConsent: 0, eligible: 0 } };
  const headers = splitCsvLine(lines[0]).map((header) => header.trim().toLocaleLowerCase("es"));
  const nameIndex = headers.indexOf("nombre");
  const phoneIndex = headers.indexOf("telefono");
  const consentIndex = headers.indexOf("consentimiento");
  if (nameIndex < 0 || phoneIndex < 0 || consentIndex < 0) throw new Error("El CSV debe incluir nombre, telefono y consentimiento.");
  const seen = new Set();
  const rows = lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const nombre = values[nameIndex] || "";
    const telefono = normalizePreviewPhone(values[phoneIndex]);
    const consentimiento = values[consentIndex] || "";
    const duplicate = telefono ? seen.has(telefono) : false;
    if (telefono) seen.add(telefono);
    const optedIn = TRUE_CONSENT.has(consentimiento.trim().toLocaleLowerCase("es"));
    return { nombre, telefono: telefono || values[phoneIndex] || "", consentimiento, valid: Boolean(nombre && telefono), duplicate, optedIn, eligible: Boolean(nombre && telefono && optedIn && !duplicate) };
  });
  const summary = { total: rows.length, valid: rows.filter((row) => row.valid).length, invalid: rows.filter((row) => !row.valid).length, duplicates: rows.filter((row) => row.duplicate).length, withoutConsent: rows.filter((row) => row.valid && !row.optedIn).length, eligible: rows.filter((row) => row.eligible).length };
  return { rows, summary };
}
