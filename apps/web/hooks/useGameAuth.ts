"use client";

import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { apiLogin, apiLogout, apiRegister } from "@/lib/api";
import {
  clearStoredAuthToken,
  readStoredAuthToken,
  setAuthExpiredHandler,
  writeStoredAuthToken,
} from "@/lib/auth-token";

export interface UseGameAuthOptions {
  /**
   * Loads `/api/me` (+ related) after token is set or restored.
   *
   * @param authToken - Bearer token.
   */
  refresh: (authToken: string) => Promise<void>;
  /** Shared busy flag with other GameApp actions. */
  setBusy: (busy: boolean) => void;
  /** Shared error banner with other GameApp actions. */
  setError: (error: string | null) => void;
}

export interface UseGameAuthResult {
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  /**
   * Login or register, persist token, then refresh state.
   *
   * @param mode - Auth endpoint to call.
   */
  handleAuth: (mode: "login" | "register") => Promise<void>;
  /**
   * Revoke server session (best-effort), clear storage, drop local token.
   * Caller should wipe game state after this returns.
   */
  clearAuthSession: () => void;
}

/**
 * Auth token, credentials form, restore-on-mount, login/register, logout (RF7.1).
 *
 * @param options - Refresh + shared busy/error setters from GameApp.
 * @returns Auth session controls for the shell.
 */
export function useGameAuth(options: UseGameAuthOptions): UseGameAuthResult {
  const { refresh, setBusy, setError } = options;
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const saved = readStoredAuthToken();
    if (!saved) return;
    setToken(saved);
    void refresh(saved);
  }, [refresh]);

  const handleAuth = useCallback(
    async (mode: "login" | "register") => {
      setBusy(true);
      setError(null);
      try {
        const res =
          mode === "login"
            ? await apiLogin(username, password)
            : await apiRegister(username, password);
        if (!res.ok || !res.token) {
          setError(res.error ?? "Auth failed");
          return;
        }
        writeStoredAuthToken(res.token);
        setToken(res.token);
        setPassword("");
        await refresh(res.token);
      } catch {
        setError("Could not reach the server.");
      } finally {
        setBusy(false);
      }
    },
    [username, password, refresh, setBusy, setError],
  );

  const clearAuthSession = useCallback(() => {
    const t = token;
    if (t) void apiLogout(t);
    clearStoredAuthToken();
    setToken(null);
    setPassword("");
  }, [token]);

  useEffect(() => {
    setAuthExpiredHandler(() => {
      clearStoredAuthToken();
      setToken(null);
      setPassword("");
    });
    return () => setAuthExpiredHandler(null);
  }, []);

  return {
    token,
    setToken,
    username,
    setUsername,
    password,
    setPassword,
    handleAuth,
    clearAuthSession,
  };
}
