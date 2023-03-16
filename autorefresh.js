function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function refreshPage(delay) {
    let loadingTimeout = new Date()
    let roomClosed = true;
    while (roomClosed) {
        let button = $("div.run-container").children("button");
        if (typeof button !== 'undefined' && button.attr('disabled') == 'disabled') {
            console.log("not open yet, refreshing");
            $("#main-content").load(window.location.href + " #main-content > *", "");
            await Sleep(delay);
        }
        else if (typeof button == 'object' && button.length > 0) {
            chrome.storage.sync.get(["audioSwitch"]).then((result) => {
                if (result["audioSwitch"] === true) {
                    let speak = new SpeechSynthesisUtterance("Der Raum ist offen!");
                    speak.lang = "de-DE";
                    speechSynthesis.speak(speak);
                    roomClosed = false;
                }
                reload()
            })
        }
        else {
            if (new Date() - loadingTimeout > 1000 * 0.5 && Array.from($("img[alt='Loading...']")).length > 0 && !window.location.href.includes("&autorefresh=true")) {
                loadingTimeout = new Date();
                let query = ""
                if (/\?\d+/.test(window.location.href)) { query = "&autorefresh=true" }
                else { query = "?1&autorefresh=true" }
                window.location.href = window.location.href + query;
            }
            await Sleep(50)
        }
    }
}

function reload() {
    window.location.href = window.location.href.split(/[&]/)[0];
}


$(async function () {
    chrome.storage.sync.get(["onOff", "delay"]).then(async (result) => {
        if (result["onOff"] === true) {
            if (window.location.href.includes("&autorefresh=true")) { createUI(result); refreshPage(result["delay"]); } //shortcut for already executed
            else {
                let executed = false
                while (!executed) {
                    while (Array.from($("img[alt='Loading...']")).length > 0) {
                        console.info("Waiting")
                        await Sleep(1000);
                    }
                    //clearInterval(stateCheck);
                    let selector = Array.from(document.getElementsByTagName("h2"));
                    selector.forEach(element => {
                        if (element.innerText.includes("Virtuelles Klassenzimmer")) {
                            executed = true
                            createUI(result);
                        }
                    });
                    await Sleep(1000);
                }
            }
        }
    })
});

function createUI(result) {
    const notification = document.createElement("div");
    notification.className = 'notification';

    const button = document.createElement("button");
    button.classList.add("btn")
    button.innerHTML = "refresh until open"
    button.addEventListener("click", function () { refreshPage(parseInt(result["delay"])); })

    const cancelbutton = document.createElement("button");
    cancelbutton.classList.add("btn")
    cancelbutton.innerHTML = "cancel"
    cancelbutton.addEventListener("click", function () { reload(); })

    // Notification text.
    const notificationText = document.createElement('p');
    notification.appendChild(button);
    notification.appendChild(cancelbutton)
    //notification.appendChild(notificationText);

    // Add to current page.
    document.body.appendChild(notification);

    notification.style.display = 'flex';
    notificationText.innerHTML = "Detected"


    // setTimeout(function () {
    //     notification.style.display = 'none';
    // }, 20000);
}