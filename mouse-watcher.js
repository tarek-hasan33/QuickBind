const { uIOhook } = require("uiohook-napi");

function getModifierParts(event) {
  const parts = [];

  if (event.ctrlKey) {
    parts.push("Ctrl");
  }
  if (event.altKey) {
    parts.push("Alt");
  }
  if (event.shiftKey) {
    parts.push("Shift");
  }
  if (event.metaKey) {
    parts.push("Win");
  }

  return parts;
}

function mouseButtonLabel(button) {
  if (button === 3) {
    return "Middle Click";
  }

  if (button === 4) {
    return "Mouse 4";
  }

  if (button === 5) {
    return "Mouse 5";
  }

  return null;
}

uIOhook.on("mousedown", (event) => {
  const mouseLabel = mouseButtonLabel(event.button);
  if (!mouseLabel) {
    return;
  }

  const parts = getModifierParts(event);
  parts.push(mouseLabel);
  process.stdout.write(`${parts.join("+")}\n`);
});

uIOhook.start();

const shutdown = () => {
  try {
    uIOhook.stop();
  } catch {
    // ignore shutdown errors
  }
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
