import { create } from "zustand";
import { User, Batch } from "@/types";

interface SessionState {
  user: User | null;
  batch: Batch | null;
  setUser: (user: User) => void;
  setBatch: (batch: Batch) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  batch: null,
  setUser: (user) => set({ user }),
  setBatch: (batch) => set({ batch }),
  clear: () => set({ user: null, batch: null }),
}));
