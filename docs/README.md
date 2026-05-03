# QuickBind — Project Overview

## What We're Building

A rewrite of QuickBind from Electron → Tauri v2.
Same features, fraction of the size.

| Metric | Before (Electron) | After (Tauri) |
|--------|-------------------|---------------|
| Installer | ~90MB | ~4–6MB |
| RAM idle | ~150–300MB | ~25MB |
| Startup | 2–4s | <1s |
| Frontend | React + Vite | React + Vite (same) |
| Backend | Node.js | Rust |

---

## Docs in This Folder

| File | Purpose |
|------|---------|
| `DESIGN.md` | Full UI/UX spec: colors, typography, spacing, every component |
| `FILE_STRUCTURE.md` | Complete directory tree + key file contents |
| `ARCHITECTURE.md` | Tech stack, Tauri commands, data model, migration guide |
| `COPILOT_PROMPTS.md` | Step-by-step prompts to give Copilot (Steps 0–12) |

---

## How to Use These Docs

1. Read `ARCHITECTURE.md` first for the big picture
2. Use `COPILOT_PROMPTS.md` — give each prompt to Copilot **in order**, one step at a time
3. Refer to `DESIGN.md` when Copilot asks about colors, sizing, or component behavior
4. Refer to `FILE_STRUCTURE.md` if Copilot needs to know where a file should live

---

## Quick Reference

### Color Accent
`#5B6CF9` (indigo-blue)

### Fonts
- UI: Geist (via `@fontsource/geist`)
- Keys: Geist Mono (via `@fontsource/geist-mono`)

### Key Plugins
- `tauri-plugin-global-shortcut` — registers OS-level shortcuts
- `tauri-plugin-autostart` — start at boot
- `tauri-plugin-store` — local JSON storage

### 4 Action Types
1. Launch App — path to .exe
2. Open URL — https://...
3. Run Script — cmd command
4. Type Text — simulated keyboard input (via enigo)

### Window
- 900 × 580px default
- Frameless (custom title bar in React)
- Close = hide to tray
- Quit = tray menu only

---

## Prerequisites to Install Before Starting

- [Rust](https://rustup.rs/) — `rustup update`
- [Node.js](https://nodejs.org/) — v18 or later
- [Tauri CLI v2](https://tauri.app/) — `cargo install tauri-cli --version "^2"`
- [VS Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) — required for Rust on Windows (C++ workload)
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) — usually already on Windows 11

---

## Recommended VS Code Extensions

- Tauri (tauri-apps.tauri-vscode)
- rust-analyzer
- GitHub Copilot
- Tailwind CSS IntelliSense
- ESLint
