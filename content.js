chrome.storage.sync.get(['trackedWebsites', 'timeLimits', 'timeSpent', 'pauseEndTime'], (data) => {
  const trackedWebsites = data.trackedWebsites || [];
  const timeLimits = data.timeLimits || {};
  const timeSpent = data.timeSpent || {};
  const pauseEndTime = data.pauseEndTime || 0;
  const isPaused = pauseEndTime > Date.now();
  const hostname = window.location.hostname.replace('www.', '');

  if (!isPaused && trackedWebsites.includes(hostname) && timeLimits[hostname]) {
    const limit = timeLimits[hostname] * 60; 
    if (timeSpent[hostname] >= limit) {
      document.body.innerHTML = '<h1>Time Limit Reached</h1><p>You have exceeded your time limit for this website.</p>';
    }
  }
});