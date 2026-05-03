import { invoke } from "@tauri-apps/api/core";

import type { AppSettings, Shortcut } from "../types";

export const getShortcuts = () => invoke<Shortcut[]>("get_shortcuts");

export const addShortcut = (shortcut: Shortcut) =>
  invoke<void>("add_shortcut", { shortcut });

export const updateShortcut = (shortcut: Shortcut) =>
  invoke<void>("update_shortcut", { shortcut });

export const deleteShortcut = (id: string) =>
  invoke<void>("delete_shortcut", { id });

export const toggleShortcut = (id: string, enabled: boolean) =>
  invoke<void>("toggle_shortcut", { id, enabled });

export const getSettings = () => invoke<AppSettings>("get_settings");

export const updateSettings = (settings: AppSettings) =>
  invoke<void>("update_settings", { settings });

export const setAutostart = (enabled: boolean) =>
  invoke<void>("set_autostart", { enabled });
