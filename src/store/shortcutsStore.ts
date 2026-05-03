import { create } from "zustand";

import type { Shortcut } from "../types";
import {
  addShortcut,
  deleteShortcut,
  getShortcuts,
  toggleShortcut,
  updateShortcut,
} from "../lib/tauri";

type ShortcutsState = {
  shortcuts: Shortcut[];
  isLoading: boolean;
  load: () => Promise<void>;
  add: (shortcut: Shortcut) => Promise<void>;
  update: (shortcut: Shortcut) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle: (id: string, enabled: boolean) => Promise<void>;
};

export const useShortcutsStore = create<ShortcutsState>((set) => ({
  shortcuts: [],
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    try {
      const shortcuts = await getShortcuts();
      set({ shortcuts });
    } finally {
      set({ isLoading: false });
    }
  },
  add: async (shortcut) => {
    set({ isLoading: true });
    try {
      await addShortcut(shortcut);
      const shortcuts = await getShortcuts();
      set({ shortcuts });
    } finally {
      set({ isLoading: false });
    }
  },
  update: async (shortcut) => {
    set({ isLoading: true });
    try {
      await updateShortcut(shortcut);
      const shortcuts = await getShortcuts();
      set({ shortcuts });
    } finally {
      set({ isLoading: false });
    }
  },
  remove: async (id) => {
    set({ isLoading: true });
    try {
      await deleteShortcut(id);
      const shortcuts = await getShortcuts();
      set({ shortcuts });
    } finally {
      set({ isLoading: false });
    }
  },
  toggle: async (id, enabled) => {
    set((state) => ({
      shortcuts: state.shortcuts.map((shortcut) =>
        shortcut.id === id ? { ...shortcut, enabled } : shortcut
      ),
    }));
    try {
      await toggleShortcut(id, enabled);
    } catch {
      const shortcuts = await getShortcuts();
      set({ shortcuts });
    }
  },
}));
