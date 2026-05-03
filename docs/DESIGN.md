# QuickBind — Design System & UI Specification

## Design Philosophy

QuickBind is a **power-user productivity tool**. The UI should feel like a premium native Windows app — calm, precise, and out of the way. Think Raycast or Linear: purposeful whitespace, crisp typography, subtle depth.

**Aesthetic Direction:** Refined minimalism — soft light surfaces, clear hierarchy, no decorative noise. Every pixel earns its place.

---

## Color Palette (Light Mode)

### Base Colors
```
--color-bg-base:        #F7F7F8   /* App background */
--color-bg-surface:     #FFFFFF   /* Cards, panels */
--color-bg-elevated:    #FFFFFF   /* Modals, dropdowns (with shadow) */
--color-bg-subtle:      #F0F0F2   /* Input backgrounds, hover states */
--color-bg-hover:       #EAEAEC   /* Row hover */

--color-border:         #E2E2E6   /* Default borders */
--color-border-strong:  #C8C8CE   /* Focused inputs, dividers */
```

### Text Colors
```
--color-text-primary:   #111114   /* Headings, labels */
--color-text-secondary: #5C5C6E   /* Descriptions, meta */
--color-text-tertiary:  #9898A8   /* Placeholders, disabled */
--color-text-inverse:   #FFFFFF   /* On dark backgrounds */
```

### Brand / Accent
```
--color-accent:         #5B6CF9   /* Primary CTA, active state, links */
--color-accent-hover:   #4A5CE8   /* Hover on accent */
--color-accent-subtle:  #EEF0FE   /* Accent background tint */
--color-accent-border:  #C7CBFC   /* Accent-tinted borders */
```

### Semantic Colors
```
--color-success:        #22C55E
--color-success-subtle: #F0FDF4
--color-warning:        #F59E0B
--color-warning-subtle: #FFFBEB
--color-danger:         #EF4444
--color-danger-subtle:  #FEF2F2
```

### Shadows
```
--shadow-sm:    0 1px 2px rgba(0,0,0,0.06)
--shadow-md:    0 4px 12px rgba(0,0,0,0.08)
--shadow-lg:    0 8px 24px rgba(0,0,0,0.10)
--shadow-focus: 0 0 0 3px rgba(91,108,249,0.20)
```

---

## Typography

### Font Stack
```
Primary (UI):     'Geist', 'DM Sans', system-ui, sans-serif
Monospace (keys): 'Geist Mono', 'JetBrains Mono', monospace
```

> Use `@fontsource/geist` and `@fontsource/geist-mono` via npm.

### Type Scale
```
--text-xs:   11px / line-height: 1.5
--text-sm:   13px / line-height: 1.5
--text-base: 14px / line-height: 1.6
--text-md:   15px / line-height: 1.6
--text-lg:   17px / line-height: 1.4
--text-xl:   20px / line-height: 1.3
--text-2xl:  24px / line-height: 1.2
```

### Font Weights
```
Regular:   400
Medium:    500
Semibold:  600
Bold:      700
```

---

## Spacing System

Base unit: 4px

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
```

---

## Border Radius
```
--radius-sm:   4px   /* Tags, badges */
--radius-md:   8px   /* Inputs, buttons */
--radius-lg:   12px  /* Cards */
--radius-xl:   16px  /* Panels */
--radius-full: 9999px /* Pills, toggles */
```

---

## Component Specifications

### Shortcut Row (Main List Item)
```
Layout:     Horizontal flex, align center
Height:     52px
Padding:    0 16px
Background: --color-bg-surface
Hover:      --color-bg-hover
Border-bottom: 1px solid --color-border

Left:       Key badge(s) + action label
Right:      Status toggle + kebab menu

Key Badge:
  Background: --color-bg-subtle
  Border:     1px solid --color-border-strong
  Font:       Geist Mono, 12px, weight 500
  Padding:    2px 8px
  Radius:     --radius-sm
  Color:      --color-text-primary

Action Label:
  Font:       14px, weight 500
  Color:      --color-text-primary

Action Subtitle (type/description):
  Font:       12px, weight 400
  Color:      --color-text-secondary
```

### Buttons
```
Primary:
  Background: --color-accent
  Color:      white
  Height:     36px
  Padding:    0 16px
  Radius:     --radius-md
  Font:       14px, semibold
  Hover:      --color-accent-hover

Secondary:
  Background: --color-bg-subtle
  Color:      --color-text-primary
  Border:     1px solid --color-border
  Hover:      --color-bg-hover

Ghost:
  Background: transparent
  Color:      --color-text-secondary
  Hover:      --color-bg-subtle
```

### Input Fields
```
Background:   --color-bg-subtle
Border:       1px solid --color-border
Radius:       --radius-md
Height:       36px
Padding:      0 12px
Font:         14px, regular
Color:        --color-text-primary
Placeholder:  --color-text-tertiary

Focus:
  Border:     1px solid --color-accent
  Box-shadow: --shadow-focus
  Background: --color-bg-surface
```

### Key Capture Input (special)
```
Same as Input, but:
  Font:         Geist Mono, 15px
  Text-align:   center
  Background:   --color-accent-subtle
  Border:       1px solid --color-accent-border
  Min-width:    200px
  Placeholder:  "Press keys..."
```

### Toggle (Enable/Disable shortcut)
```
Track width:  36px
Track height: 20px
Radius:       full
Off:          --color-bg-subtle, border --color-border
On:           --color-accent
Thumb:        white circle, shadow-sm
Transition:   150ms ease
```

### Sidebar Nav Item
```
Height:       36px
Padding:      0 12px
Radius:       --radius-md
Font:         14px, medium
Color:        --color-text-secondary
Icon:         16px, same color

Active:
  Background: --color-accent-subtle
  Color:      --color-accent
  Icon:       --color-accent

Hover:
  Background: --color-bg-hover
  Color:      --color-text-primary
```

---

## Layout — App Window

```
Window size:  900 × 580px (default), resizable min 720×480
Title bar:    Custom (frameless: true in Tauri)
              Height: 40px
              Background: --color-bg-surface
              Border-bottom: 1px solid --color-border
              Drag region: entire bar except buttons

Sidebar:      Width: 200px, fixed
              Background: --color-bg-base
              Border-right: 1px solid --color-border

Main content: Flex 1
              Background: --color-bg-surface
              Padding: 0 (list fills edge to edge)
```

---

## Window Sections

### Title Bar
- Left: App icon (16px) + "QuickBind" wordmark (13px, semibold)
- Center: Drag region
- Right: Minimize / Close buttons (custom drawn, 12px circles)

### Sidebar
```
Top:
  - "Shortcuts" nav item (home/list icon)
  - "Settings" nav item (gear icon)

Bottom:
  - Version number (text-xs, tertiary)
  - "Start at boot" toggle inline
```

### Main Panel — Shortcuts View
```
Top bar:
  Height: 52px
  Padding: 0 20px
  Left: "Shortcuts" heading (text-lg, semibold)
  Right: "+ Add Shortcut" button (primary)

List area:
  Scrollable
  Each row: ShortcutRow component
  Empty state: centered icon + text + CTA button

Footer:
  Height: 36px
  Background: --color-bg-base
  Border-top: 1px solid --color-border
  Left: shortcut count (text-xs, tertiary)
  Right: "All enabled" / "X disabled" status
```

### Main Panel — Settings View
```
Padding: 24px
Sections with labels (text-xs, semibold, uppercase, tertiary, tracked)
Each setting: label left, control right
Dividers between sections
```

---

## Modal — Add / Edit Shortcut

```
Width:        480px
Padding:      24px
Radius:       --radius-xl
Shadow:       --shadow-lg
Backdrop:     rgba(0,0,0,0.3) blur(4px)

Fields:
  1. Action Name (text input)
  2. Shortcut Keys (key capture input)
  3. Action Type (segmented control: Launch App / Open URL / Run Script / Type Text)
  4. Action Value (dynamic based on type)
  5. Description (optional, textarea 2 rows)

Buttons:
  Right-aligned: Cancel (secondary) + Save (primary)
```

### Action Type — Segmented Control
```
Full width
4 segments
Active segment: --color-accent bg, white text
Inactive: transparent, --color-text-secondary
Border: 1px solid --color-border around whole control
Radius: --radius-md
Height: 34px
Font: 13px, medium
```

---

## Animations & Transitions

```
Default transition:  150ms ease
Hover transitions:   100ms ease
Modal open:          scale(0.96)→scale(1), opacity 0→1, 180ms ease-out
Modal close:         180ms ease-in
Row appear:          translateY(4px)→0, opacity 0→1, 150ms ease
Toast slide-in:      translateX(100%)→0, 200ms ease-out
Toggle:              150ms ease
```

---

## Icons

Use `lucide-react` throughout.
- Shortcuts page: `Zap`
- Settings: `Settings`
- Add: `Plus`
- Delete: `Trash2`
- Edit: `Pencil`
- Drag handle: `GripVertical`
- App launch: `AppWindow`
- URL: `Globe`
- Script: `Terminal`
- Type text: `Type`
- Tray: `Keyboard`
- Boot: `Power`

Icon size: 16px in UI, 14px in nav sidebar.

---

## Empty State

```
Center of list area
Icon: Zap (32px, --color-text-tertiary)
Heading: "No shortcuts yet" (text-md, semibold, primary)
Body: "Add your first shortcut to get started." (text-sm, secondary)
CTA: "+ Add Shortcut" (primary button, sm)
Gap between elements: 8px
```

---

## Toast Notifications

```
Position: bottom-right, 16px from edges
Width:     320px
Padding:   12px 16px
Radius:    --radius-lg
Shadow:    --shadow-lg
Background: --color-bg-elevated

Types:
  Success: left border 3px --color-success
  Error:   left border 3px --color-danger
  Info:    left border 3px --color-accent

Auto-dismiss: 3000ms
```
