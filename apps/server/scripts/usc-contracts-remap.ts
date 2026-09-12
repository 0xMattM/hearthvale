import path from "node:path";

/**
 * Returns the Forge remapping base for `@gluwa/usc-contracts/`.
 *
 * Official package layout is `contracts/decoding/EvmV1Decoder.sol`, so the
 * remap target is the `contracts/` directory (not the package root).
 */
export function uscContractsRemapBase(evmDecoderPath: string): string {
  const decoderDir = path.dirname(path.resolve(evmDecoderPath));
  if (path.basename(decoderDir) !== "decoding") {
    throw new Error(`EvmV1Decoder is not in a decoding/ folder: ${evmDecoderPath}`);
  }
  return path.dirname(decoderDir).replace(/\\/g, "/");
}
