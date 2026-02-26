import fs from "fs";
import path from "path";

export interface LinkRecord {
  code: string;
  originalUrl: string;
  createdAt: string;
  clicks: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "links.json");

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export function readLinks(): LinkRecord[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as LinkRecord[];
}

export function writeLinks(links: LinkRecord[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2), "utf-8");
}

export function findLink(code: string): LinkRecord | undefined {
  const links = readLinks();
  return links.find((l) => l.code === code);
}

export function createLink(originalUrl: string): LinkRecord {
  const links = readLinks();
  const code = generateCode(links.map((l) => l.code));
  const record: LinkRecord = {
    code,
    originalUrl,
    createdAt: new Date().toISOString(),
    clicks: 0,
  };
  links.push(record);
  writeLinks(links);
  return record;
}

export function incrementClicks(code: string): LinkRecord | null {
  const links = readLinks();
  const idx = links.findIndex((l) => l.code === code);
  if (idx === -1) return null;
  links[idx].clicks += 1;
  writeLinks(links);
  return links[idx];
}

function generateCode(existingCodes: string[]): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  do {
    code = Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  } while (existingCodes.includes(code));
  return code;
}
