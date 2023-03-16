
(function ($) {
    $.fn.update = function () {
        return $(this.selector);
    };
})(jQuery);


$(function () {
    //wait for jQuery
    if (window.jQuery) {
        main();
    } else {
        setTimeout(function () { defer(method) }, 50);
    }
});

function main() {

    chrome.storage.sync.get(["onOff", "autologin", "lastLogin", "username", "password"]).then(async (result) => {
        let lastLogin = 0
        if (result["lastLogin"] && Number.isInteger(result["lastLogin"])) { lastLogin = result["lastLogin"] }
        if (result["onOff"] === true && result["autologin"] === true && lastLogin < Date.now() - 2000) {//check if autologin is enabled

            waitForElm('input#password').then((elm) => {
                setTimeout(() => {

                    // values cant be read due to chrome's security policy
                    let $username = $("input#username")
                    let $password = $("input#password")

                    if (result["username"] != '' && result["password"] != '') {
                        $username.val(decrypt(result["username"]))
                        $password.val(decrypt(result["password"]))
                        chrome.storage.sync.set({ lastLogin: Date.now() })
                        $("button[name='_eventId_proceed'][type='submit']").click() //.trigger("click")
                    }

                }, 1000);
            });
        }
        else {
            console.warn("not set or last login too new")
        }
    });
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