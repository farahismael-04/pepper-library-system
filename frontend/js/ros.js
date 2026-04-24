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