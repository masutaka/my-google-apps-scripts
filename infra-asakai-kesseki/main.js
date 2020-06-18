// See also https://feedforce.esa.io/posts/68760

// PropertiesService: https://developers.google.com/apps-script/reference/properties/properties-service
const SLACK_OAUTH_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("SLACK_OAUTH_ACCESS_TOKEN");

const SLACK_CHANNEL = "#tech-infra";

const SLACK_BLOCKS = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "今日はインフラ朝会欠席します。ｶﾞｼｬｰﾝ ｶﾞｼｬｰﾝ :robot_face:",
    }
  },
  {
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: ":github: <https://github.com/masutaka/my-google-apps-scripts/blob/master/infra-asakai-kesseki/main.js|source code>",
      }
    ]
  },
];

const setTrigger = () => {
  const time = new Date();
  time.setHours(10);
  time.setMinutes(20);
  time.setSeconds(0);

  console.log(`[Info] set trigger at ${time}`);

  // https://developers.google.com/apps-script/reference/script/script-app#newtriggerfunctionname
  ScriptApp.newTrigger("notifyIfNeed").timeBased().at(time).create();
};

const notifyIfNeed = () => {
  const startTime = getStartTime(new Date());
  const endTime = getEndTime(new Date());
  const infraAsakai = getInfraAsakai(startTime, endTime);

  if (! infraAsakai) {
    console.log("infraAsakai is not found");
    return;
  }

  if (isPresent(infraAsakai)) {
    console.log(`[Present] startTime: ${formatDate(startTime)}, endTime: ${formatDate(endTime)}`);
    return;
  }

  console.log(`[Absent] startTime: ${formatDate(startTime)}, endTime: ${formatDate(endTime)}`);

  // UrlFetchApp: https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
  // Slack chat.postMessage: https://api.slack.com/methods/chat.postMessage
  const response = UrlFetchApp.fetch(
    "https://feedforce.slack.com/api/chat.postMessage",
    {
      method: "post",
      payload: {
        token: SLACK_OAUTH_ACCESS_TOKEN,
        channel: SLACK_CHANNEL,
        as_user: "true",
        blocks: JSON.stringify(SLACK_BLOCKS),
      }
    }
  );

  console.log(`responseCode: ${response.getResponseCode()}, contentText: ${response.getContentText()}`);
};

const getStartTime = (date) => {
  date.setHours(10);
  date.setMinutes(30);
  date.setSeconds(0);
  return date;
};

const getEndTime = (date) => {
  date.setHours(10);
  date.setMinutes(45);
  date.setSeconds(0);
  return date;
};

const getInfraAsakai = (start, end) => {
  // https://developers.google.com/apps-script/reference/calendar/calendar-app#getCalendarById(String)
  const calendar = CalendarApp.getCalendarById("masutaka@feedforce.jp");
  // https://developers.google.com/apps-script/reference/calendar/calendar-app#geteventsstarttime,-endtime
  const events = calendar.getEvents(start, end);
  return events.find(e => e.getTitle() == "インフラ朝会");
};

const isPresent = (infraAsakai) => {
  // https://developers.google.com/apps-script/reference/calendar/guest-status
  return infraAsakai.getMyStatus() == CalendarApp.GuestStatus.YES;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  return `${year}-${month}-${day} ${hour}:${minute}`;
};
