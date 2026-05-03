# QuickBind

**Fast global shortcuts for Windows.**

**Current version:** 1.1.0-beta (migrated from Electron to Tauri v2)

## 📌 Overview

QuickBind is a Windows desktop app that lets you define custom global shortcuts to trigger actions anywhere. It runs quietly in the tray and can start with Windows for hands‑off use.

## ✨ Features

- Global keyboard shortcuts that work across apps
- Tray icon with quick access (Open/Quit)
- Start at boot option with background launch
- Simple UI to add and manage shortcuts
- Local-only storage (no cloud, no accounts)

## 🧠 How It Works

QuickBind uses a Tauri v2 Rust backend to register global shortcuts and execute actions, while a React + Vite frontend manages your shortcut list and settings. Settings and shortcuts are stored locally on your machine.

## 📦 Installation

1. Download the latest beta `.exe` installer from the releases page.
2. Run the installer and follow the setup wizard.
3. Launch QuickBind from the Start Menu or desktop shortcut.

## 🚀 Usage

1. Open QuickBind from the tray or Start Menu.
2. Add a shortcut and define its action.
3. Toggle “Start at boot” if you want it always running.
4. Close the window—QuickBind keeps working in the tray.

## 📥 Download

[![Download](https://img.shields.io/badge/Download-QuickBind-blue?style=for-the-badge&logo=windows)](https://github.com/tarek-hasan33/QuickBind/releases)

## 🧰 Tech Stack

- Tauri v2 (Rust)
- React
- Vite
- tauri-plugin-store
- tauri-plugin-global-shortcut
- tauri-plugin-autostart

## 🔒 Security & Privacy

- Runs locally on your machine
- No data collection or telemetry
- Renderer is isolated with secure IPC

## ⚠️ Known Issues

- Shortcut conflicts can occur with system or app shortcuts
- Unsigned Windows builds may show a warning on install

## 🗺️ Roadmap

- Code signing for smoother installs
- Shortcut profiles and import/export
- Auto-update support

## 🤝 Contributing

Issues and pull requests are welcome. Please keep changes focused and well described.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

