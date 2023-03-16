$(function () {
    chrome.storage.sync.get(["onOff", "autologin", "institution"]).then(async (result) => {
        if (result["onOff"] === true && result["autologin"] === true && result["institution"] != '-1') { //check if autologin is enabled
            let span = $('a.btn.btn-sm[title="Login"]').find('span')
            if (span.length == 0) {
                span = $('a.btn.btn-sm[title="Show user profile"]').find('span')
            }
            span.trigger("click")

            let selector = '[name="content:container:login:shibAuthForm:wayfselection"]'
            waitForElm(selector).then((elm) => {
                let select = document.querySelector(selector)
                let value = result["institution"]
                selectElement(select, value)
                let confirm = $("button[name='content:container:login:shibAuthForm:shibLogin']").first()
                confirm.trigger("click")
            });
        }
    });
});

function selectElement(select, valueToSelect) {
    select.value = valueToSelect;
    select.dispatchEvent(new Event('change'))
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}