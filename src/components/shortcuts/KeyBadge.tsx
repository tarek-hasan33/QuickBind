import { cn } from "../../lib/utils";

type KeyBadgeProps = {
  label: string;
  className?: string;
};

export const KeyBadge = ({ label, className }: KeyBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-sm border border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-primary)]",
      className
    )}
  >
    {label}
  </span>
);
