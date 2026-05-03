import * as React from "react";

import type { Shortcut } from "../types";
import { Button } from "../components/ui/Button";
import { ShortcutList, ShortcutModal } from "../components/shortcuts";
import { useShortcutsStore } from "../store/shortcutsStore";

export const ShortcutsPage = () => {
  const { shortcuts, isLoading, load, remove, toggle } = useShortcutsStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingShortcut, setEditingShortcut] = React.useState<
    Shortcut | undefined
  >();

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleAdd = () => {
    setEditingShortcut(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (shortcut: Shortcut) => {
    setEditingShortcut(shortcut);
    setIsModalOpen(true);
  };

  const handleDelete = async (shortcut: Shortcut) => {
    await remove(shortcut.id);
  };

  const handleToggle = async (shortcut: Shortcut, enabled: boolean) => {
    await toggle(shortcut.id, enabled);
  };

  const disabledCount = shortcuts.filter(
    (shortcut) => !shortcut.enabled
  ).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between border-b border-[var(--color-border)] px-5">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Shortcuts
        </h1>
        <Button size="sm" onClick={handleAdd} disabled={isLoading}>
          + Add Shortcut
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ShortcutList
          shortcuts={shortcuts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          onAdd={handleAdd}
        />
      </div>

      <div className="flex h-9 items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 text-xs text-[var(--color-text-tertiary)]">
        <span>{shortcuts.length} shortcuts</span>
        <span>
          {disabledCount === 0 ? "All enabled" : `${disabledCount} disabled`}
        </span>
      </div>

      <ShortcutModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shortcut={editingShortcut}
      />
    </div>
  );
};
