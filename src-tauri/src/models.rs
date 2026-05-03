use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Shortcut {
    pub id: String,
    pub name: String,
    pub keys: Vec<String>,
    pub action_type: String,
    pub action_value: String,
    pub description: Option<String>,
    pub enabled: bool,
    pub created_at: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub autostart: bool,
    pub minimize_to_tray: bool,
    pub show_notifications: bool,
}
