import { Fragment, useEffect, useMemo, useState } from "react";
import "./App.css";

const ACTION_OPEN_APP = "openApp";
const ACTION_COPY = "copy";
const ACTION_PASTE = "paste";
const ACTION_CUT = "cut";
const ACTION_SELECT_ALL = "selectAll";
const ACTION_SCREENSHOT = "screenshot";
const conflictShortcuts = {
  "CTRL+C": "Ctrl + C is a common Copy shortcut.",
  "CTRL+V": "Ctrl + V is a common Paste shortcut.",
  "CTRL+R": "Ctrl + R is reserved by the browser/Electron dev tools flow.",
  "CTRL+M": "Ctrl + M is reserved by the browser/Electron dev tools flow.",
  "ALT+TAB": "Alt + Tab is used by Windows task switching.",
  "WIN+D": "Win + D is used by Windows to show desktop.",
};

const systemShortcuts = [
  {
    shortcut: "Ctrl + C",
    description: "Copy selected content",
    category: "General",
  },
  {
    shortcut: "Ctrl + V",
    description: "Paste copied content",
    category: "General",
  },
  {
    shortcut: "Ctrl + X",
    description: "Cut selected content",
    category: "General",
  },
  {
    shortcut: "Ctrl + Z",
    description: "Undo last action",
    category: "General",
  },
  {
    shortcut: "Ctrl + Shift + Esc",
    description: "Open Task Manager",
    category: "System",
  },
  {
    shortcut: "Alt + Tab",
    description: "Switch between open apps",
    category: "System",
  },
  {
    shortcut: "Win + D",
    description: "Show desktop",
    category: "System",
  },
  {
    shortcut: "Win + L",
    description: "Lock the PC",
    category: "System",
  },
  {
    shortcut: "Win + E",
    description: "Open File Explorer",
    category: "File Explorer",
  },
  {
    shortcut: "Win + Shift + S",
    description: "Open screenshot/snipping overlay",
    category: "System",
  },
];

const mouseButtons = {
  1: "Middle Click",
  3: "Mouse 4",
  4: "Mouse 5",
};

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

function toTitleCaseKey(key) {
  if (key.length === 1) {
    return key.toUpperCase();
  }

  if (key === " ") {
    return "Space";
  }

  if (key.startsWith("Arrow")) {
    return key.replace("Arrow", "");
  }

  if (key === "Escape") {
    return "Esc";
  }

  return key[0].toUpperCase() + key.slice(1);
}

function formatMouseAccelerator(event) {
  const mousePart = mouseButtons[event.button];
  if (!mousePart) {
    return "";
  }

  const parts = getModifierParts(event);
  parts.push(mousePart);
  return parts.join(" + ");
}

function getKeyboardPart(event) {
  if (event.key === "Control") {
    return "Ctrl";
  }

  if (event.key === "Alt") {
    return "Alt";
  }

  if (event.key === "Shift") {
    return "Shift";
  }

  if (event.key === "Meta") {
    return "Win";
  }

  return toTitleCaseKey(event.key);
}

function getFileName(filePath) {
  if (!filePath) {
    return "";
  }

  const pieces = filePath.split(/[/\\]/);
  return pieces[pieces.length - 1] || filePath;
}

function actionLabel(shortcut) {
  if (shortcut.actionType === ACTION_OPEN_APP) {
    return `Open App: ${getFileName(shortcut.actionValue)}`;
  }

  if (shortcut.actionType === ACTION_COPY) {
    return "Copy";
  }

  if (shortcut.actionType === ACTION_PASTE) {
    return "Paste";
  }

  if (shortcut.actionType === ACTION_CUT) {
    return "Cut";
  }

  if (shortcut.actionType === ACTION_SELECT_ALL) {
    return "Select All";
  }

  if (shortcut.actionType === ACTION_SCREENSHOT) {
    return "Screenshot";
  }

  return "Unsupported action";
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

function normalizeAccelerator(value) {
  return value
    .split("+")
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean)
    .join("+");
}

function getConflictWarning(accelerator) {
  if (!accelerator) {
    return "";
  }

  const normalized = normalizeAccelerator(accelerator);
  return conflictShortcuts[normalized] ?? "";
}

function App() {
  const [shortcuts, setShortcuts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSystemShortcuts, setShowSystemShortcuts] = useState(false);
  const [systemSearch, setSystemSearch] = useState("");
  const [name, setName] = useState("");
  const [accelerator, setAccelerator] = useState("");
  const [recording, setRecording] = useState(false);
  const [actionType, setActionType] = useState(ACTION_OPEN_APP);
  const [actionValue, setActionValue] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadShortcuts = async () => {
      const loaded = (await window.quickBind?.getShortcuts?.()) ?? [];
      if (!mounted) {
        return;
      }

      setShortcuts(Array.isArray(loaded) ? loaded.filter(isValidShortcut) : []);
    };

    loadShortcuts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!recording) {
      return undefined;
    }

    const onKeyDown = (event) => {
      event.preventDefault();

      if (event.key === "Escape") {
        setRecording(false);
        return;
      }

      const nextPart = getKeyboardPart(event);
      if (!nextPart) {
        return;
      }

      setAccelerator((current) => {
        const parts = current ? current.split(" + ") : [];
        if (parts.includes(nextPart)) {
          return current;
        }

        return [...parts, nextPart].join(" + ");
      });
    };

    const onMouseDown = (event) => {
      const next = formatMouseAccelerator(event);
      if (!next) {
        return;
      }

      event.preventDefault();
      setAccelerator((current) => {
        const parts = current ? current.split(" + ") : [];
        if (parts.includes(next)) {
          return current;
        }

        return [...parts, next].join(" + ");
      });
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown, true);
    };
  }, [recording]);

  const canSave = useMemo(() => {
    if (actionType === ACTION_OPEN_APP) {
      return (
        name.trim().length > 0 &&
        accelerator.length > 0 &&
        actionValue.length > 0
      );
    }

    return (
      name.trim().length > 0 &&
      accelerator.length > 0 &&
      [
        ACTION_COPY,
        ACTION_PASTE,
        ACTION_CUT,
        ACTION_SELECT_ALL,
        ACTION_SCREENSHOT,
      ].includes(actionType)
    );
  }, [name, accelerator, actionType, actionValue]);

  const conflictWarning = useMemo(() => {
    return getConflictWarning(accelerator);
  }, [accelerator]);

  const filteredSystemShortcuts = useMemo(() => {
    const query = systemSearch.trim().toLowerCase();
    if (!query) {
      return systemShortcuts;
    }

    return systemShortcuts.filter((item) => {
      return (
        item.shortcut.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    });
  }, [systemSearch]);

  const groupedSystemShortcuts = useMemo(() => {
    return filteredSystemShortcuts.reduce((groups, item) => {
      const group = groups[item.category] ?? [];
      group.push(item);
      groups[item.category] = group;
      return groups;
    }, {});
  }, [filteredSystemShortcuts]);

  const groupedSystemShortcutEntries = useMemo(() => {
    return Object.entries(groupedSystemShortcuts);
  }, [groupedSystemShortcuts]);

  const onAddShortcutClick = () => {
    setShowForm((value) => !value);
    setRecording(false);
  };

  const onToggleSystemShortcuts = () => {
    setShowSystemShortcuts((value) => !value);
  };

  const resetForm = () => {
    setName("");
    setAccelerator("");
    setRecording(false);
    setActionType(ACTION_OPEN_APP);
    setActionValue("");
  };

  const onSelectApp = async () => {
    const selectedPath = await window.quickBind?.selectExecutable?.();
    if (selectedPath) {
      setActionValue(selectedPath);
    }
  };

  const onSave = async () => {
    if (!canSave) {
      return;
    }

    const nextShortcut = {
      id: crypto.randomUUID(),
      name: name.trim(),
      accelerator: accelerator.trim(),
      actionType,
      actionValue: actionValue.trim(),
      enabled: true,
    };

    const updatedShortcuts = [...shortcuts, nextShortcut];
    setShortcuts(updatedShortcuts);
    await window.quickBind?.saveShortcuts?.(updatedShortcuts);
    resetForm();
    setShowForm(false);
  };

  const toggleShortcut = async (shortcutId) => {
    const updatedShortcuts = shortcuts.map((shortcut) => {
      if (shortcut.id !== shortcutId) {
        return shortcut;
      }

      return {
        ...shortcut,
        enabled: !shortcut.enabled,
      };
    });

    setShortcuts(updatedShortcuts);
    await window.quickBind?.saveShortcuts?.(updatedShortcuts);
  };

  const deleteShortcut = async (shortcutId) => {
    const updatedShortcuts = shortcuts.filter(
      (shortcut) => shortcut.id !== shortcutId
    );
    setShortcuts(updatedShortcuts);
    await window.quickBind?.saveShortcuts?.(updatedShortcuts);
  };

  return (
    <main className="app-shell">
      <header className="header-row">
        <div className="header-copy">
          <p className="eyebrow">QuickBind</p>
          <h1>QuickBind</h1>
          <p className="subtitle">Keyboard shortcut manager for Windows</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={onToggleSystemShortcuts}
          >
            View System Shortcuts
          </button>
          <button
            type="button"
            className="add-button"
            onClick={onAddShortcutClick}
          >
            Add Shortcut
          </button>
        </div>
      </header>

      {showSystemShortcuts && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowSystemShortcuts(false);
            }
          }}
        >
          <section
            className="modal-card system-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="system-shortcuts-title"
          >
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Reference</p>
                <h2 id="system-shortcuts-title">System Shortcuts</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowSystemShortcuts(false)}
                aria-label="Close system shortcuts"
              >
                ×
              </button>
            </div>

            <label className="search-field">
              <span>Search shortcuts</span>
              <input
                type="search"
                value={systemSearch}
                onChange={(event) => setSystemSearch(event.target.value)}
                placeholder="Search by shortcut, description, or category"
              />
            </label>

            <div className="table-shell">
              <table className="system-table">
                <thead>
                  <tr>
                    <th>Shortcut</th>
                    <th>Description</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedSystemShortcutEntries.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="empty-row">
                        No shortcuts found.
                      </td>
                    </tr>
                  ) : (
                    groupedSystemShortcutEntries.map(([category, items]) => (
                      <Fragment key={category}>
                        <tr className="category-row">
                          <td colSpan="3">{category}</td>
                        </tr>
                        {items.map((item) => (
                          <tr key={`${category}-${item.shortcut}`}>
                            <td className="shortcut-cell">{item.shortcut}</td>
                            <td>{item.description}</td>
                            <td>
                              <span className="category-pill">
                                {item.category}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {showForm && (
        <section className="modal-overlay" aria-label="Add shortcut form">
          <div className="modal-card form-panel">
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Create shortcut</p>
                <h2>Add Shortcut</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                aria-label="Close add shortcut form"
              >
                ×
              </button>
            </div>

            <label className="field">
              <span>Shortcut Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Example: Open Notepad"
              />
            </label>

            <div className="field-row">
              <div className="field field-grow">
                <span>Key Combination</span>
                <div className="record-row">
                  <button
                    type="button"
                    className={
                      recording ? "record-button is-recording" : "record-button"
                    }
                    onClick={() => {
                      setRecording((value) => {
                        if (!value) {
                          setAccelerator("");
                        }

                        return !value;
                      });
                    }}
                  >
                    {recording
                      ? "Recording... click again to stop"
                      : "Record Shortcut"}
                  </button>
                  <p className="accelerator-preview">
                    {accelerator || "Not recorded"}
                  </p>
                </div>
                {conflictWarning && (
                  <p className="conflict-warning">Warning: {conflictWarning}</p>
                )}
              </div>
            </div>

            <div className="field-row">
              <label className="field field-grow">
                <span>Action Type</span>
                <select
                  value={actionType}
                  onChange={(event) => {
                    const nextType = event.target.value;
                    setActionType(nextType);

                    if (nextType !== ACTION_OPEN_APP) {
                      setActionValue("");
                    }
                  }}
                >
                  <option value="openApp">Open App</option>
                  <option value="copy">Copy</option>
                  <option value="paste">Paste</option>
                  <option value="cut">Cut</option>
                  <option value="selectAll">Select All</option>
                  <option value="screenshot">Screenshot</option>
                </select>
              </label>

              {actionType === ACTION_OPEN_APP && (
                <div className="field field-grow">
                  <span>Selected App</span>
                  <div className="record-row">
                    <button
                      type="button"
                      className="select-button"
                      onClick={onSelectApp}
                    >
                      Select App
                    </button>
                    <p className="file-preview">
                      {actionValue || "No app selected"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="save-button"
                onClick={onSave}
                disabled={!canSave}
              >
                Save
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="content-grid">
        <section className="panel shortcut-panel" aria-label="Shortcut list">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">Saved shortcuts</p>
              <h2>My Shortcuts</h2>
            </div>
          </div>

          <div className="list-panel">
            {shortcuts.length === 0 && (
              <p className="empty-state">
                No shortcuts yet. Click &quot;Add Shortcut&quot; to create one.
              </p>
            )}

            {shortcuts.map((shortcut) => (
              <article className="shortcut-card" key={shortcut.id}>
                <div className="shortcut-meta">
                  <div className="shortcut-topline">
                    <h3>{shortcut.name}</h3>
                    <span className={shortcut.enabled ? "status on" : "status"}>
                      {shortcut.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <p className="accelerator">{shortcut.accelerator}</p>
                  <p className="action">{actionLabel(shortcut)}</p>
                </div>
                <div className="shortcut-actions">
                  <button
                    type="button"
                    className="toggle-button"
                    onClick={() => toggleShortcut(shortcut.id)}
                  >
                    {shortcut.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteShortcut(shortcut.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
