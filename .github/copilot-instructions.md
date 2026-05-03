# QuickBind — Copilot Instructions

You are helping build **QuickBind**, a lightweight Windows desktop app for global keyboard shortcuts.
It is being rewritten from Electron to **Tauri v2** with a **React + TypeScript + Vite** frontend.

Always read and follow the planning docs in the root of this project:
- `DESIGN.md` — colors, typography, spacing, component specs
- `FILE_STRUCTURE.md` — where every file lives
- `ARCHITECTURE.md` — tech stack, Rust commands, data model
- `COPILOT_PROMPTS.md` — the step-by-step build plan

---

## Stack — Never Deviate From This

| Layer | Technology |
|-------|-----------|
| App framework | Tauri v2 (NOT Electron) |
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS + CSS variables (see DESIGN.md) |
| UI primitives | Radix UI |
| Icons | lucide-react only |
| Fonts | Geist + Geist Mono via @fontsource |
| State | Zustand |
| Backend | Rust |
| Storage | tauri-plugin-store |
| Shortcuts | tauri-plugin-global-shortcut |
| Autostart | tauri-plugin-autostart |

---

## Rules — Always Follow These

### General
- Do only what the current step asks. Do not jump ahead.
- Do not install packages not listed in FILE_STRUCTURE.md without asking.
- Do not use `any` in TypeScript — use proper types from `src/types/index.ts`.
- Do not use inline styles — use Tailwind classes and CSS variables only.
- Do not hardcode hex colors — always use CSS variables (e.g. `var(--color-accent)`).
- Every component must be in the correct folder per FILE_STRUCTURE.md.

### Styling
- All colors come from CSS variables defined in `src/index.css`.
- Font family: `font-family: 'Geist', sans-serif` for UI, `'Geist Mono', monospace` for keys.
- All focus states use `box-shadow: var(--shadow-focus)` — never default browser outline.
- All transitions are `150ms ease` unless DESIGN.md specifies otherwise.
- Border radius values come from CSS variables: `--radius-sm`, `--radius-md`, etc.

### React
- Use functional components with hooks only — no class components.
- Use `cn()` from `src/lib/utils.ts` for conditional classNames (clsx + tailwind-merge).
- All Tauri API calls go through `src/lib/tauri.ts` — never call `invoke()` directly in components.
- All async Tauri calls must have try/catch with toast error feedback.
- Load initial data in `App.tsx` via store `.load()` calls in a `useEffect`.

### Rust
- All Tauri commands go in `src-tauri/src/commands/`.
- All structs go in `src-tauri/src/models.rs` and must derive `Serialize, Deserialize, Clone, Debug`.
- Return `Result<T, String>` from all commands — map errors to strings with `.map_err(|e| e.to_string())`.
- Never use `unwrap()` in command handlers — handle errors properly.
- Use `tauri-plugin-store` for all persistence. Store key: `"quickbind.json"`.

### Window
- Window is frameless (`decorations: false`). The title bar is drawn in React (`TitleBar.tsx`).
- The drag region uses `data-tauri-drag-region` attribute.
- Closing the window hides it to tray — it never quits the app.
- Quit is only available from the tray menu.

### Tray
- Tray menu: "Open QuickBind" | separator | "Quit"
- Single click or "Open QuickBind" → show and focus window.
- "Quit" → `app.exit(0)`.

---

## Data Types (source of truth)

```typescript
export type ActionType = 'launch_app' | 'open_url' | 'run_script' | 'type_text';

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
```

---

## Design Tokens (quick reference)

```
Accent color:     #5B6CF9  → var(--color-accent)
Background:       #F7F7F8  → var(--color-bg-base)
Surface:          #FFFFFF  → var(--color-bg-surface)
Text primary:     #111114  → var(--color-text-primary)
Text secondary:   #5C5C6E  → var(--color-text-secondary)
Border:           #E2E2E6  → var(--color-border)
Focus shadow:     0 0 0 3px rgba(91,108,249,0.20) → var(--shadow-focus)
```

Full palette, typography, spacing, and component specs are in `DESIGN.md`.

---

## Common Mistakes to Avoid

- Do NOT use `electron`, `ipcRenderer`, `ipcMain`, or any Electron API.
- Do NOT use `localStorage` or `sessionStorage` — use `tauri-plugin-store`.
- Do NOT use `react-router` — navigation is simple state (`'shortcuts' | 'settings'`).
- Do NOT use `useState` for global state — use Zustand stores.
- Do NOT use `window.confirm` or `window.alert` — use Modal or Toast components.
- Do NOT forget `data-tauri-drag-region` on the TitleBar drag area.
- Do NOT call `appWindow.close()` — call `appWindow.hide()` instead.
- Do NOT use arbitrary Tailwind values like `w-[37px]` — use spacing variables.
- Do NOT add comments explaining obvious code — keep files clean.
