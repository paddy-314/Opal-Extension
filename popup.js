let onOff = document.getElementById('onOff')
let audioSwitch = document.getElementById('audioSwitch')
let autologin = document.getElementById('autologin')
let institution = document.getElementById('institution')
let username = document.getElementById('username')
let password = document.getElementById('password')
let delay = document.getElementById('delay')
let restore = document.getElementById('restoreDefault')

let buttonList = [onOff, audioSwitch, autologin, institution, username, password, delay]

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

async function setPreference(element) {
  chrome.storage.sync.get([element.id], function (result) {
    let res = Array.from(Object.values(result))[0]
    if (element.type == 'checkbox') {
      element.checked = res === true
    } else if ((element.id == "username") || element.id == "password") {
      if (res != '') { element.value = decrypt(res) }
      else { element.value = res }
    }
    else {
      element.value = res
    }
  })
}

restore.addEventListener('click', async () => {
  Array.from(Object.keys(defaultValues)).forEach((element, i) => {
    let ary = []
    ary.push({ [values[i]]: defaultValues[element] })
    // set sytem variables and store to storage
    chrome.storage.sync.set(ary[0])
  })
  buttonList.forEach(element => {
    setPreference(element)
  })
})

async function init() {
  buttonList.forEach(element => {
    if (element.type == 'checkbox') {
      element.addEventListener('click', async () => {
        setStorage(element.id, element.checked)
      })
    } else if (element.id == "username" || element.id == "password") {
      element.addEventListener('change', async () => {
        if (element.value != '') { setStorage(element.id, encrypt(element.value)) }
        else { setStorage(element.id, element.value) }
      })
    } else {
      element.addEventListener('change', async () => {
        setStorage(element.id, element.value)
      })
    }
  })
}

function setStorage(key, value) {
  // set sytem variables and store to storage
  chrome.storage.sync.set({ [key]: value })
}

function encrypt(plainText) {
  const rnd = "zKbwUMMzwr89KKae"
  const key = CryptoJS.enc.Utf8.parse(rnd);
  const iv1 = CryptoJS.enc.Utf8.parse(rnd);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    keySize: 16,
    iv: iv1,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted + "";
}

function decrypt(cipher) {
  const rnd = "zKbwUMMzwr89KKae"
  const key = CryptoJS.enc.Utf8.parse(rnd);
  const iv1 = CryptoJS.enc.Utf8.parse(rnd);
  const plainText = CryptoJS.AES.decrypt(cipher, key, {
    keySize: 16,
    iv: iv1,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });

  return plainText.toString(CryptoJS.enc.Utf8);
}

buttonList.forEach(element => {
  setPreference(element)
})

init()