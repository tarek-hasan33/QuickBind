import { Pencil, Trash2 } from "lucide-react";

import type { Shortcut } from "../../types";
import { formatKeys } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import { Toggle } from "../ui/Toggle";
import { KeyBadge } from "./KeyBadge";

type ShortcutRowProps = {
  shortcut: Shortcut;
  onEdit: (shortcut: Shortcut) => void;
  onDelete: (shortcut: Shortcut) => void;
  onToggle: (shortcut: Shortcut, enabled: boolean) => void;
};

const actionLabels: Record<Shortcut["action_type"], string> = {
  launch_app: "Launch App",
  open_url: "Open URL",
  run_script: "Run Script",
  type_text: "Type Text",
};

export const ShortcutRow = ({
  shortcut,
  onEdit,
  onDelete,
  onToggle,
}: ShortcutRowProps) => (
  <div className="flex h-14 items-center justify-between border-b border-[var(--color-border)] px-4 py-0 transition-colors duration-150 ease-in hover:bg-[var(--color-bg-hover)] animate-in fade-in-0 slide-in-from-bottom-1">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex flex-wrap items-center gap-1">
        {shortcut.keys.map((key) => (
          <KeyBadge key={`${shortcut.id}-${key}`} label={key} />
        ))}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {shortcut.name}
        </div>
        <div className="text-xs text-[var(--color-text-secondary)]">
          {formatKeys(shortcut.keys)} · {actionLabels[shortcut.action_type]}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Toggle
        checked={shortcut.enabled}
        onCheckedChange={(checked) => onToggle(shortcut, Boolean(checked))}
        aria-label={`Toggle ${shortcut.name}`}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors duration-150 ease-in hover:bg-[var(--color-bg-subtle)]"
            aria-label={`Actions for ${shortcut.name}`}
          >
            <span className="text-lg leading-none">•••</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(shortcut)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(shortcut)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);
