import * as React from "react";

import { cn } from "../../lib/utils";
import { KeyBadge } from "./KeyBadge";

type KeyCaptureInputProps = {
  value: string[];
  onChange: (keys: string[]) => void;
};

const modifierOrder = ["Ctrl", "Alt", "Shift", "Meta"] as const;

const normalizeKey = (event: React.KeyboardEvent) => {
  const key = event.key;
  if (key === " ") {
    return "Space";
  }
  if (key.length === 1) {
    return key.toUpperCase();
  }
  return key
    .replace("ArrowUp", "Up")
    .replace("ArrowDown", "Down")
    .replace("ArrowLeft", "Left")
    .replace("ArrowRight", "Right");
};

const isModifierKey = (key: string) =>
  key === "Shift" || key === "Control" || key === "Alt" || key === "Meta";

export const KeyCaptureInput = ({ value, onChange }: KeyCaptureInputProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const modifierKeys = new Set<string>();
    if (event.ctrlKey) modifierKeys.add("Ctrl");
    if (event.altKey) modifierKeys.add("Alt");
    if (event.shiftKey) modifierKeys.add("Shift");
    if (event.metaKey) modifierKeys.add("Meta");

    if (isModifierKey(event.key)) {
      return;
    }

    const key = normalizeKey(event);
    const combo = [
      ...modifierOrder.filter((modifier) => modifierKeys.has(modifier)),
      key,
    ];

    onChange(combo);
    containerRef.current?.blur();
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        "min-h-9 w-full min-w-48 cursor-text rounded-md border border-[var(--color-accent-border)] bg-[var(--color-accent-subtle)] px-3 py-2 text-center text-sm text-[var(--color-text-primary)] shadow-none transition-colors duration-150 ease-in focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
      )}
    >
      {value.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-1">
          {value.map((key) => (
            <KeyBadge key={key} label={key} />
          ))}
        </div>
      ) : (
        <span className="text-[var(--color-text-tertiary)]">Press keys...</span>
      )}
    </div>
  );
};
