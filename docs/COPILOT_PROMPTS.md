# QuickBind — Copilot Prompt Guide

This file contains ready-to-use prompts for GitHub Copilot (or Copilot Chat / Copilot Edits) to rebuild QuickBind step by step. Run them in order.

---

## STEP 0 — Cleanup Old Project

**Prompt:**
```
Delete the following from this project:
- All files in the electron/ directory (or main process files if not in a subfolder)
- node_modules/
- dist/
- out/
- forge.config.js (or electron-builder.yml)
- preload.js
- Any file importing from 'electron'

Keep:
- src/components/ folder (we will refactor these)
- src/App.tsx
- README.md

Then scaffold a brand new Tauri v2 + React + TypeScript + Vite project in this directory using:
  npm create tauri-app@latest . -- --template react-ts
Accept all defaults. Do not overwrite src/components/.
```

---

## STEP 1 — Install Dependencies

**Prompt:**
```
In this Tauri + React + TypeScript project, install the following npm packages:

Dependencies:
  @tauri-apps/api
  @tauri-apps/plugin-global-shortcut
  @tauri-apps/plugin-autostart
  @tauri-apps/plugin-store
  @radix-ui/react-dialog
  @radix-ui/react-dropdown-menu
  @radix-ui/react-tooltip
  @radix-ui/react-switch
  zustand
  lucide-react
  @fontsource/geist
  @fontsource/geist-mono
  clsx
  tailwind-merge
  tailwindcss-animate

Dev dependencies:
  tailwindcss
  autoprefixer
  postcss

Then initialize Tailwind CSS (npx tailwindcss init -p) and configure tailwind.config.ts to scan ./src/**/*.{ts,tsx}.

Also add to Cargo.toml:
  tauri-plugin-global-shortcut = "2"
  tauri-plugin-autostart = "2"
  tauri-plugin-store = "2"
  serde = { version = "1", features = ["derive"] }
  serde_json = "1"
  uuid = { version = "1", features = ["v4"] }
  enigo = "0.2"
```

---

## STEP 2 — Types & CSS Variables

**Prompt:**
```
Create the file src/types/index.ts with these TypeScript types:

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

Then replace the contents of src/index.css with:
- Import @fontsource/geist and @fontsource/geist-mono
- Tailwind base/components/utilities directives
- CSS custom properties (variables) for the full design system:

  Colors:
    --color-bg-base: #F7F7F8
    --color-bg-surface: #FFFFFF
    --color-bg-subtle: #F0F0F2
    --color-bg-hover: #EAEAEC
    --color-border: #E2E2E6
    --color-border-strong: #C8C8CE
    --color-text-primary: #111114
    --color-text-secondary: #5C5C6E
    --color-text-tertiary: #9898A8
    --color-accent: #5B6CF9
    --color-accent-hover: #4A5CE8
    --color-accent-subtle: #EEF0FE
    --color-accent-border: #C7CBFC
    --color-success: #22C55E
    --color-danger: #EF4444

  Shadows:
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.06)
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08)
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.10)
    --shadow-focus: 0 0 0 3px rgba(91,108,249,0.20)

  Set body font to 'Geist', sans-serif. Set monospace elements to 'Geist Mono'.
  Set font-size: 14px on html.
  Set background: var(--color-bg-base) on body.
  Set box-sizing: border-box globally.
```

---

## STEP 3 — Rust Backend Models & Commands

**Prompt:**
```
In src-tauri/src/, create the following Rust files:

1. models.rs — structs matching the TypeScript types:
   - Shortcut { id, name, keys: Vec<String>, action_type, action_value, description: Option<String>, enabled, created_at }
   - AppSettings { autostart, minimize_to_tray, show_notifications }
   Both derive Debug, Serialize, Deserialize, Clone.

2. commands/mod.rs — re-exports shortcuts and settings modules.

3. commands/shortcuts.rs — Tauri commands:
   - get_shortcuts: reads from tauri-plugin-store, returns Vec<Shortcut>
   - add_shortcut(shortcut: Shortcut): saves to store, registers global shortcut if enabled
   - update_shortcut(shortcut: Shortcut): updates in store, re-registers shortcut
   - delete_shortcut(id: String): removes from store, unregisters shortcut
   - toggle_shortcut(id: String, enabled: bool): enables/disables registration

   For shortcut execution on trigger: match action_type:
     "launch_app" => std::process::Command::new(&action_value).spawn()
     "open_url"   => opener::open(&action_value) or shell open
     "run_script" => Command::new("cmd").args(["/C", &action_value]).spawn()
     "type_text"  => use enigo to type the text

4. commands/settings.rs — Tauri commands:
   - get_settings: reads AppSettings from store
   - update_settings(settings: AppSettings): saves to store
   - set_autostart(enabled: bool): calls tauri-plugin-autostart

5. tray.rs — sets up system tray:
   - Tray icon from icons/icon.ico
   - Menu items: "Open QuickBind", separator, "Quit"
   - Left-click or "Open QuickBind" → show and focus window
   - "Quit" → app.exit(0)

6. Update lib.rs to:
   - Register all plugins: global-shortcut, autostart, store
   - Register all commands
   - Set up tray
   - On window close-requested event: hide window instead of closing (minimize to tray)
   - On startup: load shortcuts from store and register all enabled ones
```

---

## STEP 4 — Tauri Frontend Bridge

**Prompt:**
```
Create src/lib/tauri.ts with typed async wrapper functions for all Tauri commands using invoke():

  import { invoke } from '@tauri-apps/api/core';
  import type { Shortcut, AppSettings } from '../types';

  export const getShortcuts = () => invoke<Shortcut[]>('get_shortcuts');
  export const addShortcut = (s: Omit<Shortcut, 'id' | 'created_at'>) => invoke<void>('add_shortcut', { shortcut: s });
  export const updateShortcut = (s: Shortcut) => invoke<void>('update_shortcut', { shortcut: s });
  export const deleteShortcut = (id: string) => invoke<void>('delete_shortcut', { id });
  export const toggleShortcut = (id: string, enabled: boolean) => invoke<void>('toggle_shortcut', { id, enabled });
  export const getSettings = () => invoke<AppSettings>('get_settings');
  export const updateSettings = (settings: AppSettings) => invoke<void>('update_settings', { settings });
  export const setAutostart = (enabled: boolean) => invoke<void>('set_autostart', { enabled });

Also create src/lib/utils.ts with:
  - cn(...classes): clsx + tailwind-merge utility
  - formatKeys(keys: string[]): joins with ' + ' for display
  - generateId(): returns crypto.randomUUID()
```

---

## STEP 5 — Zustand Stores

**Prompt:**
```
Create src/store/shortcutsStore.ts using Zustand:
  State: shortcuts: Shortcut[], isLoading: boolean
  Actions:
    load()   — calls getShortcuts(), sets state
    add(s)   — calls addShortcut(), then load()
    update(s) — calls updateShortcut(), then load()
    remove(id) — calls deleteShortcut(), then load()
    toggle(id, enabled) — calls toggleShortcut(), updates local state optimistically

Create src/store/settingsStore.ts using Zustand:
  State: settings: AppSettings, isLoading: boolean
  Actions:
    load() — calls getSettings(), sets state
    setAutostart(enabled) — calls setAutostart(), updates local state
    update(s) — calls updateSettings(), updates local state
```

---

## STEP 6 — UI Primitives

**Prompt:**
```
Create the following UI primitive components in src/components/ui/.
All components should use CSS variables from index.css and Tailwind utility classes.
Use Radix UI as the base where specified.

1. Button.tsx
   Variants: 'primary' | 'secondary' | 'ghost' | 'danger'
   Sizes: 'sm' | 'md' (default)
   Primary: bg [--color-accent], white text, hover [--color-accent-hover]
   Secondary: bg [--color-bg-subtle], border [--color-border], hover [--color-bg-hover]
   Ghost: transparent bg, [--color-text-secondary], hover [--color-bg-subtle]
   Height: 36px (md), 30px (sm). Radius: 8px. Font: 14px, 500 weight.

2. Input.tsx
   bg [--color-bg-subtle], border [--color-border], radius 8px, height 36px, padding 0 12px
   Focus: border [--color-accent], box-shadow [--shadow-focus]
   Placeholder color: [--color-text-tertiary]

3. Toggle.tsx (wrapping Radix Switch)
   Track: 36px × 20px, radius full
   Off: [--color-bg-subtle] with border [--color-border]
   On: [--color-accent]
   Thumb: white, shadow-sm, transition 150ms

4. Modal.tsx (wrapping Radix Dialog)
   Overlay: rgba(0,0,0,0.3) with backdrop-filter blur(4px)
   Content: width 480px, padding 24px, radius 16px, shadow [--shadow-lg], bg [--color-bg-surface]
   Animate: scale 0.96→1 + opacity 0→1 on open, 180ms ease-out

5. DropdownMenu.tsx (wrapping Radix DropdownMenu)
   Content: bg [--color-bg-surface], border [--color-border], radius 8px, shadow [--shadow-md]
   Items: height 32px, padding 0 12px, font 13px, hover bg [--color-bg-hover]

6. Toast.tsx
   Fixed bottom-right, 16px from edges, width 320px
   Left border 3px: success=#22C55E, danger=#EF4444, info=#5B6CF9
   Padding 12px 16px, radius 12px, shadow [--shadow-lg]
   Auto-dismiss after 3000ms with exit animation
```

---

## STEP 7 — Shortcut Components

**Prompt:**
```
Create the following components in src/components/shortcuts/:

1. KeyBadge.tsx
   Displays a single key name (e.g. "Ctrl", "K")
   Style: bg [--color-bg-subtle], border [--color-border-strong], font Geist Mono 12px weight 500
   Padding: 2px 8px, radius 4px, color [--color-text-primary]

2. KeyCaptureInput.tsx
   Props: value: string[], onChange: (keys: string[]) => void
   On focus: intercept keydown events
   Collect modifiers (Ctrl, Alt, Shift, Meta/Win) and one regular key
   On complete combo: call onChange, lose focus
   Display: row of KeyBadge components, or placeholder "Press keys..." if empty
   Style: same as Input but centered, Geist Mono font, bg [--color-accent-subtle], border [--color-accent-border]
   Min-width: 200px

3. ShortcutRow.tsx
   Props: shortcut: Shortcut, onEdit, onDelete, onToggle
   Height: 52px, horizontal flex, padding 0 16px
   Border-bottom: 1px solid [--color-border]
   Hover: bg [--color-bg-hover]
   Left side: row of KeyBadge per key + action name (14px, 500) + action type label (12px, [--color-text-secondary])
   Right side: Toggle component + DropdownMenu with Edit and Delete options
   Add smooth appear animation: translateY(4px)→0 + opacity 0→1

4. EmptyState.tsx
   Centered vertically and horizontally in parent
   Zap icon from lucide-react, 32px, [--color-text-tertiary]
   Heading: "No shortcuts yet" 15px, 600 weight
   Body: "Add your first shortcut to get started." 13px, [--color-text-secondary]
   "+ Add Shortcut" primary button below
   Gap: 8px between elements

5. ShortcutList.tsx
   Renders list of ShortcutRow or EmptyState
   Scrollable, fills available height
   Props: shortcuts, onEdit, onDelete, onToggle

6. ShortcutModal.tsx
   Wraps Modal.tsx
   Props: open, onClose, shortcut?: Shortcut (undefined = add mode)
   Title: "Add Shortcut" or "Edit Shortcut"
   Form fields (using Input, KeyCaptureInput):
     - Name (required)
     - Keys (KeyCaptureInput, required)
     - Action Type (SegmentedControl: Launch App | Open URL | Run Script | Type Text)
     - Action Value (Input, label changes based on type: "App path" / "URL" / "Script" / "Text")
     - Description (optional, textarea 2 rows)
   Validate on save: name required, keys required, action_value required
   Show inline error messages below fields
   Footer: Cancel + Save buttons, right-aligned
```

---

## STEP 8 — Layout Components

**Prompt:**
```
Create the following layout components:

1. src/components/layout/TitleBar.tsx
   Height: 40px, bg [--color-bg-surface], border-bottom [--color-border]
   data-tauri-drag-region on the main div (makes it draggable)
   Left: small keyboard icon (16px, [--color-accent]) + "QuickBind" text (13px, 600 weight)
   Right: Minimize button (dash icon, 14px) and Close button (X icon, 14px)
     Both: 28×28px, ghost style, rounded
     Minimize: calls appWindow.minimize() from @tauri-apps/api/window
     Close: calls appWindow.hide() (hides to tray, does NOT quit)

2. src/components/layout/Sidebar.tsx
   Width: 200px, fixed height, bg [--color-bg-base], border-right [--color-border]
   Nav items (use Zap icon for Shortcuts, Settings icon for Settings):
     Each: height 36px, padding 0 12px, radius 8px, font 14px 500
     Inactive: [--color-text-secondary]
     Active: bg [--color-accent-subtle], color [--color-accent]
     Hover: bg [--color-bg-hover]
   Bottom section:
     "Start at boot" label + Toggle (AutostartToggle.tsx)
     Version text (text-xs, [--color-text-tertiary])

3. src/components/layout/AppShell.tsx
   Full window: flex column, height 100vh, overflow hidden
   TitleBar at top
   Below: flex row, flex 1, overflow hidden
     Sidebar on left
     Main content area: flex 1, overflow hidden, bg [--color-bg-surface]
```

---

## STEP 9 — Pages

**Prompt:**
```
Create src/pages/ShortcutsPage.tsx:
  Top bar: height 52px, border-bottom [--color-border], padding 0 20px
    Left: "Shortcuts" heading (17px, 600)
    Right: "+ Add Shortcut" primary button (opens ShortcutModal)
  Middle: ShortcutList (fills remaining space, scrollable)
  Footer: height 36px, bg [--color-bg-base], border-top [--color-border], padding 0 16px
    Left: "{n} shortcuts" count (12px, [--color-text-tertiary])
    Right: "All enabled" or "{n} disabled" (12px, [--color-text-tertiary])
  Uses shortcutsStore for data
  ShortcutModal opens for add (no shortcut prop) and edit (with shortcut prop)

Create src/pages/SettingsPage.tsx:
  Padding: 24px
  Section: "General"
    - Start at boot: label + Toggle
    - Minimize to tray on close: label + Toggle
    - Show notifications: label + Toggle
  Each setting row: flex, justify-between, align-center, height 48px
  Section header: text-xs, 600, uppercase, letter-spacing wide, [--color-text-tertiary], margin-bottom 4px
  Divider between rows: 1px [--color-border]
  Uses settingsStore for data, persists on change
```

---

## STEP 10 — App Root & Router

**Prompt:**
```
Update src/App.tsx:
  - Import and call shortcutsStore.load() and settingsStore.load() on mount (useEffect)
  - Use simple state for current page: 'shortcuts' | 'settings'
  - Pass current page and setter to AppShell/Sidebar for nav
  - Render ShortcutsPage or SettingsPage in main content area based on current page
  - Wrap with a Toast context/provider if you implemented Toast
  - No react-router needed (only 2 views, simple state is fine)

Update src/main.tsx:
  - Import '@fontsource/geist/400.css'
  - Import '@fontsource/geist/500.css'
  - Import '@fontsource/geist/600.css'
  - Import '@fontsource/geist-mono/400.css'
  - Import './index.css'
  - Standard React 18 createRoot render
```

---

## STEP 11 — Tauri Config

**Prompt:**
```
Update src-tauri/tauri.conf.json with:
  - productName: "QuickBind"
  - identifier: "com.quickbind.app"
  - window: width 900, height 580, minWidth 720, minHeight 480
  - decorations: false (custom title bar)
  - transparent: false
  - center: true
  - visible: false (start hidden, shown on tray click)
  - title: "QuickBind"
  - Bundle: include icon in all required sizes
  - Set allowlist / permissions for: shell open, global shortcut, store, autostart

Update src-tauri/tauri.conf.json bundle section:
  - targets: ["nsis", "msi"]
  - category: "Utility"
  - shortDescription: "Fast global shortcuts for Windows"
```

---

## STEP 12 — Final Polish

**Prompt:**
```
Review all components and apply these final touches:

1. All focus states should use box-shadow: var(--shadow-focus) — not default browser outline
2. All transitions should be 150ms ease unless specified otherwise
3. Ensure all text uses the correct CSS variable colors (no hardcoded hex in components)
4. Confirm Geist font loads correctly (check font-family in computed styles)
5. Make sure the app window has no white flash on startup (set bg color in index.html body style)
6. Add window.addEventListener('contextmenu', e => e.preventDefault()) in main.tsx to disable right-click menu
7. Ensure ShortcutModal traps focus properly (Radix Dialog handles this automatically)
8. Add aria-label to all icon-only buttons

Then run: npm run tauri dev
Fix any TypeScript errors or import issues that appear.
```
