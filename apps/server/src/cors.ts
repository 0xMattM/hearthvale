/**
 * CORS origin parsing helper for tests / docs (RF4.4).
 */
export function resolveCorsOrigins(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  return (env.GAME_CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
