import { create } from "zustand";

import type { AppSettings } from "../types";
import { getSettings, setAutostart, updateSettings } from "../lib/tauri";

type SettingsState = {
  settings: AppSettings;
  isLoading: boolean;
  load: () => Promise<void>;
  setAutostart: (enabled: boolean) => Promise<void>;
  update: (settings: AppSettings) => Promise<void>;
};

const defaultSettings: AppSettings = {
  autostart: false,
  minimize_to_tray: true,
  show_notifications: true,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    try {
      const settings = await getSettings();
      set({ settings });
    } finally {
      set({ isLoading: false });
    }
  },
  setAutostart: async (enabled) => {
    set({ isLoading: true });
    try {
      await setAutostart(enabled);
      set((state) => ({ settings: { ...state.settings, autostart: enabled } }));
    } finally {
      set({ isLoading: false });
    }
  },
  update: async (settings) => {
    set({ isLoading: true });
    try {
      await updateSettings(settings);
      set({ settings });
    } finally {
      set({ isLoading: false });
    }
  },
}));
