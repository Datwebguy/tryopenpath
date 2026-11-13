import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Where policy and history are stored. Set OPENPATH_DATA_DIR to a persistent disk (e.g. a Railway volume).
export const dataDir =
  process.env.OPENPATH_DATA_DIR ??
  (process.env.VERCEL ? path.join(os.tmpdir(), "openpath") : path.join(process.cwd(), ".data"));

const WORKSPACE = /^[a-f0-9]{32}$/;

// Every visitor gets a private folder. The id comes from a random cookie and is checked
// here, before it can reach the disk.
export function wsFile(ws: string, name: string) {
  if (!WORKSPACE.test(ws)) throw new Error("Invalid workspace");
  return `ws/${ws}/${name}`;
}

// Resolve inside the data folder only.
function inside(rel: string) {
  const full = path.resolve(dataDir, rel);
  if (!full.startsWith(path.resolve(dataDir) + path.sep)) throw new Error("Path outside the data folder");
  return full;
}

export function readJson<T>(rel: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(inside(rel), "utf8")) as T;
  } catch {
    return fallback;
  }
}

// Written to a temporary file first, then renamed, so a crash never leaves a half-written file.
export function writeJson(rel: string, value: unknown) {
  try {
    const file = inside(rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
    fs.renameSync(tmp, file);
  } catch (e) {
    console.error(`Could not save ${rel}:`, e);
  }
}
