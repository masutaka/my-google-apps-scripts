const SlackOauthAccessToken = PropertiesService.getScriptProperties().getProperty("SLACK_OAUTH_ACCESS_TOKEN");

const main = () => {
  const now = new Date();

  if (isDayOff(now)) {
    console.log("I'm off today.");
    setSlackProfile(now);
    setSlackDnd(now);
  }
  else {
    console.log("I'm going to work today.");
  }
};

const isDayOff = (now) => {
  // https://developers.google.com/apps-script/reference/calendar/calendar-app#getCalendarById(String)
  const calendar = CalendarApp.getCalendarById("masutaka@feedforce.jp");
  // https://developers.google.com/apps-script/reference/calendar/calendar#geteventsfordaydate
  const events = calendar.getEventsForDay(now, {search: "全休"});
  return events.length >= 1;
};

const setSlackProfile = (now) => {
  const payload = {
    token: SlackOauthAccessToken,
    profile: JSON.stringify({
      status_emoji: ":yasumi:",
      status_text: `${formatDate(now)} 全休`,
      status_expiration: getStatusExpiration(now)
    })
  };

  console.log(`[setSlackProfile] payload.profile: ${JSON.stringify(payload.profile)}`);

  // UrlFetchApp: https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
  // Slack users.profile.set: https://api.slack.com/methods/users.profile.set
  UrlFetchApp.fetch(
    "https://feedforce.slack.com/api/users.profile.set",
    {
      method: "post",
      payload: payload
    }
  );
};

const setSlackDnd = (now) => {
  const payload = {
    token: SlackOauthAccessToken,
    num_minutes: getDnDNumMinutes(now)
  };

  console.log(`[setSlackDnd] payload.num_minutes: ${JSON.stringify(payload.num_minutes)}`);

  // UrlFetchApp: https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
  // Slack users.profile.set: https://api.slack.com/methods/dnd.setSnooze
  UrlFetchApp.fetch(
    "https://feedforce.slack.com/api/dnd.setSnooze",
    {
      method: "get",
      payload: payload
    }
  );
};

const formatDate = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNameJa = getDayNameJa(date.getDay());
  return `${month}/${day}（${dayNameJa}）`;
};

const getDayNameJa = (i) => {
  return ["日", "月", "火", "水", "木", "金", "土"][i];
};

// Return the end time (23:59:59) of today in UNIX time
const getStatusExpiration = (now) => {
  const expiration = new Date(now.getTime());
  expiration.setHours(23);
  expiration.setMinutes(59);
  expiration.setSeconds(59);
  return parseInt(expiration.getTime() / 1000);
};

// Return the difference minutes between tomorrow at 9:00 a.m. and now
const getDnDNumMinutes = (now) => {
  const tomorrow = new Date(now.getTime());
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  return parseInt((tomorrow.getTime() - now.getTime()) / 1000 / 60);
};
