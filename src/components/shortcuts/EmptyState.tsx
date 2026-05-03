import { Zap } from "lucide-react";

import { Button } from "../ui/Button";

type EmptyStateProps = {
  onAdd: () => void;
};

export const EmptyState = ({ onAdd }: EmptyStateProps) => (
  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
    <Zap className="h-8 w-8 text-[var(--color-text-tertiary)]" />
    <div className="text-sm font-semibold text-[var(--color-text-primary)]">
      No shortcuts yet
    </div>
    <div className="text-xs text-[var(--color-text-secondary)]">
      Add your first shortcut to get started.
    </div>
    <Button size="sm" onClick={onAdd}>
      + Add Shortcut
    </Button>
  </div>
);
