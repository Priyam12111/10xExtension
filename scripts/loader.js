// scripts/loaderUI.js
(function initGlobalLoaderUI() {
  // Prevent double init if script injected multiple times
  if (window.LoaderUI) return;

  function ensureStyles() {
    if (document.getElementById("sheet-loader-style")) return;

    const style = document.createElement("style");
    style.id = "sheet-loader-style";
    style.textContent = `
      .sheet-loader-inline{
        width:14px;height:14px;
        border:2px solid rgba(0,0,0,0.2);
        border-top-color: rgba(0,0,0,0.7);
        border-radius:50%;
        display:inline-block;
        animation: sheetSpin 0.7s linear infinite;
        vertical-align: middle;
      }
      @keyframes sheetSpin { to { transform: rotate(360deg); } }

      .sheet-button.loading{
        pointer-events:none;
        opacity:0.75;
      }

      .sheet-list-loading{
        display:flex;
        align-items:center;
        gap:8px;
        padding:10px 12px;
        font-size:14px;
        color:#444;
        border-bottom:1px solid #eee;
      }
    `;
    document.head.appendChild(style);
  }

  function button(btn, isLoading, idleText = "Loading") {
    if (!btn) return;
    ensureStyles();

    if (!btn.dataset.originalHtml) {
      btn.dataset.originalHtml = btn.innerHTML || idleText;
    }

    if (isLoading) {
      btn.classList.add("loading");
      btn.innerHTML = `<span class="sheet-loader-inline" aria-label="Loading"></span>`;
    } else {
      btn.classList.remove("loading");
      btn.innerHTML = btn.dataset.originalHtml;
    }
  }

  function container(containerEl, isLoading, text = "Loading...") {
    if (!containerEl) return;
    ensureStyles();

    // keep loader as first child of container
    let loader = containerEl.querySelector(":scope > .sheet-list-loading");
    if (!loader) {
      loader = document.createElement("div");
      loader.className = "sheet-list-loading";
      loader.innerHTML = `
        <span class="sheet-loader-inline" aria-label="Loading"></span>
        <span class="sheet-list-loading-text"></span>
      `;
      containerEl.prepend(loader);
    }

    loader.querySelector(".sheet-list-loading-text").textContent = text;
    loader.style.display = isLoading ? "flex" : "none";
  }

  async function withContainer(containerEl, text, fn) {
    try {
      container(containerEl, true, text);
      return await fn();
    } finally {
      container(containerEl, false);
    }
  }

  // Expose globally to ALL content scripts
  window.LoaderUI = { ensureStyles, button, container, withContainer };
})();
