import * as React from "react";

import { cn } from "../../lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 text-sm text-[var(--color-text-primary)] transition-colors duration-150 ease-in placeholder:text-[var(--color-text-tertiary)] focus-visible:border-[var(--color-accent)] focus-visible:bg-[var(--color-bg-surface)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
