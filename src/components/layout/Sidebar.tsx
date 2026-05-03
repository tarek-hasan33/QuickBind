import { Settings, Zap } from "lucide-react";

import { cn } from "../../lib/utils";

export type AppPage = "shortcuts" | "settings";

type SidebarProps = {
  currentPage: AppPage;
  onPageChange: (page: AppPage) => void;
  autostartToggle?: React.ReactNode;
  versionLabel?: string;
};

export const Sidebar = ({
  currentPage,
  onPageChange,
  autostartToggle,
  versionLabel = "v0.1.0",
}: SidebarProps) => (
  <aside className="flex h-full w-50 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-bg-base)] p-3">
    <nav className="space-y-1">
      <button
        type="button"
        onClick={() => onPageChange("shortcuts")}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-150 ease-in",
          currentPage === "shortcuts"
            ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
        )}
      >
        <Zap className="h-4 w-4" />
        Shortcuts
      </button>
      <button
        type="button"
        onClick={() => onPageChange("settings")}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-150 ease-in",
          currentPage === "settings"
            ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
        )}
      >
        <Settings className="h-4 w-4" />
        Settings
      </button>
    </nav>

    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
        <span>Start at boot</span>
        {autostartToggle}
      </div>
      <div className="text-xs text-[var(--color-text-tertiary)]">
        {versionLabel}
      </div>
    </div>
  </aside>
);
