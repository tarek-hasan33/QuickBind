use tauri::AppHandle;
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_store::StoreExt;

use crate::models::AppSettings;

const STORE_FILE: &str = "quickbind.json";
const SETTINGS_KEY: &str = "settings";

fn default_settings() -> AppSettings {
    AppSettings {
        autostart: false,
        minimize_to_tray: true,
        show_notifications: true,
    }
}

fn load_settings(app: &AppHandle) -> Result<AppSettings, String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    let settings = store
        .get(SETTINGS_KEY)
        .and_then(|value| serde_json::from_value(value.clone()).ok())
        .unwrap_or_else(default_settings);
    Ok(settings)
}

fn save_settings(app: &AppHandle, settings: &AppSettings) -> Result<(), String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    let value = serde_json::to_value(settings).map_err(|e| e.to_string())?;
    store.set(SETTINGS_KEY, value);
    store.save().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_settings(app: AppHandle) -> Result<AppSettings, String> {
    load_settings(&app)
}

#[tauri::command]
pub fn update_settings(settings: AppSettings, app: AppHandle) -> Result<(), String> {
    save_settings(&app, &settings)
}

#[tauri::command]
pub fn set_autostart(enabled: bool, app: AppHandle) -> Result<(), String> {
    if enabled {
        app.autolaunch().enable().map_err(|e| e.to_string())?;
    } else {
        app.autolaunch().disable().map_err(|e| e.to_string())?;
    }
    Ok(())
}
