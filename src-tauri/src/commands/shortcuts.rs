use std::process::Command;

use enigo::{Enigo, Keyboard, Settings};
use tauri::AppHandle;
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use tauri_plugin_store::StoreExt;

use crate::models::Shortcut;

const STORE_FILE: &str = "quickbind.json";
const SHORTCUTS_KEY: &str = "shortcuts";

fn load_shortcuts(app: &AppHandle) -> Result<Vec<Shortcut>, String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    let shortcuts = store
        .get(SHORTCUTS_KEY)
        .and_then(|value| serde_json::from_value(value.clone()).ok())
        .unwrap_or_default();
    Ok(shortcuts)
}

fn save_shortcuts(app: &AppHandle, shortcuts: &[Shortcut]) -> Result<(), String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    let value = serde_json::to_value(shortcuts).map_err(|e| e.to_string())?;
    store.set(SHORTCUTS_KEY, value);
    store.save().map_err(|e| e.to_string())
}

fn shortcut_accelerator(shortcut: &Shortcut) -> String {
    shortcut.keys.join("+")
}

fn execute_action(action_type: &str, action_value: &str) -> Result<(), String> {
    match action_type {
        "launch_app" => {
            Command::new(action_value)
                .spawn()
                .map(|_| ())
                .map_err(|e| e.to_string())
        }
        "open_url" => {
            tauri_plugin_opener::open_url(action_value, None::<&str>).map_err(|e| e.to_string())
        }
        "run_script" => Command::new("cmd")
            .args(["/C", action_value])
            .spawn()
            .map(|_| ())
            .map_err(|e| e.to_string()),
        "type_text" => {
            let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;
            enigo.text(action_value).map_err(|e| e.to_string())
        }
        _ => Err("Unknown action type".to_string()),
    }
}

fn register_shortcut(app: &AppHandle, shortcut: &Shortcut) -> Result<(), String> {
    let accelerator = shortcut_accelerator(shortcut);
    let action_type = shortcut.action_type.clone();
    let action_value = shortcut.action_value.clone();
    app.global_shortcut()
        .on_shortcut(accelerator.as_str(), move |_app, _shortcut, _event| {
            let _ = execute_action(&action_type, &action_value);
        })
        .map_err(|e| e.to_string())
}

fn unregister_shortcut(app: &AppHandle, shortcut: &Shortcut) -> Result<(), String> {
    let accelerator = shortcut_accelerator(shortcut);
    app.global_shortcut()
    .unregister(accelerator.as_str())
        .map_err(|e| e.to_string())
}

pub fn register_enabled_shortcuts(app: &AppHandle) -> Result<(), String> {
    let shortcuts = load_shortcuts(app)?;
    for shortcut in shortcuts.into_iter().filter(|s| s.enabled) {
        register_shortcut(app, &shortcut)?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_shortcuts(app: AppHandle) -> Result<Vec<Shortcut>, String> {
    load_shortcuts(&app)
}

#[tauri::command]
pub fn add_shortcut(shortcut: Shortcut, app: AppHandle) -> Result<(), String> {
    let mut shortcuts = load_shortcuts(&app)?;
    shortcuts.push(shortcut.clone());
    save_shortcuts(&app, &shortcuts)?;

    if shortcut.enabled {
        register_shortcut(&app, &shortcut)?;
    }

    Ok(())
}

#[tauri::command]
pub fn update_shortcut(shortcut: Shortcut, app: AppHandle) -> Result<(), String> {
    let mut shortcuts = load_shortcuts(&app)?;
    let existing = shortcuts.iter().find(|s| s.id == shortcut.id).cloned();

    if let Some(previous) = existing {
        if previous.enabled {
            let _ = unregister_shortcut(&app, &previous);
        }
    } else {
        return Err("Shortcut not found".to_string());
    }

    shortcuts.retain(|s| s.id != shortcut.id);
    shortcuts.push(shortcut.clone());
    save_shortcuts(&app, &shortcuts)?;

    if shortcut.enabled {
        register_shortcut(&app, &shortcut)?;
    }

    Ok(())
}

#[tauri::command]
pub fn delete_shortcut(id: String, app: AppHandle) -> Result<(), String> {
    let mut shortcuts = load_shortcuts(&app)?;
    let existing = shortcuts.iter().find(|s| s.id == id).cloned();

    if let Some(previous) = existing {
        if previous.enabled {
            let _ = unregister_shortcut(&app, &previous);
        }
    }

    shortcuts.retain(|s| s.id != id);
    save_shortcuts(&app, &shortcuts)?;
    Ok(())
}

#[tauri::command]
pub fn toggle_shortcut(id: String, enabled: bool, app: AppHandle) -> Result<(), String> {
    let mut shortcuts = load_shortcuts(&app)?;
    let mut target = None;

    for shortcut in &mut shortcuts {
        if shortcut.id == id {
            shortcut.enabled = enabled;
            target = Some(shortcut.clone());
            break;
        }
    }

    let target = target.ok_or_else(|| "Shortcut not found".to_string())?;

    if enabled {
        register_shortcut(&app, &target)?;
    } else {
        let _ = unregister_shortcut(&app, &target);
    }

    save_shortcuts(&app, &shortcuts)?;
    Ok(())
}
