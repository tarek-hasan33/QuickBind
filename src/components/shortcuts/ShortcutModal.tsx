import * as React from "react";

import type { ActionType, Shortcut } from "../../types";
import { generateId } from "../../lib/utils";
import { useShortcutsStore } from "../../store/shortcutsStore";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "../ui/Modal";
import { KeyCaptureInput } from "./KeyCaptureInput";

const actionOptions: { label: string; value: ActionType }[] = [
  { label: "Launch App", value: "launch_app" },
  { label: "Open URL", value: "open_url" },
  { label: "Run Script", value: "run_script" },
  { label: "Type Text", value: "type_text" },
];

const actionValueLabel: Record<ActionType, string> = {
  launch_app: "App path",
  open_url: "URL",
  run_script: "Script",
  type_text: "Text",
};

type ShortcutModalProps = {
  open: boolean;
  onClose: () => void;
  shortcut?: Shortcut;
};

type ValidationErrors = {
  name?: string;
  keys?: string;
  action_value?: string;
};

export const ShortcutModal = ({
  open,
  onClose,
  shortcut,
}: ShortcutModalProps) => {
  const [name, setName] = React.useState("");
  const [keys, setKeys] = React.useState<string[]>([]);
  const [actionType, setActionType] = React.useState<ActionType>("launch_app");
  const [actionValue, setActionValue] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [submitError, setSubmitError] = React.useState<string | undefined>();
  const { add, update, isLoading } = useShortcutsStore();

  React.useEffect(() => {
    if (!open) return;
    setName(shortcut?.name ?? "");
    setKeys(shortcut?.keys ?? []);
    setActionType(shortcut?.action_type ?? "launch_app");
    setActionValue(shortcut?.action_value ?? "");
    setDescription(shortcut?.description ?? "");
    setErrors({});
    setSubmitError(undefined);
  }, [open, shortcut]);

  const handleSave = async () => {
    const nextErrors: ValidationErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (keys.length === 0) {
      nextErrors.keys = "Keys are required.";
    }

    if (!actionValue.trim()) {
      nextErrors.action_value = "Action value is required.";
    }

    setErrors(nextErrors);
    setSubmitError(undefined);

    if (Object.keys(nextErrors).length === 0) {
      const trimmedDescription = description.trim();

      try {
        if (shortcut) {
          await update({
            ...shortcut,
            name: name.trim(),
            keys,
            action_type: actionType,
            action_value: actionValue.trim(),
            description: trimmedDescription ? trimmedDescription : undefined,
          });
        } else {
          await add({
            id: generateId(),
            name: name.trim(),
            keys,
            action_type: actionType,
            action_value: actionValue.trim(),
            description: trimmedDescription ? trimmedDescription : undefined,
            enabled: true,
            created_at: Date.now(),
          });
        }

        onClose();
      } catch {
        setSubmitError("Failed to save shortcut.");
      }
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}
    >
      <ModalContent>
        <div className="space-y-4">
          <div>
            <ModalTitle>
              {shortcut ? "Edit Shortcut" : "Add Shortcut"}
            </ModalTitle>
            <ModalDescription>
              Define the keys and action for this shortcut.
            </ModalDescription>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">
              Name
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-[var(--color-danger)]">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">
              Keys
            </label>
            <KeyCaptureInput value={keys} onChange={setKeys} />
            {errors.keys && (
              <p className="text-xs text-[var(--color-danger)]">
                {errors.keys}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">
              Action Type
            </label>
            <div className="grid grid-cols-4 rounded-md border border-[var(--color-border)]">
              {actionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActionType(option.value)}
                  className={`h-8 px-2 text-xs font-medium transition-colors duration-150 ease-in ${
                    actionType === option.value
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">
              {actionValueLabel[actionType]}
            </label>
            <Input
              value={actionValue}
              onChange={(event) => setActionValue(event.target.value)}
            />
            {errors.action_value && (
              <p className="text-xs text-[var(--color-danger)]">
                {errors.action_value}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-colors duration-150 ease-in placeholder:text-[var(--color-text-tertiary)] focus-visible:border-[var(--color-accent)] focus-visible:bg-[var(--color-bg-surface)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              Save
            </Button>
          </div>
          {submitError && (
            <p className="text-xs text-[var(--color-danger)]">{submitError}</p>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};
