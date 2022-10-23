console.log('[YS - CONTENT]');
var reserve, sites = {
    "a": "https://app.summari.com/demo",
    "b": "https://app.summari.com/my-summari",
    "c": "https://quillbot.com/summarize"
};
chrome.storage.local.get(['key'], (result) => {
    reserve = result.key;
    // temporary link generator
    if (document.location.href === 'https://uau.li/') {
        // insert text; imitate keyboard press; submit click; wait 1 sec; save link
        document.querySelector('#data').innerHTML = result.key.temporary;
        document.querySelector('#data').dispatchEvent(new Event('input', { bubbles: true }));
        document.querySelector('#btnSubmit').click();
        setTimeout(() => {
            reserve.temporaryLink = "https://" + document.querySelector('#result').innerText;
            chrome.storage.local.set({ key: reserve });
            document.location.href = sites[reserve.site]; // redirect to summarizer
        }, 1000);
    }
    // text summary
    else if (document.location.href === 'https://app.summari.com/demo') {
        window.localStorage.clear(); // clear website local storage

        if (!document.querySelector('#link')) { window.location.reload(); }

        document.querySelector('#link').value = result.key.temporaryLink
        document.querySelector('#link').dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => { document.querySelector('button').click(); }, 2000);
    }
    // (best option) summary with logged in account, works most of the time, a bit faster
    else if (document.location.href === sites.b) {
        setTimeout(() => {
            document.querySelector("button[data-cy=add-link-button]").click();
            setTimeout(() => {
                document.querySelector("#add-link-input").value = reserve.temporaryLink;
                document.querySelector("#add-link-input").dispatchEvent(new Event('input', { bubbles: true }));
                setTimeout(() => { document.querySelector("#btn-summarize-modal").click(); }, 400)
            }, 400)
        }, 2000);
    }
    // short duration videos text summary
    else if (document.location.href === sites.c) {
        setTimeout(() => {
            document.querySelector(".css-nqhs2h").click(); // enable summary filter by key sentences
            setTimeout(() => {
                let inputText = document.querySelector("div[placeholder='Paste or write about your topic then click the Summarize button.']");
                inputText.innerText = reserve.temporary;
                setTimeout(() => { document.querySelector(".css-hjaote").click(); }, 2000);
            }, 500);
        }, 2000)
    }
    // enable subtitles
    if (reserve.temporaryLink === "!") {
        setTimeout(() => { document.querySelector(".ytp-subtitles-button").click(); }, 2000);
    }

});

// automation of extension's subtitle retrieval
chrome.runtime.onMessage.addListener((request) => {
    if (request.target === "content" && request.action === 'refreshTab') {
        document.location.reload();
    }

});