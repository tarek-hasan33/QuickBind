export type ActionType = "launch_app" | "open_url" | "run_script" | "type_text";

export interface Shortcut {
  id: string;
  name: string;
  keys: string[];
  action_type: ActionType;
  action_value: string;
  description?: string;
  enabled: boolean;
  created_at: number;
}

export interface AppSettings {
  autostart: boolean;
  minimize_to_tray: boolean;
  show_notifications: boolean;
}
