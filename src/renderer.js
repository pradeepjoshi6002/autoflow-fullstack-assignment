import "./index.css";

const backButton = document.querySelector(".back-url-btn");
const forwardButton = document.querySelector(".forward-url-btn");
const reloadButton = document.querySelector(".reload-url-btn");

const hideWindowButton = document.querySelector(".hide-browser-btn");
const maximizeWindowButton = document.querySelector(".maximize-browser-btn");
const closeWindowButton = document.querySelector(".close-browser-btn");

const addBtn = document.querySelector(".add-tab-btn");
const tabList = document.querySelector(".all-tabs");
const searchBox = document.querySelector(".search-box");
const colorpickerButton = document.querySelector(".colorpicker-btn");
const colorpicker = document.querySelector(".colorpicker");
const mainContainer = document.querySelector(".main-container");
const body = document.body;

let activeTabId = null;
const tabs = new Map();

function createTab(url = "https://www.google.com") {
  const tabId = Date.now();

  const tabButton = document.createElement("div");
  tabButton.className = "tab";
  tabButton.textContent = "New Tab";
  tabButton.dataset.tabId = tabId;
  tabButton.addEventListener("click", () => switchTab(tabId));

  const closeButton = document.createElement("span");
  closeButton.textContent = "×";
  closeButton.style.marginLeft = "10px";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });
  tabButton.appendChild(closeButton);

  tabList.appendChild(tabButton);

  const webview = document.createElement("webview");
  webview.className = "webview";
  webview.setAttribute("src", url);
  webview.style.display = "none";
  webview.setAttribute("allowpopups", "true");

  const loader = document.getElementById("loader");

  webview.addEventListener("did-start-loading", () => {
    loader.style.display = "block";
  });

  webview.addEventListener("did-stop-loading", () => {
    loader.style.display = "none";
  });

  mainContainer.appendChild(webview);

  tabs.set(tabId, { tabButton, webview });
  switchTab(tabId);
  searchBox.value = "";
}

function switchTab(tabId) {
  if (activeTabId === tabId) return;

  if (tabs.has(activeTabId)) {
    const { webview, tabButton } = tabs.get(activeTabId);
    webview.style.display = "none";
    tabButton.classList.remove("active");
  }

  activeTabId = tabId;
  const { tabButton, webview } = tabs.get(tabId);
  tabButton.classList.add("active");
  webview.style.display = "flex";
  webview.style.height = "100%";

  searchBox.value = webview.getURL() || "";
}

function closeTab(tabId) {
  if (!tabs.has(tabId)) return;

  const { tabButton, webview } = tabs.get(tabId);

  tabButton.remove();
  webview.remove();

  tabs.delete(tabId);

  if (tabs.size === 0) {
    window.electronAPI.controlWindow("close");
    return;
  }

  if (activeTabId === tabId) {
    if (tabs.size > 0) {
      const nextTabId = Array.from(tabs.keys())[0];
      switchTab(nextTabId);
    } else {
      activeTabId = null;
    }
  }
}

addBtn.addEventListener("click", () => createTab());

searchBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const activeTab = tabs.get(activeTabId);
    if (activeTab) {
      try {
        let url = searchBox.value.trim();
        if (!/^https?:\/\//i.test(url)) {
          url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        }

        activeTab.webview.setAttribute("src", url);
        searchBox.value = url;
      } catch (err) {
        console.error(err.message);
      }
    }
  }
});

backButton.addEventListener("click", async () => {
  const activeTab = tabs.get(activeTabId);
  if (activeTab) {
    const { webview } = activeTab;
    if (await webview.canGoBack()) {
      webview.goBack();
    }
  }
});

forwardButton.addEventListener("click", async () => {
  const activeTab = tabs.get(activeTabId);
  if (activeTab) {
    const { webview } = activeTab;
    if (await webview.canGoForward()) {
      webview.goForward();
    }
  }
});

reloadButton.addEventListener("click", () => {
  const activeTab = tabs.get(activeTabId);
  if (activeTab) {
    const { webview } = activeTab;
    webview.reload();
  }
});

colorpickerButton.addEventListener("click", () => {
  colorpicker.click();
});

colorpicker.addEventListener("input", () => {
  body.style.backgroundColor = colorpicker.value;
});

hideWindowButton.addEventListener("click", () => {
  window.electronAPI.controlWindow("minimize");
});

maximizeWindowButton.addEventListener("click", () => {
  window.electronAPI.controlWindow("maximize");
});

closeWindowButton.addEventListener("click", () => {
  window.electronAPI.controlWindow("close");
});

createTab();
