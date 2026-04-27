const { contextBridge, ipcRenderer } = require("electron");

// Phase 1 Step 1: expose a minimal, safe API surface.
contextBridge.exposeInMainWorld("quickBind", {
  appName: "QuickBind Beta",
  selectExecutable: () => ipcRenderer.invoke("quickbind:selectExecutable"),
  getShortcuts: () => ipcRenderer.invoke("quickbind:getShortcuts"),
  saveShortcuts: (shortcuts) =>
    ipcRenderer.invoke("quickbind:saveShortcuts", shortcuts),
  triggerShortcut: (shortcutId) =>
    ipcRenderer.invoke("quickbind:triggerShortcut", shortcutId),
  getStartupSettings: () => ipcRenderer.invoke("quickbind:getStartupSettings"),
  setStartupSettings: (settings) =>
    ipcRenderer.invoke("quickbind:setStartupSettings", settings),
});
