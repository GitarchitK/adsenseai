/**
 * AdSense Policy Shield - Popup Script
 * Updates the popup UI with scan results
 */

chrome.storage.local.get(['lastScan'], (result) => {
  const scan = result.lastScan;
  if (scan && scan.timestamp > Date.now() - 300000) { // 5 minutes fresh
    document.getElementById('no-data').style.display = 'none';
    document.getElementById('scan-data').style.display = 'block';

    const scoreEl = document.getElementById('score');
    scoreEl.innerText = scan.score;
    scoreEl.style.color = scan.score >= 80 ? '#10b981' : scan.score >= 60 ? '#f59e0b' : '#ef4444';

    const issuesList = document.getElementById('issues-list');
    issuesList.innerHTML = '';

    scan.issues.forEach(issue => {
      const item = document.createElement('div');
      item.className = 'issue-item error';
      item.innerHTML = `<strong>✕</strong> <span>${issue}</span>`;
      issuesList.appendChild(item);
    });

    scan.warnings.forEach(warning => {
      const item = document.createElement('div');
      item.className = 'issue-item warning';
      item.innerHTML = `<strong>!</strong> <span>${warning}</span>`;
      issuesList.appendChild(item);
    });

    if (scan.issues.length === 0 && scan.warnings.length === 0) {
      const item = document.createElement('div');
      item.className = 'issue-item';
      item.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
      item.style.border = '1px solid rgba(16, 185, 129, 0.2)';
      item.style.color = '#10b981';
      item.innerHTML = `<strong>✓</strong> <span>No policy violations found on this page.</span>`;
      issuesList.appendChild(item);
    }
  }
});
