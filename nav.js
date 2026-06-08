// Redirect to home on page refresh
(function () {
  if (window.location.pathname === '/home.html') return;
  const entries = performance.getEntriesByType('navigation');
  if (entries.length > 0 && entries[0].type === 'reload') {
    window.location.replace('/home.html');
  }
})();

