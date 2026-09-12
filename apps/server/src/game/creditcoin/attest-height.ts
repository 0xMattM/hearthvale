/**
 * Builds the Attestcoin proof-gen attested-height URL.
 */
export function attestedHeightUrl(
  proofBuilderUrl: string,
  chainKey: number,
): string {
  return `${proofBuilderUrl.replace(/\/$/, "")}/api/v1/attested-height/${chainKey}`;
}

/**
 * Reads `attestedHeight` from a proof-gen JSON body.
 */
export function parseAttestedHeight(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const n = (body as { attestedHeight?: unknown }).attestedHeight;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

/**
 * True when the proof-gen cache has caught up to the Sepolia block.
 */
export function isHeightAttested(
  latest: number | null,
  targetBlock: number,
): boolean {
  return latest != null && latest >= targetBlock;
}
