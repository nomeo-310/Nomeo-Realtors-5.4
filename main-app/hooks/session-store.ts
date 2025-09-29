import { create } from "zustand";

interface SessionState {
  session_key: string | null;
  createSession: () => void;
  clearSession: () => void;
}


export const useSessionStore = create<SessionState>((set) => {
  const stored_key =
    typeof window !== "undefined" ? sessionStorage.getItem("session_key") : null;

  return {
    session_key: stored_key,
    createSession: () => {
      let key =
        typeof window !== "undefined"
          ? sessionStorage.getItem("session_key")
          : null;

      if (!key) {
        key = crypto.randomUUID();
        sessionStorage.setItem("session_key", key);
      }

      set({ session_key: key });
    },
    clearSession: () => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("session_key");
      }
      set({ session_key: null });
    },
  };
});
