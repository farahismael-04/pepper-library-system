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
function isEnglishOrArabic(text) {
  return /^[A-Za-z0-9\u0600-\u06FF\s\-.,:()]+$/.test(text);
}
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}