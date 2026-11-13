import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Where demo data lives. Set OPENPATH_DATA_DIR to a persistent disk (e.g. a Railway volume).
export const dataDir =
  process.env.OPENPATH_DATA_DIR ??
  (process.env.VERCEL ? path.join(os.tmpdir(), "openpath") : path.join(process.cwd(), ".data"));

export function readJson<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(name: string, value: unknown) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(path.join(dataDir, name), JSON.stringify(value, null, 2));
  } catch (e) {
    console.error(`Could not save ${name}:`, e);
  }
}
