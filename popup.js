document.addEventListener('DOMContentLoaded', () => {
  const websiteInput = document.getElementById('websiteInput');
  const addWebsiteButton = document.getElementById('addWebsite');
  const websiteList = document.getElementById('websiteList');
  const statsDiv = document.getElementById('stats');
  const currentSite = document.getElementById('currentSite');
  const timeSpentDisplay = document.getElementById('timeSpent');
  const timeRemainingDisplay = document.getElementById('timeRemaining');
  const pauseButton = document.getElementById('pauseButton');
  const addCurrentSiteButton = document.getElementById('addCurrentSite');

  let isPaused = false;
  let pauseEndTime = 0;


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const isValidDomain = (input) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return domainRegex.test(input);
  };

  const loadData = () => {
    chrome.storage.sync.get(['trackedWebsites', 'timeLimits', 'timeSpent', 'pauseEndTime'], (data) => {
      const trackedWebsites = data.trackedWebsites || [];
      const timeLimits = data.timeLimits || {};
      const timeSpent = data.timeSpent || {};
      pauseEndTime = data.pauseEndTime || 0;
      isPaused = pauseEndTime > Date.now();


      pauseButton.textContent = isPaused ? `Resumes in ${formatTime(Math.ceil((pauseEndTime - Date.now()) / 1000))}` : 'Pause for 5 min';
      pauseButton.disabled = isPaused;


      websiteList.innerHTML = '';
      trackedWebsites.forEach((site) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = `${site} ${timeLimits[site] ? `(${timeLimits[site]} min)` : '(No limit)'}`;
        li.appendChild(span);


        const limitInput = document.createElement('input');
        limitInput.type = 'number';
        limitInput.min = '0';
        limitInput.value = timeLimits[site] || '';
        limitInput.placeholder = 'Min';


        const setLimitButton = document.createElement('button');
        setLimitButton.textContent = timeLimits[site] ? 'Update' : 'Set';
        setLimitButton.className = 'set-btn';
        setLimitButton.onclick = () => {
          const limit = parseInt(limitInput.value);
          if (limit > 0) {
            timeLimits[site] = limit;
          } else {
            delete timeLimits[site];
          }
          chrome.storage.sync.set({ timeLimits }, loadData);
        };


        const removeButton = document.createElement('button');
        removeButton.className = 'remove-btn';
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => {
          const updatedWebsites = trackedWebsites.filter((s) => s !== site);
          delete timeLimits[site];
          chrome.storage.sync.set({ trackedWebsites: updatedWebsites, timeLimits }, loadData);
        };


        const actions = document.createElement('div');
        actions.className = 'flex';
        actions.appendChild(limitInput);
        actions.appendChild(setLimitButton);
        actions.appendChild(removeButton);
        li.appendChild(actions);
        websiteList.appendChild(li);
      });


      statsDiv.innerHTML = '<div class="stats-grid"><div>Site</div><div>Time</div></div>';
      const sortedSites = Object.keys(timeSpent).sort((a, b) => timeSpent[b] - timeSpent[a]);
      sortedSites.forEach((site) => {
        const time = timeSpent[site] || 0;
        const div = document.createElement('div');
        div.className = 'stats-grid';
        div.innerHTML = `<div>${site}</div><div>${formatTime(time)}</div>`;
        statsDiv.appendChild(div);
      });
    });
  };


  const updateCounter = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || !tabs[0].url) {
        console.error('No active tab or URL');
        currentSite.textContent = 'No active site';
        timeSpentDisplay.textContent = '0s';
        timeRemainingDisplay.textContent = 'No limit';
        addCurrentSiteButton.style.display = 'none';
        return;
      }
      const url = new URL(tabs[0].url);
      const hostname = url.hostname.replace('www.', '');
      if (!isValidDomain(hostname)) {
        currentSite.textContent = hostname;
        timeSpentDisplay.textContent = 'Not a valid domain';
        timeSpentDisplay.style.color = '#a3a3a3';
        timeSpentDisplay.style.fontSize = '16px';
        timeSpentDisplay.style.fontWeight = 'normal';
        timeRemainingDisplay.textContent = 'Cannot track';
        addCurrentSiteButton.style.display = 'none';
        return;
      }
      chrome.storage.sync.get(['trackedWebsites', 'timeLimits', 'timeSpent'], (data) => {
        const trackedWebsites = data.trackedWebsites || [];
        const timeLimits = data.timeLimits || {};
        const timeSpent = data.timeSpent || {};
        if (trackedWebsites.includes(hostname)) {
          const time = timeSpent[hostname] || 0;
          const limit = timeLimits[hostname] ? timeLimits[hostname] * 60 : Infinity;
          currentSite.textContent = hostname;
          timeSpentDisplay.textContent = formatTime(time);
          timeRemainingDisplay.textContent = limit === Infinity ? 'No limit' : `Remaining: ${formatTime(Math.max(0, limit - time))}`;
          addCurrentSiteButton.style.display = 'none';
        } else {
          currentSite.textContent = hostname;
          timeSpentDisplay.textContent = 'Not tracked';
          timeSpentDisplay.style.color = '#a3a3a3';
          timeSpentDisplay.style.fontSize = '16px';
          timeSpentDisplay.style.fontWeight = 'normal';
          timeRemainingDisplay.textContent = 'No limit';
          addCurrentSiteButton.style.display = 'block';
        }
      });
    });
  };


  addWebsiteButton.onclick = () => {
    const website = websiteInput.value.trim();
    if (website && isValidDomain(website)) {
      chrome.storage.sync.get(['trackedWebsites'], (data) => {
        const trackedWebsites = data.trackedWebsites || [];
        if (!trackedWebsites.includes(website)) {
          trackedWebsites.push(website);
          chrome.storage.sync.set({ trackedWebsites }, () => {
            console.log(`Added ${website} to trackedWebsites`);
            websiteInput.value = '';
            loadData();
          });
        } else {
          console.log(`${website} already tracked`);
        }
      });
    } else {
      console.error('Invalid domain:', website);
      alert('Please enter a valid domain (e.g., youtube.com)');
    }
  };


  addCurrentSiteButton.onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname.replace('www.', '');
        if (!isValidDomain(hostname)) {
          alert('Cannot track this domain (e.g., chrome:// URLs are not allowed)');
          return;
        }
        chrome.storage.sync.get(['trackedWebsites'], (data) => {
          const trackedWebsites = data.trackedWebsites || [];
          if (!trackedWebsites.includes(hostname)) {
            trackedWebsites.push(hostname);
            chrome.storage.sync.set({ trackedWebsites }, () => {
              console.log(`Added ${hostname} to trackedWebsites`);
              loadData();
              updateCounter();
            });
          } else {
            console.log(`${hostname} already tracked`);
          }
        });
      }
    });
  };


  pauseButton.onclick = () => {
    isPaused = true;
    pauseEndTime = Date.now() + 5 * 60 * 1000; 
    chrome.storage.sync.set({ pauseEndTime }, () => {
      pauseButton.textContent = `Resumes in ${formatTime(5 * 60)}`;
      pauseButton.disabled = true;
    });
  };


  setInterval(() => {
    if (isPaused && pauseEndTime > Date.now()) {
      pauseButton.textContent = `Resumes in ${formatTime(Math.ceil((pauseEndTime - Date.now()) / 1000))}`;
    } else if (isPaused) {
      isPaused = false;
      pauseButton.textContent = 'Pause for 5 min';
      pauseButton.disabled = false;
      chrome.storage.sync.set({ pauseEndTime: 0 });
    }
    updateCounter();
  }, 1000);

 
  loadData();
  updateCounter();
});