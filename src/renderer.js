import "./index.css";

const backButton = document.querySelector(".back-url-btn");
const forwardButton = document.querySelector(".forward-url-btn");
const reloadButton = document.querySelector(".reload-url-btn");
const addBtn = document.querySelector(".add-tab-btn");
const tabList = document.querySelector(".all-tabs");
const searchBox = document.querySelector(".search-box");
const mainContainer = document.querySelector(".main-container");

let activeTabId = null;
const tabs = new Map();

function createTab(url = "https://www.google.com") {
  const tabId = Date.now();

  const tabButton = document.createElement("div");
  tabButton.className = "tab";
  tabButton.textContent = "Tab-" + (tabList.childElementCount + 1);
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

  mainContainer.appendChild(webview);

  tabs.set(tabId, { tabButton, webview });
  switchTab(tabId);
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
}

function closeTab(tabId) {
  if (!tabs.has(tabId)) return;

  const { tabButton, webview } = tabs.get(tabId);

  tabButton.remove();
  webview.remove();

  tabs.delete(tabId);

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
      activeTab.webview.setAttribute("src", searchBox.value);
    }
  }
});

backButton.addEventListener("click", () => {
  const activeTab = tabs.get(activeTabId);
  if (activeTab) {
    const { webview } = activeTab;
    if (webview.canGoBack()) {
      webview.goBack();
    }
  }
});

forwardButton.addEventListener("click", () => {
  const activeTab = tabs.get(activeTabId);
  if (activeTab) {
    const { webview } = activeTab;
    if (webview.canGoForward()) {
      webview.goForward();
    }
  }
});

// reloadButton.addEventListener("click", () => {
//   const activeTab = tabs.get(activeTabId);
//   if (activeTab) {
//     const { webview } = activeTab;
//     webview.reload();
//   }
// });
createTab();
