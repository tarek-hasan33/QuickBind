mod commands;
mod models;
mod tray;

use std::io;

use tauri_plugin_autostart::MacosLauncher;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            tray::setup_tray(app.handle())
                .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;
            commands::shortcuts::register_enabled_shortcuts(app.handle())
                .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::shortcuts::get_shortcuts,
            commands::shortcuts::add_shortcut,
            commands::shortcuts::update_shortcut,
            commands::shortcuts::delete_shortcut,
            commands::shortcuts::toggle_shortcut,
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::set_autostart,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
