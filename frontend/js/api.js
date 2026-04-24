function delayedSearch() {
  if (state.searchTimer) {
    clearTimeout(state.searchTimer);
  }

  state.searchTimer = setTimeout(searchBooksFromDatabase, 250);
}

function searchBooksFromDatabase() {
  var list = document.getElementById('booksList');
  var hint = document.getElementById('searchHint');
  var message = document.getElementById('searchMessage');
  var suggestions = document.getElementById('suggestionBox');

  clearSearchFeedback(message, suggestions);

  if (state.query.length === 0) {
    list.innerHTML = '';
    hint.style.display = 'block';
    return;
  }

  if (!isEnglishOrArabic(state.query)) {
    list.innerHTML = '';
    hint.style.display = 'none';

    if (message) {
      message.innerHTML = state.lang === 'en'
        ? 'Please use English or Arabic only.'
        : 'يرجى استخدام اللغة الإنجليزية أو العربية فقط.';
    }

    return;
  }

  hint.style.display = 'none';

  if (message) {
    message.innerHTML = state.lang === 'en' ? 'Searching...' : 'جاري البحث...';
  }

  requestBooks(
    state.query,
    state.searchMode,
    function (results) {
      renderBooks(results);
    },
    function () {
      list.innerHTML = '';

      if (message) {
        message.innerHTML = state.lang === 'en'
          ? 'Server busy, please try again.'
          : 'الخادم مشغول، يرجى المحاولة مرة أخرى.';
      }
    }
  );
}

function requestBooks(query, mode, onSuccess, onError) {
  var xhr = new XMLHttpRequest();
  var url = API_URL + '?q=' + encodeURIComponent(query) + '&mode=' + encodeURIComponent(mode);
  var timedOut = false;

  var timeoutId = setTimeout(function () {
    timedOut = true;
    xhr.abort();
    onError();
  }, 10000);

  xhr.open('GET', url, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      clearTimeout(timeoutId);

      if (timedOut) {
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          onSuccess(JSON.parse(xhr.responseText));
        } catch (e) {
          onError();
        }
      } else {
        onError();
      }
    }
  };

  xhr.onerror = function () {
    clearTimeout(timeoutId);
    onError();
  };

  xhr.send();
}