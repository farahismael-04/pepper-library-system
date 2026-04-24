var state = {
  lang: 'en',
  query: '',
  searchMode: 'all',
  selectedBook: null,
  connected: false,
  navigating: false,
  searchTimer: null
};

var ros = null;

var ROSBRIDGE_URL = 'ws://192.168.8.172:9090';
var SPEECH_TOPIC = '/speech';
var NAV_TOPIC = '/move_base_simple/goal';
var CMD_VEL_TOPIC = '/cmd_vel';
var STAFF_TOPIC = '/call_staff';
var NAV_FRAME = 'map';

var API_URL = 'http://127.0.0.1:5000/api/books/search';