const path = require("path");
const fs = require("fs/promises");
const { spawn } = require("child_process");
const {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  Tray,
} = require("electron");

const isDev = !app.isPackaged;
const APP_DISPLAY_NAME = "QuickBind Beta";
const APP_USER_MODEL_ID = "com.quickbind.beta";
const BACKGROUND_LAUNCH_ARG = "--background";
const isBackgroundLaunch = process.argv.includes(BACKGROUND_LAUNCH_ARG);

app.setName(APP_DISPLAY_NAME);
app.setAppUserModelId(APP_USER_MODEL_ID);
process.title = APP_DISPLAY_NAME;

if (isDev) {
  // Keep dev runtime data separate from installed app data.
  const devUserDataPath = path.join(app.getPath("appData"), "QuickBind-dev");
  app.setPath("userData", devUserDataPath);
  app.setPath("sessionData", path.join(devUserDataPath, "session"));
}

const ACTION_OPEN_APP = "openApp";
const ACTION_COPY = "copy";
const ACTION_PASTE = "paste";
const ACTION_CUT = "cut";
const ACTION_SELECT_ALL = "selectAll";
const ACTION_SCREENSHOT = "screenshot";
let mainWindow = null;
let tray = null;
let isQuitting = false;
let currentShortcuts = [];
let mouseWatcherProcess = null;
const hasSingleInstanceLock = isDev ? true : app.requestSingleInstanceLock();
const shortcutsFilePath = () =>
  path.join(app.getPath("userData"), "shortcuts.json");
const appSettingsFilePath = () =>
  path.join(app.getPath("userData"), "app-settings.json");

if (!isDev && !hasSingleInstanceLock) {
  app.quit();
}

if (!isDev) {
  app.on("second-instance", () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
      return;
    }

    mainWindow.show();
    mainWindow.focus();
  });
}

async function ensureShortcutsFile() {
  const filePath = shortcutsFilePath();

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]", "utf8");
  }
}

function isValidShortcut(item) {
  return (
    typeof item?.id === "string" &&
    typeof item?.name === "string" &&
    typeof item?.accelerator === "string" &&
    typeof item?.actionType === "string" &&
    typeof item?.actionValue === "string" &&
    typeof item?.enabled === "boolean"
  );
}

async function readShortcuts() {
  await ensureShortcutsFile();
  const raw = await fs.readFile(shortcutsFilePath(), "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isValidShortcut);
}

async function writeShortcuts(shortcuts) {
  const sanitized = Array.isArray(shortcuts)
    ? shortcuts.filter(isValidShortcut)
    : [];

  await fs.writeFile(
    shortcutsFilePath(),
    JSON.stringify(sanitized, null, 2),
    "utf8"
  );
  return sanitized;
}

function toElectronAccelerator(accelerator) {
  if (typeof accelerator !== "string") {
    return null;
  }

  const parts = accelerator
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  const mapped = parts.map((part) => {
    const lower = part.toLowerCase();

    if (lower === "ctrl") {
      return "Control";
    }
    if (lower === "alt") {
      return "Alt";
    }
    if (lower === "shift") {
      return "Shift";
    }
    if (lower === "win") {
      return "Super";
    }
    if (lower === "esc") {
      return "Escape";
    }
    if (lower === "space") {
      return "Space";
    }

    return part;
  });

  return mapped.join("+");
}

function normalizeAcceleratorValue(value) {
  return String(value || "")
    .split("+")
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean)
    .join("+");
}

function triggerMatchingShortcutByAccelerator(candidate) {
  for (const shortcut of currentShortcuts) {
    if (!shortcut.enabled) {
      continue;
    }

    if (normalizeAcceleratorValue(shortcut.accelerator) !== candidate) {
      continue;
    }

    executeShortcut(shortcut);
    return;
  }
}

function startGlobalMouseWatcher() {
  if (mouseWatcherProcess) {
    return;
  }

  const scriptPath = path.join(__dirname, "mouse-watcher.js");

  mouseWatcherProcess = spawn(process.execPath, [scriptPath], {
    windowsHide: true,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let buffered = "";
  mouseWatcherProcess.stdout.on("data", (chunk) => {
    buffered += chunk.toString();
    const lines = buffered.split(/\r?\n/);
    buffered = lines.pop() ?? "";

    for (const line of lines) {
      const candidate = normalizeAcceleratorValue(line);
      if (!candidate) {
        continue;
      }

      triggerMatchingShortcutByAccelerator(candidate);
    }
  });

  mouseWatcherProcess.on("exit", () => {
    mouseWatcherProcess = null;
  });

  mouseWatcherProcess.on("error", () => {
    mouseWatcherProcess = null;
  });
}

function executeShortcut(shortcut) {
  try {
    if (shortcut.actionType === ACTION_OPEN_APP && shortcut.actionValue) {
      const child = spawn(shortcut.actionValue, [], {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      });
      child.unref();
      return;
    }

    if (shortcut.actionType === ACTION_COPY) {
      sendShortcutKeys("copy");
      return;
    }

    if (shortcut.actionType === ACTION_PASTE) {
      sendShortcutKeys("paste");
      return;
    }

    if (shortcut.actionType === ACTION_CUT) {
      sendShortcutKeys("cut");
      return;
    }

    if (shortcut.actionType === ACTION_SELECT_ALL) {
      sendShortcutKeys("selectAll");
      return;
    }

    if (shortcut.actionType === ACTION_SCREENSHOT) {
      // Windows snipping overlay shortcut.
      sendShortcutKeys("screenshot");
      return;
    }
  } catch (error) {
    console.error(
      `Failed to execute action for shortcut ${shortcut.id}`,
      error
    );
  }
}

function sendKeys(keys) {
  const escaped = String(keys).replace(/'/g, "''");
  const script = `$ws = New-Object -ComObject WScript.Shell; Start-Sleep -Milliseconds 30; $ws.SendKeys('${escaped}')`;

  const child = spawn(
    "powershell",
    [
      "-NoProfile",
      "-NonInteractive",
      "-WindowStyle",
      "Hidden",
      "-Command",
      script,
    ],
    {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    }
  );

  child.unref();
}

function sendShortcutKeys(actionType) {
  const child = spawn(
    process.execPath,
    [path.join(__dirname, "action-sender.js"), actionType],
    {
      detached: true,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
      },
      stdio: "ignore",
      windowsHide: true,
    }
  );

  child.unref();
}

function registerGlobalShortcuts(shortcuts) {
  currentShortcuts = Array.isArray(shortcuts) ? shortcuts : [];
  globalShortcut.unregisterAll();

  for (const shortcut of shortcuts) {
    if (!shortcut.enabled) {
      continue;
    }

    const normalized = String(shortcut.accelerator || "").toLowerCase();
    if (
      normalized.includes("middle click") ||
      normalized.includes("mouse 4") ||
      normalized.includes("mouse 5")
    ) {
      continue;
    }

    const electronAccelerator = toElectronAccelerator(shortcut.accelerator);
    if (!electronAccelerator) {
      continue;
    }

    const ok = globalShortcut.register(electronAccelerator, () => {
      executeShortcut(shortcut);
    });

    if (!ok) {
      console.warn(`Shortcut registration failed: ${shortcut.accelerator}`);
    }
  }
}

function getIconPath() {
  return path.join(__dirname, "assets", "icon.ico");
}

async function readAppSettings() {
  try {
    const raw = await fs.readFile(appSettingsFilePath(), "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    // ignore missing/invalid settings file and use defaults
  }

  return {};
}

async function writeAppSettings(settings) {
  const safeSettings = settings && typeof settings === "object" ? settings : {};
  await fs.writeFile(
    appSettingsFilePath(),
    JSON.stringify(safeSettings, null, 2),
    "utf8"
  );
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
    return;
  }

  mainWindow.setSkipTaskbar(false);
  mainWindow.show();
  mainWindow.focus();
}

function hideToTray() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.hide();
  mainWindow.setSkipTaskbar(true);
}

function createTray() {
  if (tray) {
    return;
  }

  tray = new Tray(getIconPath());
  tray.setToolTip(APP_DISPLAY_NAME);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open App",
      click: () => {
        showMainWindow();
      },
    },
    {
      type: "separator",
    },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    showMainWindow();
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    title: APP_DISPLAY_NAME,
    icon: getIconPath(),
    show: !(isBackgroundLaunch && !isDev),
    backgroundColor: "#f2efe9",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Keep the app alive for global shortcuts when the user closes the window.
  mainWindow.on("close", (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    hideToTray();
  });

  mainWindow.on("minimize", (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    hideToTray();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (isBackgroundLaunch && !isDev) {
    mainWindow.setSkipTaskbar(true);
  }

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
    return;
  }

  mainWindow.loadFile(path.join(__dirname, "renderer", "dist", "index.html"));
}

function getStartupSettings() {
  const loginSettings = app.getLoginItemSettings({
    path: process.execPath,
    args: [BACKGROUND_LAUNCH_ARG],
  });
  return {
    openAtLogin: Boolean(loginSettings.openAtLogin),
  };
}

function setStartupSettings(openAtLogin) {
  const shouldOpenAtLogin = Boolean(openAtLogin);

  app.setLoginItemSettings({
    openAtLogin: shouldOpenAtLogin,
    openAsHidden: true,
    path: process.execPath,
    args: [BACKGROUND_LAUNCH_ARG],
  });

  return getStartupSettings();
}

async function ensureBackgroundShortcutsStartupOnFirstRun() {
  if (isDev) {
    return;
  }

  const settings = await readAppSettings();
  if (settings.startupConfigured) {
    return;
  }

  setStartupSettings(true);
  await writeAppSettings({
    ...settings,
    startupConfigured: true,
  });
}

app.whenReady().then(async () => {
  ipcMain.handle("quickbind:getShortcuts", async () => {
    try {
      const shortcuts = await readShortcuts();
      registerGlobalShortcuts(shortcuts);
      return shortcuts;
    } catch {
      return [];
    }
  });

  ipcMain.handle("quickbind:saveShortcuts", async (_event, shortcuts) => {
    try {
      const saved = await writeShortcuts(shortcuts);
      registerGlobalShortcuts(saved);
      return saved;
    } catch {
      return [];
    }
  });

  ipcMain.handle("quickbind:triggerShortcut", async (_event, shortcutId) => {
    const shortcut = currentShortcuts.find((item) => item.id === shortcutId);
    if (!shortcut || !shortcut.enabled) {
      return false;
    }

    executeShortcut(shortcut);
    return true;
  });

  ipcMain.handle("quickbind:selectExecutable", async () => {
    const result = await dialog.showOpenDialog({
      title: "Select Application",
      properties: ["openFile"],
      filters: [{ name: "Applications", extensions: ["exe"] }],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  ipcMain.handle("quickbind:getStartupSettings", () => {
    return getStartupSettings();
  });

  ipcMain.handle("quickbind:setStartupSettings", (_event, settings) => {
    return setStartupSettings(settings?.openAtLogin);
  });

  await ensureBackgroundShortcutsStartupOnFirstRun();

  readShortcuts()
    .then((shortcuts) => {
      registerGlobalShortcuts(shortcuts);
    })
    .catch(() => {
      registerGlobalShortcuts([]);
    });

  startGlobalMouseWatcher();

  createTray();
  createMainWindow();

  app.on("activate", () => {
    showMainWindow();
  });
});

app.on("window-all-closed", () => {
  // Intentionally no-op: app keeps running in background for global shortcuts.
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();

  if (tray) {
    tray.destroy();
    tray = null;
  }

  if (mouseWatcherProcess && !mouseWatcherProcess.killed) {
    try {
      mouseWatcherProcess.kill();
    } catch {
      // ignore shutdown errors from the watcher process
    }
  }
});
