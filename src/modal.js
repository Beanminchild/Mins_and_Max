// Reusable modal system — one backdrop + one modal element reused by all callers.
let backdropEl = null;
let modalEl = null;
let onCloseCb = null;
let isOpen = false;

export function isModalOpen() {
  return isOpen;
}

export function showModal({ title, bodyHtml, buttons = [], variant = "" }) {
  if (!backdropEl) {
    backdropEl = document.createElement("div");
    backdropEl.className = "modal-backdrop hidden";
    modalEl = document.createElement("div");
    modalEl.className = "game-modal";
    backdropEl.appendChild(modalEl);
    document.body.appendChild(backdropEl);

    // Outside-click closes (replaces per-modal listeners)
    backdropEl.addEventListener("click", (e) => {
      if (e.target === backdropEl) closeModal();
    });
  }

  modalEl.className = "game-modal" + (variant ? ` ${variant}` : "");
  modalEl.innerHTML = `<h3>${title}</h3>${bodyHtml}<div class="modal-actions"></div>`;

  const actions = modalEl.querySelector(".modal-actions");
  buttons.forEach((b) => {
    const btn = document.createElement("button");
    btn.textContent = b.label;
    btn.className = "modal-btn " + (b.className || "");
    btn.onclick = () => {
      closeModal();
      if (b.onClick) b.onClick();
      
    };
    actions.appendChild(btn);
  });

  backdropEl.classList.remove("hidden");
  isOpen = true;
}

export function closeModal() {
  if (!backdropEl || !isOpen) return;
  backdropEl.classList.add("hidden");
  isOpen = false;
  if (onCloseCb) {
    onCloseCb();
    onCloseCb = null;
  }
}