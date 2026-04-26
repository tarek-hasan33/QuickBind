const path = require("path");
const fs = require("fs/promises");
const { spawn } = require("child_process");
const {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
} = require("electron");

const isDev = !app.isPackaged;

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
let isQuitting = false;
let currentShortcuts = [];
let mouseWatcherProcess = null;
const hasSingleInstanceLock = isDev ? true : app.requestSingleInstanceLock();
const shortcutsFilePath = () =>
  path.join(app.getPath("userData"), "shortcuts.json");

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

  mouseWatcherProcess = spawn("node", [scriptPath], {
    windowsHide: true,
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
    "node",
    [path.join(__dirname, "action-sender.js"), actionType],
    {
      detached: true,
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

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    title: "QuickBind",
    backgroundColor: "#f2efe9",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Keep the app alive for global shortcuts when the user closes the window.
  mainWindow.on("close", (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
    return;
  }

  mainWindow.loadFile(path.join(__dirname, "renderer", "dist", "index.html"));
}

app.whenReady().then(() => {
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

  readShortcuts()
    .then((shortcuts) => {
      registerGlobalShortcuts(shortcuts);
    })
    .catch(() => {
      registerGlobalShortcuts([]);
    });

  startGlobalMouseWatcher();

  createMainWindow();

  app.on("activate", () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
      return;
    }

    mainWindow.show();
    mainWindow.focus();
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

  if (mouseWatcherProcess && !mouseWatcherProcess.killed) {
    try {
      mouseWatcherProcess.kill();
    } catch {
      // ignore shutdown errors from the watcher process
    }
  }
});
