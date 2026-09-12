import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Parses KEY=VALUE lines into process.env without overwriting existing vars.
 */
export function applyEnvText(text: string): void {
  const body = text.replace(/^\uFEFF/, "");
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

/**
 * Repo-root `.env` candidates (dev from apps/server vs repo root).
 */
export function envFileCandidates(fromDir = process.cwd()): string[] {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return [
    path.resolve(fromDir, ".env"),
    path.resolve(fromDir, "../../.env"),
    path.resolve(here, "../../../.env"),
  ];
}

/**
 * Loads the first existing `.env` so Creditcoin keys work under `tsx watch`.
 */
export function loadGameEnv(): string | null {
  for (const file of envFileCandidates()) {
    if (!fs.existsSync(file)) continue;
    applyEnvText(fs.readFileSync(file, "utf8"));
    return file;
  }
  return null;
}

if (!process.env.VITEST) {
  loadGameEnv();
}
