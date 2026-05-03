import * as React from "react";

import { cn } from "../../lib/utils";

type ToastVariant = "success" | "danger" | "info";

type ToastProps = {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
};

const variantClasses: Record<ToastVariant, string> = {
  success: "border-l-4 border-l-[var(--color-success)]",
  danger: "border-l-4 border-l-[var(--color-danger)]",
  info: "border-l-4 border-l-[var(--color-accent)]",
};

export const Toast: React.FC<ToastProps> = ({
  open,
  message,
  variant = "info",
  onClose,
}) => {
  const [isVisible, setIsVisible] = React.useState(open);
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsExiting(false);
      const timeout = window.setTimeout(() => setIsExiting(true), 3000);
      return () => window.clearTimeout(timeout);
    }

    if (isVisible) {
      setIsExiting(true);
    }

    return undefined;
  }, [open, isVisible]);

  React.useEffect(() => {
    if (!isExiting) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [isExiting, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 w-80 rounded-xl bg-[var(--color-bg-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-lg)] transition-all duration-150 ease-in",
        variantClasses[variant],
        isExiting ? "translate-x-2 opacity-0" : "translate-x-0 opacity-100"
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};
