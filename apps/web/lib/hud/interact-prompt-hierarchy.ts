/**
 * Action-first hierarchy for the walk-up interact prompt (PL2.1 / PL5.1).
 * Key badge + verb lead; wayfinding prefix stays soft.
 */

export interface InteractPromptHierarchy {
  /** Interact key when actionable; null for status-only prompts. */
  keyLabel: "E" | null;
  /** Soft wayfinding / section (e.g. Woodland) before the action. */
  prefix: string | null;
  /** Leading verb or status word (Plant, Use, Chop, Growing…). */
  verb: string;
  /** Remainder after the verb (may be empty). */
  detail: string;
}

/**
 * Splits prompt copy into key / prefix / verb / detail for action-first UI.
 *
 * @param label - Full prompt string from resolveInteractPrompt.
 * @param showKey - Whether the interact key is actionable.
 * @returns Hierarchy parts for InteractPrompt chrome.
 */
export function buildInteractPromptHierarchy(
  label: string,
  showKey: boolean,
): InteractPromptHierarchy {
  const trimmed = label.trim();
  if (!trimmed) {
    return { keyLabel: null, prefix: null, verb: "", detail: "" };
  }

  let prefix: string | null = null;
  let action = trimmed;
  const sep = trimmed.indexOf(" · ");
  if (sep > 0) {
    const left = trimmed.slice(0, sep).trim();
    const right = trimmed.slice(sep + 3).trim();
    // Reason: Explore section / Exit prefixes read as wayfinding, not the verb.
    if (right && looksLikeWayfindingPrefix(left)) {
      prefix = left;
      action = right;
    }
  }

  const { verb, detail } = splitVerbDetail(action);

  return {
    keyLabel: showKey ? "E" : null,
    prefix,
    verb,
    detail,
  };
}

/**
 * Splits an action phrase into verb + detail, preferring "Verb · rest" (PL5.1).
 *
 * @param action - Prompt text after any wayfinding prefix.
 * @returns Verb and remainder.
 */
function splitVerbDetail(action: string): { verb: string; detail: string } {
  const sep = action.indexOf(" · ");
  if (sep > 0) {
    const left = action.slice(0, sep).trim();
    const right = action.slice(sep + 3).trim();
    // Reason: Travel · free · circuit keeps Travel as the bold verb.
    if (right && looksLikeActionVerbLead(left)) {
      return { verb: left, detail: right };
    }
  }
  const parts = action.split(/\s+/);
  return { verb: parts[0] ?? action, detail: parts.slice(1).join(" ") };
}

/**
 * True when the left side of " · " is wayfinding, not the primary verb phrase.
 *
 * @param left - Text before the first middle-dot separator.
 */
function looksLikeWayfindingPrefix(left: string): boolean {
  const lower = left.toLowerCase();
  if (
    lower === "woodland" ||
    lower === "mines" ||
    lower === "hunt grounds" ||
    lower === "exit" ||
    lower === "exit arena"
  ) {
    return true;
  }
  // Growing / Soft war / status phrases keep the whole label as verb+detail.
  return false;
}

/**
 * True when the left side of " · " is the action verb (Travel · free…).
 *
 * @param left - Text before a middle-dot separator in the action phrase.
 */
function looksLikeActionVerbLead(left: string): boolean {
  const lower = left.toLowerCase();
  return lower === "travel" || lower === "exit";
}
