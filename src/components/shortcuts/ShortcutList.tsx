import type { Shortcut } from "../../types";

import { EmptyState } from "./EmptyState";
import { ShortcutRow } from "./ShortcutRow";

type ShortcutListProps = {
  shortcuts: Shortcut[];
  onEdit: (shortcut: Shortcut) => void;
  onDelete: (shortcut: Shortcut) => void;
  onToggle: (shortcut: Shortcut, enabled: boolean) => void;
  onAdd: () => void;
};

export const ShortcutList = ({
  shortcuts,
  onEdit,
  onDelete,
  onToggle,
  onAdd,
}: ShortcutListProps) => {
  if (shortcuts.length === 0) {
    return <EmptyState onAdd={onAdd} />;
  }

  return (
    <div className="h-full overflow-y-auto">
      {shortcuts.map((shortcut) => (
        <ShortcutRow
          key={shortcut.id}
          shortcut={shortcut}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};
