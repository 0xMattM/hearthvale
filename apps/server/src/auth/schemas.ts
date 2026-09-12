/**
 * Runtime request schemas (RF9.1+).
 */
import { z } from "zod";

export const authCredentialsSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(256),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;

/**
 * Parses auth JSON body; returns field errors for HTTP 400.
 *
 * @param body - Unknown request JSON.
 */
export function parseAuthCredentials(
  body: unknown,
):
  | { ok: true; data: AuthCredentials }
  | { ok: false; error: string } {
  const parsed = authCredentialsSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: "Invalid username or password payload." };
  }
  return { ok: true, data: parsed.data };
}

export const marketBuySchema = z.object({
  listingId: z.string().min(1).max(64),
});

export const marketListSchema = z.object({
  itemId: z.string().min(1).max(64),
  qty: z.number().int().min(1).max(99),
  priceCoins: z.number().int().min(1).max(1_000_000),
});

export const vendorBodySchema = z.object({
  itemId: z.string().min(1).max(64),
  qty: z.number().int().min(1).max(99).optional(),
  x: z.number().finite().optional(),
  z: z.number().finite().optional(),
});

/**
 * Parses a zod schema result into Action-style ok/error.
 *
 * @param schema - Zod schema.
 * @param body - Unknown JSON.
 * @param errorMessage - Client-facing error.
 */
export function parseBody<T>(
  schema: z.ZodType<T>,
  body: unknown,
  errorMessage: string,
): { ok: true; data: T } | { ok: false; error: string } {
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, error: errorMessage };
  return { ok: true, data: parsed.data };
}
