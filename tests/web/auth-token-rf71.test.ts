import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_TOKEN_KEY,
  clearStoredAuthToken,
  readStoredAuthToken,
  writeStoredAuthToken,
} from "../../apps/web/lib/auth-token";

/**
 * RF7.1 — auth token persistence helpers.
 */
describe("auth-token RF7.1", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips a stored token (happy)", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
    writeStoredAuthToken("tok-abc");
    expect(readStoredAuthToken()).toBe("tok-abc");
    expect(store.get(AUTH_TOKEN_KEY)).toBe("tok-abc");
  });

  it("returns null when storage throws (edge)", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {},
      removeItem: () => {},
    });
    expect(readStoredAuthToken()).toBeNull();
  });

  it("clears token on logout path (fail-safe)", () => {
    const store = new Map<string, string>([[AUTH_TOKEN_KEY, "old"]]);
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
    clearStoredAuthToken();
    expect(readStoredAuthToken()).toBeNull();
  });
});
