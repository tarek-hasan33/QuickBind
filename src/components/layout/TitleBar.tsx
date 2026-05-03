import { Minus, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { Button } from "../ui/Button";

export const TitleBar = () => {
  const appWindow = getCurrentWindow();

  return (
    <div className="flex h-10 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3">
      <div className="flex items-center gap-2" data-tauri-drag-region>
        <div className="flex h-4 w-4 items-center justify-center text-[var(--color-accent)]">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor"
          >
            <path d="M4 6h16v12H4z" />
            <path d="M7 9h10v2H7zM7 13h6v2H7z" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-[var(--color-text-primary)]">
          QuickBind
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 px-0"
          onClick={() => appWindow.minimize()}
          aria-label="Minimize window"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 px-0"
          onClick={() => appWindow.hide()}
          aria-label="Hide window"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
