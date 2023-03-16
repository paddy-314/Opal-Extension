chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting === "hello")
            sendResponse({ farewell: "goodbye" });
    }
);
        // console.log(document.all[0].outerHTML)
        // document.getElementsByTagName("h2").forEach(element => {
        //     if (element.innerText.includes("Virtuelles Klassenzimmer")) {
        //         console.log("detected")
        //         refreshPage();
        //     }
        // });
    // });