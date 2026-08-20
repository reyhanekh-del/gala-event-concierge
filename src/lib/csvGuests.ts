// CSV parsing + validation for guest list staging (prototype, client-side only).
import { normalizePhone, validatePhone } from "@/mock/guestListStore";

export type CsvRow = { line: number; name: string; phone: string; groupSize: number };
export type CsvError = { line: number; raw: string; reason: string };

export type CsvParseResult = {
  rows: CsvRow[];
  errors: CsvError[];
  total: number;
};

const splitLine = (line: string) => {
  // supports comma or semicolon separated values, with optional double quotes
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if ((ch === "," || ch === ";") && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((v) => v.trim());
};

const HEADER_HINTS = ["name", "phone", "mobile", "number", "guest", "group"];

export function parseGuestCsv(text: string): CsvParseResult {
  const lines = text.replace(/\r/g, "").split("\n");
  const rows: CsvRow[] = [];
  const errors: CsvError[] = [];
  const seen = new Map<string, number>();
  let total = 0;

  lines.forEach((raw, idx) => {
    const line = idx + 1;
    if (!raw.trim()) return;
    const cells = splitLine(raw);
    const lower = cells.map((c) => c.toLowerCase());
    // skip a header row
    if (idx === 0 && lower.some((c) => HEADER_HINTS.includes(c))) return;

    total++;
    const [name = "", phoneRaw = "", groupRaw = ""] = cells;

    if (!name.trim()) {
      errors.push({ line, raw, reason: "Missing guest name" });
      return;
    }
    if (!phoneRaw.trim()) {
      errors.push({ line, raw, reason: "Missing phone number" });
      return;
    }
    const phone = normalizePhone(phoneRaw);
    if (!validatePhone(phone)) {
      errors.push({ line, raw, reason: "Invalid phone — use international format, e.g. +966550000000" });
      return;
    }
    const prev = seen.get(phone);
    if (prev) {
      errors.push({ line, raw, reason: `Duplicate of line ${prev} in this file` });
      return;
    }
    const groupSize = groupRaw ? Number.parseInt(groupRaw, 10) : 1;
    if (groupRaw && (!Number.isFinite(groupSize) || groupSize < 1 || groupSize > 50)) {
      errors.push({ line, raw, reason: "Group size must be a whole number between 1 and 50" });
      return;
    }

    seen.set(phone, line);
    rows.push({ line, name: name.trim(), phone, groupSize: groupRaw ? groupSize : 1 });
  });

  return { rows, errors, total };
}

export const CSV_TEMPLATE = "Name,Phone,Group size\nFahad Al-Otaibi,+966551112233,2\nLayla Hassan,+971503321100,1\n";
