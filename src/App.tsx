import { useEffect, useState } from "react";

import { AppShell, type AppPage, Sidebar } from "./components/layout";
import { Toggle } from "./components/ui/Toggle";
import { SettingsPage, ShortcutsPage } from "./pages";
import { useSettingsStore } from "./store/settingsStore";
import { useShortcutsStore } from "./store/shortcutsStore";

const App = () => {
  const [page, setPage] = useState<AppPage>("shortcuts");
  const {
    settings,
    isLoading: settingsLoading,
    load: loadSettings,
    setAutostart,
  } = useSettingsStore();
  const { load: loadShortcuts } = useShortcutsStore();

  useEffect(() => {
    void loadShortcuts();
    void loadSettings();
  }, [loadShortcuts, loadSettings]);

  return (
    <AppShell
      sidebar={
        <Sidebar
          currentPage={page}
          onPageChange={setPage}
          autostartToggle={
            <Toggle
              checked={settings.autostart}
              onCheckedChange={(checked) => void setAutostart(Boolean(checked))}
              aria-label="Toggle start at boot"
              disabled={settingsLoading}
            />
          }
        />
      }
    >
      {page === "shortcuts" ? <ShortcutsPage /> : <SettingsPage />}
    </AppShell>
  );
};

export default App;
