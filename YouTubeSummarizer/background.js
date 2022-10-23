console.log('[YS - BACKGROUND]');
const DEFAULT_SETTINGS = {
    'timecodes': [0], // stores only timecodes
    'phrases': ['Nothing yet'], // stores only text(must have the same size as timecodes)
    'temporary': '', // formatted text
    'temporaryLink': '', // formatted text location url
    'site': 'a' // options a,b,c
}
var subtitleLink = '',
    [timecode, phrase] = [[], []];

// initialize default value when extension is first used or refreshed
chrome.runtime.onInstalled.addListener(() => { chrome.storage.local.set({ key: DEFAULT_SETTINGS }); });

// onBeforeNavigate used to wake service worker from sleep
chrome.webNavigation.onBeforeNavigate.addListener(function () {
    // look through network traffic requests
    chrome.webRequest.onBeforeRequest.addListener(
        function (details) {
            if (details.url.toString().includes('https://www.youtube.com/api/timedtext')) {
                // prevent usage of the same link as it may lead to overload
                if (subtitleLink.toString() === details.url.toString()) { return; }
                subtitleLink = details.url.toString();
                // console.log('[FOUND] ' + subtitleLink);
                requestJSON(subtitleLink);
            }
        }, { urls: ["<all_urls>"] }, ['requestBody'])
});

// request subtitles in JSON
const requestJSON = async (jsonUrl) => {
    const response = await fetch(jsonUrl),
        json = await response.text(),
        jsonEvent = JSON.parse(json).events;

    start = performance.now();
    // reads JSON object, extracts text with timecodes
    for (_ in jsonEvent) { loopThrough(jsonEvent[_]) }
    end = performance.now();

    chrome.storage.local.get(['key'], (result) => {
        // save acquired data
        chrome.storage.local.set({ key: { 'timecodes': timecode, 'phrases': phrase, "site": result.key.site } }, () => {
            [timecode, phrase] = [[], []]; // when saved, clear variable values
        });
    });

    console.log('[PERFORMANCE TIME] is ' + Math.ceil((end - start) / 1000) + ' sec');

}

// extracts timecodes and text from JSON file
function loopThrough(obj) {
    let sentence = '';
    for (i in obj) {
        if (Object.keys(obj[i]).length > 0 && typeof obj[i] !== 'string') {
            if (i === 'segs' && Object.keys(obj[i]).length > 0) {
                if (Object.keys(obj[i]).length === 1) {
                    if (obj[i][0].utf8 === '\n') { return; }
                    phrase.push(obj[i][0].utf8.replaceAll('\n', ' '));
                    timecode.push(obj.tStartMs);
                } else {
                    for (let l = 0; l < Object.keys(obj[i]).length; l++) { sentence += obj[i][l].utf8 }
                    phrase.push(sentence.replaceAll('\n', ' '));
                    timecode.push(obj.tStartMs);
                }
            }
        }
    }
}

// available when right click extension icon
chrome.contextMenus.removeAll();
chrome.contextMenus.create({
    id: 'YS_ID',
    title: "Reset to default",
    contexts: ["action"]
});
chrome.contextMenus.onClicked.addListener((info) => {
    const { menuItemId } = info
    if (menuItemId === 'YS_ID') {
        chrome.storage.local.set({ key: DEFAULT_SETTINGS })
    }
});