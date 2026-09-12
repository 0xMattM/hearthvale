/**
 * True when RealmMinterASC reverted because this proof was already executed.
 */
export function isAlreadyProcessedRevert(err: unknown): boolean {
  const texts: string[] = [];
  if (typeof err === "string") texts.push(err);
  if (err instanceof Error) texts.push(err.message);
  if (err && typeof err === "object") {
    const o = err as { reason?: unknown; shortMessage?: unknown; message?: unknown };
    for (const v of [o.reason, o.shortMessage, o.message]) {
      if (typeof v === "string") texts.push(v);
    }
  }
  return texts.some((t) => /Query already processed/i.test(t));
}
