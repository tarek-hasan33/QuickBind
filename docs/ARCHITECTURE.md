# QuickBind — Architecture & Features Plan

## Why Tauri Instead of Electron

| Concern | Electron | Tauri v2 |
|---------|----------|----------|
| Installer size | ~90MB | ~3–6MB |
| RAM at idle | ~150MB | ~25MB |
| Startup speed | 2–4s | <1s |
| Global shortcuts | uiohook-napi (fragile) | tauri-plugin-global-shortcut (native) |
| Tray support | Built-in | Built-in |
| Autostart | electron-auto-launch | tauri-plugin-autostart |
| Frontend reuse | — | React + Vite same as before |

---

## Features (v1 Scope)

### Core — Must Have
- [x] Register global keyboard shortcuts system-wide
- [x] 4 action types: Launch App, Open URL, Run Script, Type Text
- [x] Enable / disable individual shortcuts
- [x] System tray: show/hide window, quit
- [x] Start at boot (autostart)
- [x] Persist shortcuts locally (no cloud)
- [x] Add / Edit / Delete shortcuts via UI
- [x] Show conflict warning if key combo already registered

### Nice to Have (v1.5)
- [ ] Drag-to-reorder shortcuts
- [ ] Search/filter shortcuts list
- [ ] Duplicate a shortcut
- [ ] Import/export shortcuts as JSON

### Future (v2)
- [ ] Shortcut profiles (switch between sets)
- [ ] Code signing (removes Windows SmartScreen warning)
- [ ] Auto-update via tauri-plugin-updater

---

## Tauri Commands (Rust ↔ React IPC)

All commands are defined in `src-tauri/src/commands/`.

### Shortcut Commands (`shortcuts.rs`)

```rust
#[tauri::command]
async fn get_shortcuts(store: ...) -> Result<Vec<Shortcut>, String>

#[tauri::command]
async fn add_shortcut(shortcut: Shortcut, store: ..., app: AppHandle) -> Result<(), String>

#[tauri::command]
async fn update_shortcut(shortcut: Shortcut, store: ..., app: AppHandle) -> Result<(), String>

#[tauri::command]
async fn delete_shortcut(id: String, store: ..., app: AppHandle) -> Result<(), String>

#[tauri::command]
async fn toggle_shortcut(id: String, enabled: bool, store: ..., app: AppHandle) -> Result<(), String>
```

### Settings Commands (`settings.rs`)

```rust
#[tauri::command]
async fn get_settings(store: ...) -> Result<AppSettings, String>

#[tauri::command]
async fn set_autostart(enabled: bool, autostart: ...) -> Result<(), String>

#[tauri::command]
async fn update_settings(settings: AppSettings, store: ...) -> Result<(), String>
```

---

## How Shortcut Registration Works

1. On app start → `get_shortcuts()` loads all saved shortcuts from store
2. For each shortcut where `enabled == true` → register with `GlobalShortcutManager`
3. When shortcut fires → Tauri emits an event to frontend OR executes action in Rust directly
4. Action execution happens in Rust (safer, no Node.js subprocess)

### Action Execution (Rust side)
```
launch_app  → std::process::Command::new(path).spawn()
open_url    → tauri::api::shell::open(url)  or opener crate
run_script  → Command::new("cmd").args(["/C", script]).spawn()
type_text   → enigo crate (simulates keyboard typing)
```

> Add `enigo = "0.2"` to Cargo.toml for type_text support.

---

## Tray Behavior

```
Tray icon: icons/icon.ico (32x32)
Tray menu:
  - "Open QuickBind"   → show + focus window
  - separator
  - "X shortcuts active"  → disabled label (info only)
  - separator
  - "Quit"             → app.exit(0)

Double-click tray icon → show/hide window toggle
```

Window close button → hide to tray (do NOT quit)
Quit only via tray menu.

---

## Window Behavior

```
Frameless window (custom title bar drawn in React)
  - Drag region: TitleBar component (data-tauri-drag-region)
  - Minimize: appWindow.minimize()
  - Close: appWindow.hide()  ← hides to tray, does not exit

On first launch: window is shown centered
On subsequent launches: starts hidden, tray-only
```

---

## Frontend State Management (Zustand)

### shortcutsStore.ts
```typescript
interface ShortcutsStore {
  shortcuts: Shortcut[];
  isLoading: boolean;
  // Actions
  load: () => Promise<void>;
  add: (s: Omit<Shortcut, 'id' | 'created_at'>) => Promise<void>;
  update: (s: Shortcut) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle: (id: string, enabled: boolean) => Promise<void>;
}
```

### settingsStore.ts
```typescript
interface SettingsStore {
  settings: AppSettings;
  isLoading: boolean;
  load: () => Promise<void>;
  setAutostart: (enabled: boolean) => Promise<void>;
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
}
```

---

## KeyCaptureInput Logic

```typescript
// useKeyCapture.ts

// 1. On focus: start listening to keydown events
// 2. Build modifier set: Ctrl, Alt, Shift, Meta (Win key)
// 3. On non-modifier key: record the combo and stop
// 4. Format: ["Ctrl", "Shift", "K"]
// 5. On blur without capture: clear

// Displayed as: Ctrl + Shift + K (with KeyBadge per segment)

// Forbidden combos (do not allow):
// - Single modifier keys only
// - Alt+F4 (system)
// - Win key alone
```

---

## Error Handling

- Shortcut conflict → show inline warning in modal ("This combo is already in use by [name]")
- Shortcut registration fail (OS-level) → toast error
- Store read/write fail → toast error + retry once
- Invalid action value (empty path, bad URL) → inline field validation in modal

---

## Build & Development

### Setup
```bash
# Prerequisites: Rust, Node.js 18+, Tauri CLI v2

npm install
cargo install tauri-cli --version "^2"

# Dev mode (hot reload)
npm run tauri dev

# Production build
npm run tauri build
```

### Output
```
src-tauri/target/release/bundle/
  nsis/QuickBind_x.x.x_x64-setup.exe   # NSIS installer (~4–6MB)
  msi/QuickBind_x.x.x_x64.msi          # MSI installer
```

---

## Migration from Electron

### What to Delete
```
- node_modules/
- electron/           (or wherever your main process lives)
- Any electron-specific packages from package.json
- forge.config.js / electron-builder.yml
- preload.js
- ipcMain / ipcRenderer code
```

### What to Keep / Port
```
Keep:
  - src/components/**   (React components, adapt styles)
  - src/App.tsx         (adapt routing)

Port (rewrite):
  - Electron IPC → Tauri invoke() calls
  - electron-store → tauri-plugin-store
  - electron-auto-launch → tauri-plugin-autostart
  - uiohook-napi → tauri-plugin-global-shortcut
  - Tray code → tray.rs in Rust
```
