import * as React from "react";
import * as Switch from "@radix-ui/react-switch";

import { cn } from "../../lib/utils";

type ToggleProps = React.ComponentPropsWithoutRef<typeof Switch.Root>;

export const Toggle = React.forwardRef<
  React.ElementRef<typeof Switch.Root>,
  ToggleProps
>(({ className, ...props }, ref) => (
  <Switch.Root
    ref={ref}
    className={cn(
      "relative inline-flex h-5 w-9 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] transition-colors duration-150 ease-in focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] data-[state=checked]:border-transparent data-[state=checked]:bg-[var(--color-accent)]",
      className
    )}
    {...props}
  >
    <Switch.Thumb
      className={cn(
        "block h-4 w-4 rounded-full bg-white shadow-[var(--shadow-sm)] transition-transform duration-150 ease-in data-[state=checked]:translate-x-4"
      )}
    />
  </Switch.Root>
));

Toggle.displayName = "Toggle";
