var state = {
  lang: 'en',
  query: '',
  searchMode: 'all',
  selectedBook: null,
  connected: false,
  navigating: false
};

var ros = null;

var ROSBRIDGE_URL = 'ws://192.168.8.172:9090';
var SPEECH_TOPIC = '/speech';
var NAV_TOPIC = '/move_base_simple/goal';
var CMD_VEL_TOPIC = '/cmd_vel';
var STAFF_TOPIC = '/call_staff';
var NAV_FRAME = 'map';

var books = [
  {
    title_en: "Artificial Intelligence Engines",
    title_ar: "محركات الذكاء الاصطناعي",
    author_en: "James Stone",
    author_ar: "جيمس ستون",
    year: 2024,
    topic_en: "Artificial Intelligence",
    topic_ar: "الذكاء الاصطناعي",
    keywords: ["ai", "artificial intelligence", "machine learning", "deep learning", "neural networks", "robotics", "ذكاء", "ذكاء اصطناعي", "تعلم الآلة"],
    available: true,
    shelf: "AI-03",
    x: 0.2,
    y: 0.0,
    description_en: "A beginner-friendly introduction to artificial intelligence concepts, learning systems, and modern AI applications.",
    description_ar: "مقدمة مبسطة في مفاهيم الذكاء الاصطناعي وأنظمة التعلم وتطبيقات الذكاء الاصطناعي الحديثة."
  },
  {
    title_en: "Deep Learning",
    title_ar: "التعلم العميق",
    author_en: "Ian Goodfellow",
    author_ar: "إيان جودفيلو",
    year: 2016,
    topic_en: "Machine Learning",
    topic_ar: "تعلم الآلة",
    keywords: ["ai", "deep learning", "machine learning", "neural network", "tensorflow", "keras", "ذكاء", "تعلم عميق", "شبكات عصبية"],
    available: true,
    shelf: "CS-12",
    x: 0.4,
    y: 0.0,
    description_en: "A detailed book about neural networks, optimization, representation learning, and deep learning models.",
    description_ar: "كتاب تفصيلي عن الشبكات العصبية والتحسين وتمثيل البيانات ونماذج التعلم العميق."
  },
  {
    title_en: "Database System Concepts",
    title_ar: "مفاهيم أنظمة قواعد البيانات",
    author_en: "Abraham Silberschatz",
    author_ar: "أبراهام سيلبرشاتز",
    year: 2020,
    topic_en: "Databases",
    topic_ar: "قواعد البيانات",
    keywords: ["database", "databases", "sql", "mysql", "data", "db", "query", "tables", "قواعد بيانات", "بيانات", "استعلام"],
    available: true,
    shelf: "DB-08",
    x: 0.6,
    y: 0.2,
    description_en: "Covers relational databases, SQL, database design, transactions, recovery, and storage systems.",
    description_ar: "يتناول قواعد البيانات العلائقية ولغة SQL وتصميم قواعد البيانات والمعاملات والاسترجاع وأنظمة التخزين."
  },
  {
    title_en: "Computer Networks",
    title_ar: "شبكات الحاسوب",
    author_en: "Andrew Tanenbaum",
    author_ar: "أندرو تانينباوم",
    year: 2021,
    topic_en: "Networking",
    topic_ar: "الشبكات",
    keywords: ["network", "networks", "networking", "tcp", "ip", "internet", "routing", "protocol", "شبكات", "انترنت", "بروتوكولات"],
    available: false,
    shelf: "NET-04",
    x: 0.8,
    y: 0.1,
    description_en: "Explains network layers, protocols, routing, transport systems, and internet architecture.",
    description_ar: "يشرح طبقات الشبكات والبروتوكولات والتوجيه وأنظمة النقل وبنية الإنترنت."
  },
  {
    title_en: "Clean Code",
    title_ar: "الكود النظيف",
    author_en: "Robert C. Martin",
    author_ar: "روبرت سي. مارتن",
    year: 2008,
    topic_en: "Software Engineering",
    topic_ar: "هندسة البرمجيات",
    keywords: ["software", "engineering", "programming", "code", "clean code", "coding", "development", "برمجة", "كود", "هندسة البرمجيات"],
    available: true,
    shelf: "SE-02",
    x: 1.0,
    y: 0.2,
    description_en: "A practical guide to writing readable, maintainable, and clean software code.",
    description_ar: "دليل عملي لكتابة كود واضح وقابل للصيانة ومنظم."
  }
];

function t() {
  return translations[state.lang];
}

function bookTitle(book) {
  return state.lang === 'ar' ? book.title_ar : book.title_en;
}

function bookAuthor(book) {
  return state.lang === 'ar' ? book.author_ar : book.author_en;
}

function bookTopic(book) {
  return state.lang === 'ar' ? book.topic_ar : book.topic_en;
}

function bookDescription(book) {
  return state.lang === 'ar' ? book.description_ar : book.description_en;
}

function init() {
  bindEvents();
  applyLanguage();
  showView('home');
  updateStatusBadge();
  updateSpeechStatus(state.lang === 'en' ? 'Not connected' : 'غير متصل');
}

function bindEvents() {
  document.getElementById('langBtn').onclick = toggleLang;

  document.getElementById('searchCard').onclick = function () {
    showView('search');
    renderBooks();
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
    renderBooks();
  };

  document.getElementById('searchMode').onchange = function (e) {
    state.searchMode = e.target.value;
    renderBooks();
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
  renderBooks();

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

function isEnglishOrArabic(text) {
  return /^[A-Za-z0-9\u0600-\u06FF\s\-.,:()]+$/.test(text);
}

function keywordMatch(book, q) {
  var i;
  var keyword;

  if (!book.keywords) {
    return false;
  }

  for (i = 0; i < book.keywords.length; i++) {
    keyword = book.keywords[i].toLowerCase();

    if (keyword.indexOf(q) !== -1 || q.indexOf(keyword) !== -1) {
      return true;
    }
  }

  return false;
}

function getFilteredBooks() {
  var q = state.query.toLowerCase();
  var rawQuery = state.query;
  var mode = state.searchMode;
  var result = [];
  var i;
  var book;
  var match;
  var hasKeyword;

  if (q.length === 0) {
    return [];
  }

  for (i = 0; i < books.length; i++) {
    book = books[i];
    hasKeyword = keywordMatch(book, q);
    match = false;

    if (mode === 'title') {
      match =
        book.title_en.toLowerCase().indexOf(q) !== -1 ||
        book.title_ar.indexOf(rawQuery) !== -1;
    } else if (mode === 'author') {
      match =
        book.author_en.toLowerCase().indexOf(q) !== -1 ||
        book.author_ar.indexOf(rawQuery) !== -1;
    } else if (mode === 'topic') {
      match =
        book.topic_en.toLowerCase().indexOf(q) !== -1 ||
        book.topic_ar.indexOf(rawQuery) !== -1 ||
        hasKeyword;
    } else {
      match =
        book.title_en.toLowerCase().indexOf(q) !== -1 ||
        book.author_en.toLowerCase().indexOf(q) !== -1 ||
        book.topic_en.toLowerCase().indexOf(q) !== -1 ||
        book.title_ar.indexOf(rawQuery) !== -1 ||
        book.author_ar.indexOf(rawQuery) !== -1 ||
        book.topic_ar.indexOf(rawQuery) !== -1 ||
        hasKeyword;
    }

    if (match) {
      result.push(book);
    }
  }

  return result;
}

function findAutoCorrectSuggestion() {
  var q = state.query.toLowerCase();
  var bestBook = null;
  var bestScore = 0;
  var i;
  var score;

  if (q.length < 2) {
    return null;
  }

  for (i = 0; i < books.length; i++) {
    score = similarity(q, books[i].title_en.toLowerCase());

    if (score > bestScore) {
      bestScore = score;
      bestBook = books[i];
    }
  }

  if (bestScore >= 0.55) {
    return bestBook;
  }

  return null;
}

function renderBooks() {
  var list = document.getElementById('booksList');
  var hint = document.getElementById('searchHint');
  var message = document.getElementById('searchMessage');
  var suggestions = document.getElementById('suggestionBox');
  var filtered;
  var html = '';
  var i;
  var book;
  var statusText;
  var suggestion;
  var items;

  if (message) {
    message.innerHTML = '';
  }

  if (suggestions) {
    suggestions.innerHTML = '';
  }

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
  filtered = getFilteredBooks();

  if (filtered.length === 0) {
    list.innerHTML = '';

    if (message) {
      message.innerHTML = state.lang === 'en'
        ? 'Book not found.'
        : 'لم يتم العثور على الكتاب.';
    }

    suggestion = findAutoCorrectSuggestion();

    if (suggestion && suggestions) {
      suggestions.innerHTML =
        '<span class="suggestion-label">' +
        (state.lang === 'en' ? 'Did you mean: ' : 'هل تقصد: ') +
        '</span>' +
        '<button class="suggestion-item" onclick="selectSuggestion(\'' + escapeForClick(bookTitle(suggestion)) + '\')">' +
        escapeHtml(bookTitle(suggestion)) +
        '</button>';
    }

    return;
  }

  if (filtered.length > 1 && message) {
    message.innerHTML = state.lang === 'en'
      ? 'Multiple matches found. Please select one.'
      : 'تم العثور على عدة نتائج. يرجى اختيار كتاب.';
  }

  for (i = 0; i < filtered.length; i++) {
    book = filtered[i];
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
    items[i].onclick = createBookClickHandler(filtered[i]);
  }
}

function selectSuggestion(value) {
  state.query = value;
  document.getElementById('searchInput').value = value;
  renderBooks();
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

function connectROS() {
  if (typeof ROSLIB === 'undefined') {
    updateSpeechStatus('ROSLIB not loaded');
    return;
  }

  updateSpeechStatus(state.lang === 'en' ? 'Connecting...' : 'جاري الاتصال...');

  try {
    ros = new ROSLIB.Ros({
      url: ROSBRIDGE_URL
    });

    ros.on('connection', function () {
      state.connected = true;
      updateStatusBadge();
      updateSpeechStatus(state.lang === 'en' ? 'Connected to ROS bridge' : 'متصل مع ROS bridge');
    });

    ros.on('error', function (error) {
      state.connected = false;
      updateStatusBadge();
      updateSpeechStatus(state.lang === 'en' ? 'ROS bridge error' : 'خطأ في ROS bridge');
      console.log(error);
    });

    ros.on('close', function () {
      state.connected = false;
      updateStatusBadge();
      updateSpeechStatus(state.lang === 'en' ? 'ROS bridge closed' : 'تم إغلاق ROS bridge');
    });
  } catch (e) {
    state.connected = false;
    updateStatusBadge();
    updateSpeechStatus(state.lang === 'en' ? 'Connection failed' : 'فشل الاتصال');
    console.log(e);
  }
}

function sendSpeech() {
  var text;

  if (!state.connected) {
    alert(state.lang === 'en' ? 'Not connected to ROS bridge' : 'غير متصل مع ROS bridge');
    return;
  }

  text = document.getElementById('speechInput').value;

  if (!text) {
    alert(state.lang === 'en' ? 'Enter speech text first' : 'أدخل النص أولاً');
    return;
  }

  publishSpeech(text);
}

function publishSpeech(text) {
  var speechTopic;

  if (!state.connected) {
    return;
  }

  speechTopic = new ROSLIB.Topic({
    ros: ros,
    name: SPEECH_TOPIC,
    messageType: 'std_msgs/String'
  });

  speechTopic.publish(new ROSLIB.Message({
    data: text
  }));

  updateSpeechStatus(state.lang === 'en' ? 'Speech sent' : 'تم إرسال الكلام');
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

function sendNavigationGoal(book) {
  var goalTopic;
  var goalMsg;

  goalTopic = new ROSLIB.Topic({
    ros: ros,
    name: NAV_TOPIC,
    messageType: 'geometry_msgs/PoseStamped'
  });

  goalMsg = new ROSLIB.Message({
    header: {
      frame_id: NAV_FRAME
    },
    pose: {
      position: {
        x: book.x,
        y: book.y,
        z: 0.0
      },
      orientation: {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        w: 1.0
      }
    }
  });

  goalTopic.publish(goalMsg);
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

function stopNavigation() {
  var cmdVelTopic;
  var stopMsg;

  state.navigating = false;

  if (state.connected) {
    cmdVelTopic = new ROSLIB.Topic({
      ros: ros,
      name: CMD_VEL_TOPIC,
      messageType: 'geometry_msgs/Twist'
    });

    stopMsg = new ROSLIB.Message({
      linear: { x: 0.0, y: 0.0, z: 0.0 },
      angular: { x: 0.0, y: 0.0, z: 0.0 }
    });

    cmdVelTopic.publish(stopMsg);
    publishSpeech(state.lang === 'en' ? 'Navigation stopped.' : 'تم إيقاف التوجيه.');
  }

  showView('details');
}

function callStaff() {
  var staffTopic;

  if (state.connected) {
    staffTopic = new ROSLIB.Topic({
      ros: ros,
      name: STAFF_TOPIC,
      messageType: 'std_msgs/String'
    });

    staffTopic.publish(new ROSLIB.Message({
      data: 'Staff assistance requested from Leo tablet.'
    }));

    publishSpeech(state.lang === 'en' ? 'Calling staff for assistance.' : 'جاري طلب المساعدة.');
  }

  alert(state.lang === 'en' ? 'Staff has been requested.' : 'تم طلب المساعدة.');
}

function similarity(a, b) {
  var longer = a.length > b.length ? a : b;
  var shorter = a.length > b.length ? b : a;
  var longerLength = longer.length;

  if (longerLength === 0) {
    return 1.0;
  }

  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(a, b) {
  var costs = [];
  var i;
  var j;
  var lastValue;
  var newValue;

  for (i = 0; i <= a.length; i++) {
    lastValue = i;

    for (j = 0; j <= b.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        newValue = costs[j - 1];

        if (a.charAt(i - 1) !== b.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }

        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }

    if (i > 0) {
      costs[b.length] = lastValue;
    }
  }

  return costs[b.length];
}

function escapeForClick(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

window.onload = init;