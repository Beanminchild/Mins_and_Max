export function setupInput(keys = new Set(), onToolSelect, onEscape) {
  window.addEventListener("keydown", (event) => {
    const key = event.code || event.key;
    if (key.startsWith("Arrow") || key.startsWith("Key") || key.startsWith("Digit") || key === "Space") {
      event.preventDefault();
      keys.add(key);
    }
    if (key === "Escape") onEscape && onEscape();
    if (key.startsWith("Digit")) onToolSelect && onToolSelect(key);
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code || event.key);
  });

  return keys;
}