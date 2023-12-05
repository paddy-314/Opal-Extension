import { icsToJson } from './ics-to-json.js'

const defaultValues = {
  onOffDefault: true,
  audioSwitchDefault: true,
  autologinDefault: true,
  institutionDefault: '-1',
  usernameDefault: '',
  passwordDefault: '',
  delayDefault: '1000',
  reminderSwitch: true,
  calendarlink: '',
  calendarDataIndices: []
}

const notificationID = "calendarNote"

let values = ['onOff', 'audioSwitch', 'autologin', 'institution', 'username', 'password', 'delay', 'reminderSwitch', 'calendarlink', 'calendarDataIndices']

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason == "install") {
    Array.from(Object.keys(defaultValues)).forEach((element, i) => {
      chrome.storage.sync.set({ [values[i]]: defaultValues[element] })
    })
    //chrome.alarms.create('')
    chrome.alarms.create('refresh', { periodInMinutes: 1 });
  }
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  chrome.storage.sync.get(["reminderSwitch", "calendarlink"]).then(async (result) => {
    if (result['reminderSwitch'] && /http:\/\/www\.htwk-stundenplan\.de\/.+/.test(result['calendarlink'])) {
      queryCalendar(result['calendarlink']).then(async (res) => {
        // cleanup storage from previous items
        const calendarDataIndices = await chrome.storage.sync.get(["calendarDataIndices"])
        calendarDataIndices.calendarDataIndices.forEach(index => {
          chrome.storage.sync.remove('calendarData' + index)
        });
        chrome.storage.sync.set({ ['calendarDataIndices']: [] })

        // set new items
        let indices = []
        res.forEach((element, i) => {
          let pattern = /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/
          let eventStart = new Date(element.startDate.replace(pattern, '$1-$2-$3T$4:$5:$6'))
          let eventEnd = new Date(element.endDate.replace(pattern, '$1-$2-$3T$4:$5:$6'))
          let refDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
          if (eventStart - refDate < 0 && Date.now() - eventEnd < 0 && eventStart > new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)) { // filter out corrupted dates
            chrome.storage.sync.set({ ['calendarData' + i]: JSON.stringify(element) })
            createAlert(element, eventStart)
            indices.push(i)
          }
        })
        chrome.storage.sync.set({ ['calendarDataIndices']: indices.sort() })
      })
    }
    // else {
    //   console.warn("not matching pattern or disabled function")
    // }
  })
});

async function queryCalendar(url) {
  const icsRes = await fetch(url)
  const icsData = await icsRes.text()
  // Convert
  const data = icsToJson(icsData)
  return data
}

async function createAlert(alert, eventStart) {
  console.log(alert)
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    chrome.notifications.create(notificationID, {
      title: `Upcoming event in ${(new Date(eventStart - Date.now())).getMinutes() + 1}min`,
      message: alert.summary,
      iconUrl: '/images/calendar.png',
      type: 'basic'
    });
    chrome.notifications.onClicked.addListener(notificationId => notificationListener(notificationId, alert));
  }
  return true;
}

async function notificationListener(notificationId, alert) {
  if (notificationId == notificationID) {
    let courseLinks = await chrome.storage.sync.get("courseLinks")
    let url = ""
    for (const [index, element] of courseLinks.courseLinks.entries()) {
      if (stringSimilarity(element.name, alert.summary) > 0.5) {
        url = element.href;
        break;
      }
    }
    if (url != "") {
      console.log(url)
      chrome.tabs.create({ url: url });
    }
    else console.warn("no similar course found for " + alert.summary)
    console.log(notificationId)
    // chrome.notifications.getAll(notifications => {
    //   Object.keys(notifications).forEach(key => chrome.notifications.clear(key));
    // });    
  }
}

function stringSimilarity(str1, str2) {
  const len1 = str1.length, len2 = str2.length;
  const matrix = Array(len1 + 1).fill().map((_, i) => [i]);

  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (str1.charAt(i - 1) !== str2.charAt(j - 1))
      );
    }
  }

  return 1 - matrix[len1][len2] / Math.max(len1, len2);
}