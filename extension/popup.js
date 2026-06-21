const APP_URL = "https://tab-mind.vercel.app";
// const APP_URL = "http://localhost:3000";

// ---- State ----
let currentTabs = [];
let isLoggedIn = false;
let userEmail = "";
let isSaving = false;

// ---- Init ----
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
});

// ---- Auth ----
async function checkAuth() {
  try {
    const res = await fetch(`${APP_URL}/api/extension/me`, {
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      isLoggedIn = true;
      userEmail = data.email;
      await loadTabs();
      renderLoggedIn();
    } else {
      isLoggedIn = false;
      renderLoggedOut();
    }
  } catch {
    isLoggedIn = false;
    renderLoggedOut();
  }
}

// ---- Load open tabs ----
async function loadTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  // Filter out chrome:// and extension pages
  currentTabs = tabs.filter(
    (t) =>
      t.url &&
      !t.url.startsWith("chrome://") &&
      !t.url.startsWith("chrome-extension://") &&
      !t.url.startsWith("about:") &&
      !t.url.startsWith("edge://"),
  );
}

// ---- Save all tabs ----
async function saveAllTabs() {
  if (isSaving) return;
  isSaving = true;

  const saveBtn = document.getElementById("save-btn");
  const progressWrap = document.getElementById("progress-wrap");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");

  saveBtn.disabled = true;
  progressWrap.classList.add("visible");

  let done = 0;

  for (const tab of currentTabs) {
    // Update status to saving
    const statusEl = document.getElementById(`status-${tab.id}`);
    if (statusEl) {
      statusEl.className = "tab-status status-saving";
      statusEl.innerHTML = '<div class="spinner"></div>';
    }

    try {
      const res = await fetch(`${APP_URL}/api/ai/summarise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url: tab.url }),
      });

      const data = await res.json();

      if (statusEl) {
        if (res.status === 429) {
          statusEl.className = "tab-status status-error";
          statusEl.textContent = "✕";
          statusEl.title = data.error;

          if (progressText) {
            progressText.textContent = `⏳ Rate limited. Retry in ${data.retryAfter}s`;
            progressText.style.color = "#f59e0b";
          }
          break;
        } else if (data.duplicate) {
          statusEl.className = "tab-status status-duplicate";
          statusEl.textContent = "~";
          statusEl.title = "Already saved";
        } else if (res.ok) {
          statusEl.className = "tab-status status-done";
          statusEl.textContent = "✓";
        } else {
          statusEl.className = "tab-status status-error";
          statusEl.textContent = "✕";
        }
      }
    } catch {
      if (statusEl) {
        statusEl.className = "tab-status status-error";
        statusEl.textContent = "✕";
      }
    }

    done++;
    const pct = Math.round((done / currentTabs.length) * 100);
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `${done} / ${currentTabs.length} tabs`;
  }

  // Done
  saveBtn.textContent = "✓ Saved";
  saveBtn.style.background = "#16a34a";
  isSaving = false;

  // Reset after 2s
  setTimeout(() => {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save all tabs";
    saveBtn.style.background = "";
    progressWrap.classList.remove("visible");
    progressFill.style.width = "0%";
  }, 2000);
}

// ---- Render ----
function renderLoggedOut() {
  document.getElementById("app").innerHTML = `
    <div class="header">
      <div class="logo">
        <span class="logo-icon">🔗</span>
        <span class="logo-text">TabMind</span>
      </div>
    </div>
    <div class="auth-screen">
      <div class="title">Sign in to save tabs</div>
      <div class="sub">Open the TabMind app and sign in with Google, then come back here.</div>
      <button class="open-app-btn" id="open-app-btn">Open TabMind →</button>
    </div>
  `;
  document.getElementById("open-app-btn").addEventListener("click", () => {
    chrome.tabs.create({ url: `${APP_URL}/signin` });
  });
}

function renderLoggedIn() {
  document.getElementById("app").innerHTML = `
    <div class="header">
      <div class="logo">
        <span class="logo-icon">🔗</span>
        <span class="logo-text">TabMind</span>
      </div>
      <div class="user-info">
        <span class="user-email">${userEmail}</span>
        <button class="sign-out-btn" id="sign-out-btn">Sign out</button>
      </div>
    </div>

    <div class="tabs-header">
      <span class="tabs-count">${currentTabs.length} open tab${currentTabs.length !== 1 ? "s" : ""}</span>
      <button class="save-btn" id="save-btn">
        Save all tabs
      </button>
    </div>

    <div class="progress-bar-wrap" id="progress-wrap">
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" id="progress-fill"></div>
      </div>
      <div class="progress-text" id="progress-text"></div>
    </div>

    <div class="tab-list" id="tab-list">
      ${currentTabs
        .map(
          (tab) => `
        <div class="tab-item">
          <div class="tab-favicon">
            ${
              tab.favIconUrl
                ? `<img src="${tab.favIconUrl}" alt="" onerror="this.style.display='none'" />`
                : "🌐"
            }
          </div>
          <div class="tab-info">
            <div class="tab-title">${escapeHtml(tab.title ?? tab.url ?? "")}</div>
            <div class="tab-url">${escapeHtml(getHostname(tab.url ?? ""))}</div>
          </div>
          <div class="tab-status status-pending" id="status-${tab.id}">·</div>
        </div>
      `,
        )
        .join("")}
    </div>

    <div class="footer">
      <a href="#" class="open-dashboard" id="open-dashboard">
        Open dashboard →
      </a>
    </div>
  `;

  document.getElementById("save-btn").addEventListener("click", saveAllTabs);
  document
    .getElementById("sign-out-btn")
    .addEventListener("click", handleSignOut);
  document.getElementById("open-dashboard").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${APP_URL}/dashboard` });
  });
}

async function handleSignOut() {
  await fetch(`${APP_URL}/api/extension/signout`, {
    method: "POST",
    credentials: "include",
  });
  isLoggedIn = false;
  userEmail = "";
  renderLoggedOut();
}

// ---- Helpers ----
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
