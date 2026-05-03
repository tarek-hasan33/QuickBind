import * as React from "react";

import { Toggle } from "../components/ui/Toggle";
import { useSettingsStore } from "../store/settingsStore";

export const SettingsPage = () => {
  const { settings, isLoading, load, setAutostart, update } =
    useSettingsStore();

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleUpdate = async (patch: Partial<typeof settings>) => {
    await update({ ...settings, ...patch });
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
        General
      </div>

      <div className="divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <div className="flex h-12 items-center justify-between px-4">
          <span className="text-sm text-[var(--color-text-primary)]">
            Start at boot
          </span>
          <Toggle
            checked={settings.autostart}
            onCheckedChange={(checked) => void setAutostart(Boolean(checked))}
            aria-label="Toggle start at boot"
            disabled={isLoading}
          />
        </div>
        <div className="flex h-12 items-center justify-between px-4">
          <span className="text-sm text-[var(--color-text-primary)]">
            Minimize to tray on close
          </span>
          <Toggle
            checked={settings.minimize_to_tray}
            onCheckedChange={(checked) =>
              void handleUpdate({ minimize_to_tray: Boolean(checked) })
            }
            aria-label="Toggle minimize to tray"
            disabled={isLoading}
          />
        </div>
        <div className="flex h-12 items-center justify-between px-4">
          <span className="text-sm text-[var(--color-text-primary)]">
            Show notifications
          </span>
          <Toggle
            checked={settings.show_notifications}
            onCheckedChange={(checked) =>
              void handleUpdate({ show_notifications: Boolean(checked) })
            }
            aria-label="Toggle notifications"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
