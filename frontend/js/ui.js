function bindEvents() {
  document.getElementById('langBtn').onclick = toggleLang;

  document.getElementById('searchCard').onclick = function () {
    showView('search');
    renderBooks([]);
  };

  document.getElementById('chatbotCard').onclick = function () {
    alert(state.lang === 'en' ? 'Chatbot screen is not connected yet.' : 'واجهة الشات بوت غير موصولة بعد.');
  };

  document.getElementById('backHomeBtn').onclick = function () {
    showView('home');
  };

  document.getElementById('backSearchBtn').onclick = function () {
    showView('search');
  };

  document.getElementById('searchInput').onkeyup = function (e) {
    state.query = e.target.value;
    delayedSearch();
  };

  document.getElementById('searchMode').onchange = function (e) {
    state.searchMode = e.target.value;
    delayedSearch();
  };

  document.getElementById('viewMapBtn').onclick = function () {
    showView('map');
  };

  document.getElementById('backDetailsFromMapBtn').onclick = function () {
    showView('details');
  };

  document.getElementById('navBtn').onclick = openConfirmNavigation;

  document.getElementById('confirmYesBtn').onclick = function () {
    closeConfirmNavigation();
    startNavigation();
  };

  document.getElementById('confirmNoBtn').onclick = closeConfirmNavigation;
  document.getElementById('stopNavBtn').onclick = stopNavigation;
  document.getElementById('callStaffBtn').onclick = callStaff;

  document.getElementById('backDetailsFromNavBtn').onclick = function () {
    showView('details');
  };

  document.getElementById('chatBtn').onclick = function () {
    alert(state.lang === 'en' ? 'Chatbot action is not connected yet.' : 'وظيفة الشات بوت غير موصولة بعد.');
  };

  document.getElementById('connectBtn').onclick = connectROS;
  document.getElementById('speakBtn').onclick = sendSpeech;
}

function showView(viewName) {
  var views = ['homeView', 'searchView', 'detailsView', 'mapView', 'navigationView'];
  var i;

  for (i = 0; i < views.length; i++) {
    document.getElementById(views[i]).className = 'view';
  }

  if (viewName === 'home') {
    document.getElementById('homeView').className = 'view active';
  } else if (viewName === 'search') {
    document.getElementById('searchView').className = 'view active';
  } else if (viewName === 'details') {
    document.getElementById('detailsView').className = 'view active';
  } else if (viewName === 'map') {
    document.getElementById('mapView').className = 'view active';
  } else if (viewName === 'navigation') {
    document.getElementById('navigationView').className = 'view active';
  }
}

function applyLanguage() {
  var text = t();

  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';

  document.getElementById('langBtn').innerHTML = state.lang === 'en' ? 'العربية' : 'English';

  document.getElementById('homeTitle').innerHTML = text.title;
  document.getElementById('homeSubtitle').innerHTML = text.subtitle;
  document.getElementById('searchCard').innerHTML = text.searchBooks;
  document.getElementById('chatbotCard').innerHTML = text.chatbot;

  document.getElementById('backHomeBtn').innerHTML = '← ' + text.backHome;
  document.getElementById('backSearchBtn').innerHTML = '← ' + text.backSearch;
  document.getElementById('searchTitle').innerHTML = text.searchTitle;
  document.getElementById('searchInput').placeholder = text.searchPlaceholder;
  document.getElementById('searchHint').innerHTML = text.searchHint;

  document.getElementById('searchMode').options[0].text = text.all;
  document.getElementById('searchMode').options[1].text = text.titleMode;
  document.getElementById('searchMode').options[2].text = text.authorMode;
  document.getElementById('searchMode').options[3].text = text.topicMode;

  document.getElementById('shelfLabel').innerHTML = text.shelf + ':';
  document.getElementById('statusLabel').innerHTML = text.status + ':';
  document.getElementById('authorLabel').innerHTML = text.author + ':';
  document.getElementById('yearLabel').innerHTML = text.year + ':';
  document.getElementById('descriptionLabel').innerHTML = text.description;

  document.getElementById('viewMapBtn').innerHTML = text.viewMap;
  document.getElementById('navBtn').innerHTML = text.startNav;
  document.getElementById('chatBtn').innerHTML = text.askChatbot;

  document.getElementById('mapTitle').innerHTML = text.mapTitle;
  document.getElementById('mapSubtitle').innerHTML = text.mapSubtitle;
  document.getElementById('backDetailsFromMapBtn').innerHTML = '← ' + text.backDetails;

  document.getElementById('confirmTitle').innerHTML = text.confirmTitle;
  document.getElementById('confirmText').innerHTML = text.confirmText;
  document.getElementById('confirmYesBtn').innerHTML = text.confirmYes;
  document.getElementById('confirmNoBtn').innerHTML = text.confirmNo;

  document.getElementById('navigatingTitle').innerHTML = text.navigatingTitle;
  document.getElementById('stopNavBtn').innerHTML = text.stopNavigation;
  document.getElementById('callStaffBtn').innerHTML = text.callStaff;
  document.getElementById('backDetailsFromNavBtn').innerHTML = '← ' + text.backDetails;

  document.getElementById('connectBtn').innerHTML = text.connectRos;
  document.getElementById('speakBtn').innerHTML = text.testSpeech;

  updateStatusBadge();

  if (state.query.length > 0) {
    delayedSearch();
  }

  if (state.selectedBook) {
    renderDetails();
    renderNavigationPage();
  }
}

function toggleLang() {
  state.lang = state.lang === 'en' ? 'ar' : 'en';
  applyLanguage();
}

function updateStatusBadge() {
  var badge = document.getElementById('statusBadge');

  badge.className = state.connected ? 'status online' : 'status offline';

  badge.innerHTML = state.connected
    ? (state.lang === 'en' ? 'Robot Online' : 'الروبوت متصل')
    : (state.lang === 'en' ? 'Robot Offline' : 'الروبوت غير متصل');
}

function updateSpeechStatus(text) {
  document.getElementById('speechStatus').innerHTML = text;
}


function clearSearchFeedback(message, suggestions) {
  if (message) {
    message.innerHTML = '';
  }

  if (suggestions) {
    suggestions.innerHTML = '';
  }
}

function renderBooks(results) {
  var list = document.getElementById('booksList');
  var message = document.getElementById('searchMessage');
  var suggestions = document.getElementById('suggestionBox');
  var html = '';
  var i;
  var book;
  var statusText;
  var items;

  clearSearchFeedback(message, suggestions);

  if (state.query.length === 0) {
    list.innerHTML = '';
    return;
  }

  if (!results || results.length === 0) {
    list.innerHTML = '';

    if (message) {
      message.innerHTML = state.lang === 'en'
        ? 'Book not found.'
        : 'لم يتم العثور على الكتاب.';
    }

    return;
  }

  if (results.length > 1 && message) {
    message.innerHTML = state.lang === 'en'
      ? 'Multiple matches found. Please select one.'
      : 'تم العثور على عدة نتائج. يرجى اختيار كتاب.';
  }

  for (i = 0; i < results.length; i++) {
    book = results[i];
    statusText = book.available ? t().available : t().notAvailable;

    html += '<div class="book-item">' +
      '<h3>' + escapeHtml(bookTitle(book)) + '</h3>' +
      '<p class="book-meta">' + escapeHtml(bookAuthor(book)) + ' • ' + escapeHtml(bookTopic(book)) + ' • ' + statusText + '</p>' +
      '<p class="book-meta">' + t().shelf + ': ' + escapeHtml(book.shelf) + '</p>' +
      '</div>';
  }

  list.innerHTML = html;
  items = list.getElementsByClassName('book-item');

  for (i = 0; i < items.length; i++) {
    items[i].onclick = createBookClickHandler(results[i]);
  }
}

function createBookClickHandler(book) {
  return function () {
    state.selectedBook = book;
    renderDetails();
    showView('details');
  };
}

function renderDetails() {
  var book = state.selectedBook;

  if (!book) {
    return;
  }

  document.getElementById('bookTitle').innerHTML = escapeHtml(bookTitle(book));
  document.getElementById('bookShelf').innerHTML = escapeHtml(book.shelf);
  document.getElementById('bookStatus').innerHTML = book.available ? t().available : t().notAvailable;
  document.getElementById('bookAuthor').innerHTML = escapeHtml(bookAuthor(book));
  document.getElementById('bookYear').innerHTML = escapeHtml(book.year);
  document.getElementById('bookDescription').innerHTML = escapeHtml(bookDescription(book));
  document.getElementById('navBtn').disabled = !book.available;
}

function openConfirmNavigation() {
  if (!state.selectedBook) {
    return;
  }

  if (!state.selectedBook.available) {
    alert(state.lang === 'en' ? 'This book is not available.' : 'هذا الكتاب غير متوفر.');
    return;
  }

  document.getElementById('confirmOverlay').className = 'overlay';
}

function closeConfirmNavigation() {
  document.getElementById('confirmOverlay').className = 'overlay hidden';
}

function startNavigation() {
  var book = state.selectedBook;

  if (!book) {
    return;
  }

  if (!state.connected) {
    alert(state.lang === 'en' ? 'Not connected to ROS bridge' : 'غير متصل مع ROS bridge');
    return;
  }

  state.navigating = true;

  publishSpeech(
    state.lang === 'en'
      ? 'Please follow me. I will guide you to ' + bookTitle(book) + ' at shelf ' + book.shelf + '.'
      : 'اتبعني من فضلك. سأرشدك إلى كتاب ' + bookTitle(book) + ' عند الرف ' + book.shelf
  );

  sendNavigationGoal(book);
  renderNavigationPage();
  showView('navigation');
}
function renderNavigationPage() {
  var book = state.selectedBook;

  if (!book) {
    return;
  }

  document.getElementById('navigatingText').innerHTML =
    state.lang === 'en'
      ? 'Navigating to "' + escapeHtml(bookTitle(book)) + '" at shelf ' + escapeHtml(book.shelf) + '.'
      : 'جاري التوجه إلى "' + escapeHtml(bookTitle(book)) + '" عند الرف ' + escapeHtml(book.shelf) + '.';
}


