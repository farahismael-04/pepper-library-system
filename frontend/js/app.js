function init() {
  bindEvents();
  applyLanguage();
  showView('home');
  updateStatusBadge();
  updateSpeechStatus(state.lang === 'en' ? 'Not connected' : 'غير متصل');
}

window.onload = init;