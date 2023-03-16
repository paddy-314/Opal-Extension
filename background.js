import { icsToJson } from './ics-to-json.js'

const defaultValues = {
  onOffDefault: true,
  audioSwitchDefault: true,
  autologinDefault: true,
  institutionDefault: '-1',
  usernameDefault: '',
  passwordDefault: '',
  delayDefault: '1000'
}

let values = ['onOff', 'audioSwitch', 'autologin', 'institution', 'username', 'password', 'delay']

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason == "install") {
    Array.from(Object.keys(defaultValues)).forEach((element, i) => {
      let ary = []
      ary.push({ [values[i]]: defaultValues[element] })
      // set sytem variables and store to storage
      chrome.storage.sync.set(ary[0])
    })

    chrome.alarms.create('refresh', { periodInMinutes: 60 });
  }
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log(alarm.name); // refresh
  let r = await t("http://www.htwk-stundenplan.de/298266fd/")
  console.log(r)
});

async function t(url) {
  const icsRes = await fetch(url)
  const icsData = await icsRes.text()
  // Convert
  const data = icsToJson(icsData)
  return data
}
