let activeTab = null;
let timeSpent = {};
let lastUpdate = Date.now();


chrome.storage.sync.get(['trackedWebsites', 'timeLimits', 'timeSpent'], (data) => {
  timeSpent = data.timeSpent || {};
  chrome.storage.sync.set({ timeSpent });
});


chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    activeTab = tab;
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    activeTab = tab;
  }
});

setInterval(() => {
  chrome.storage.sync.get(['trackedWebsites', 'timeLimits', 'pauseEndTime'], (data) => {
    const trackedWebsites = data.trackedWebsites || [];
    const timeLimits = data.timeLimits || {};
    const pauseEndTime = data.pauseEndTime || 0;
    const isPaused = pauseEndTime > Date.now();

    if (!isPaused && activeTab && activeTab.url) {
      const url = new URL(activeTab.url);
      const hostname = url.hostname.replace('www.', '');
      if (trackedWebsites.includes(hostname)) {
        timeSpent[hostname] = (timeSpent[hostname] || 0) + 1;
        chrome.storage.sync.set({ timeSpent });

        if (timeLimits[hostname]) {
          const limit = timeLimits[hostname] * 60; 
          if (timeSpent[hostname] >= limit) {
            chrome.tabs.update(activeTab.id, { url: 'about:blank' });
            alert(`Time limit for ${hostname} reached!`);
          }
        }
      }
    }
  });
}, 1000);


setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    timeSpent = {};
    chrome.storage.sync.set({ timeSpent });
  }
}, 60 * 1000);