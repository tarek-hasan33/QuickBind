const { uIOhook, UiohookKey } = require("uiohook-napi");

const actionType = process.argv[2];

const actionMap = {
  copy: { key: UiohookKey.C, modifiers: [UiohookKey.Ctrl] },
  paste: { key: UiohookKey.V, modifiers: [UiohookKey.Ctrl] },
  cut: { key: UiohookKey.X, modifiers: [UiohookKey.Ctrl] },
  selectAll: { key: UiohookKey.A, modifiers: [UiohookKey.Ctrl] },
};

function run() {
  const action = actionMap[actionType];
  if (actionType === "screenshot") {
    try {
      const child = require("child_process").spawn(
        "explorer.exe",
        ["ms-screenclip:"],
        {
          detached: true,
          stdio: "ignore",
          windowsHide: true,
        }
      );

      child.unref();
      setTimeout(() => process.exit(0), 50);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
    return;
  }

  if (!action) {
    process.exit(1);
    return;
  }

  try {
    setTimeout(() => {
      uIOhook.keyTap(action.key, action.modifiers);
      setTimeout(() => process.exit(0), 50);
    }, 50);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
