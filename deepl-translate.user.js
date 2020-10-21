// ==UserScript==
// @name         Yahoo Auction Translator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to translate Yahoo Japan auctions in the browser
// @author       Wim Vander Schelden
// @match        https://*.co.jp/*
// @match        https://www.deepl.com/translator
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        GM_listValues
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_removeValueChangeListener
// @grant        GM_addValueChangeListener
// ==/UserScript==
const START_TIME = +new Date();

// We use single-character emojis as separators to combine multiple small translation requests into a single text. Since emojis are not
// translated between languages, we can use them to filter out the components of the translate texts after translation.
const REQUEST_SEPARATOR = "\n\n\n🐬\n\n\n";
const RESPONSE_SEPARATOR = /\n+🐬+\n*/;

// These characters are used to find points at which to split text that exceeds the maximum request size into smaller
// requests.
const WORD_SEPARATORS = ["・", " ", "\n"];

const MAX_REQUEST_TIME_MS = 50000; // 50s
const MAX_DAEMON_PROCESS_TIME_MS = 20000; // 20s
const MAX_TRANSLATION_COUNT = 25;
const MAX_LENGTH = 5000;
var translationCount = 0;

const JAPANESE_REGEX = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/;

// Return a random UUID
// From https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Count the number of characters in a string, counting most emoji and exotic scripts as 1 char.
function characterCount(str) {
    return [...str].length
}

// Split a string along a list of separators, taking care not to split strings
// half way through a unicode codepoint.
// Returns a two-part list, with the first part guarantueed to be under maxLength
// characters.
function cleanSplit(str, maxLength=MAX_LENGTH, separators=WORD_SEPARATORS) {
    if (str.length <= maxLength) return [str, ''];

    var charList = [...str];
    var lastCharPos = -1;
    var length = 0;
    for(var i = 0; length < maxLength && i < charList.length; i++) {
        if (length + charList[i].length > maxLength) {
            i--;
            break;
        }
        if (separators.indexOf(charList[i]) != 0) {
            lastCharPos = i;
        }
        length += charList[i].length;
    }
    if (lastCharPos == -1) lastCharPos = i;

    return [charList.slice(0, lastCharPos).join(""),
            charList.slice(lastCharPos).join("")];
}

// From https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message) {
    var timestamp = +new Date() - START_TIME;
    var s = Math.floor(timestamp/1000);
    var ms = timestamp % 1000;
    if (ms < 10) ms = "00" + ms;
    else if (ms < 100) ms = "0" + ms;
    console.log("[" + s + "." + ms + "] " + message)
}

function isDaemon() {
    return window.location.href.startsWith("https://www.deepl.com/translator");
}

async function translateTextDeepl(text) {
    // Deepl has a maximum of 5000 characters per translation using the free service.
    if (text.length > MAX_LENGTH) {
        log("Request length " + text.length + " exceeds maximum of " + MAX_LENGTH + ", request will be split up.");
        var parts = cleanSplit(text);
        return translateTextDeepl(parts[0]).then(part0 => {
            return translateTextDeepl(parts[1]).then(part1 => {
                return part0 + part1
            });
        });
    }

    var textAreas = document.getElementsByTagName("textarea");
    var translate_input = textAreas[0];
    document.getElementsByClassName("lmt__translations_as_text__text_btn")[0].innerText = "";
    var clipboard_data = new DataTransfer();
    clipboard_data.setData("text/plain", text);
    var pasteEvent = new ClipboardEvent("paste", clipboard_data, "text/plain", text);
    translate_input.textContent = text;
    translate_input.dispatchEvent(pasteEvent);
    var handler = async function(resolve, reject) {
        var retries = MAX_DAEMON_PROCESS_TIME_MS / 100;
        var attempts = 0;
        while (attempts < retries) {
            var result = document.getElementsByClassName("lmt__translations_as_text__text_btn")[0].innerText;
            if(result != "") {
                resolve(result);
                return;
            } else {
                await sleep(100);
            }
            attempts++;
        }
        reject(new Error("did not get a translation for within " + MAX_DAEMON_PROCESS_TIME_MS + "ms"))
    }
    return new Promise((resolve, reject) => handler(resolve, reject));
}

async function translateText(text) {
    if (text.trim() == "") return new Promise(resolve => resolve(text));

    var requestId = uuidv4();
    log(requestId + " has a payload of " + text.length + " chars.");
    GM_deleteValue("translation-" + requestId);
    GM_setValue("inputText-" + requestId, text);
    var handler = async function(resolve, reject) {
        for (var i = 0; i < MAX_REQUEST_TIME_MS; i += 100) {
            var result = GM_getValue("translation-" + requestId);
            GM_deleteValue("translation-" + requestId);
            if (result != undefined) {
                resolve(result);
                return
            }
            await sleep(100);
        }
        reject(new Error("did not get a translation within " + MAX_REQUEST_TIME_MS + "ms"))
    }
    return new Promise((resolve, reject) => handler(resolve, reject));
}

function stringHash(str) {
    var hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function cacheValue(text, value=null) {
    var key = "translation_cache_" + (stringHash(text) % 64);
    var cache_bucket = GM_getValue(key);
    if(cache_bucket == undefined) cache_bucket = {};
    if(value) {
        cache_bucket[text] = value
        GM_setValue(key, cache_bucket);
    }
    return cache_bucket[text];
}

function segmentIdentifier(i) {
    var c = 0xf00000 + i;
    var res = '0x' + c.toString(16);
    return res;
}

async function translateBulk(collectedTexts) {
    var totalRequestText = collectedTexts.map((f, i) => segmentIdentifier(i) + "\n\n" + f.data).join(REQUEST_SEPARATOR);
    translationCount++;
    var label = "#" + translationCount + "/" + MAX_TRANSLATION_COUNT + " ";
    log(label+ "Attempting to translate " + totalRequestText.length + " characters for " + collectedTexts.length + " nodes.");
    await translateText(totalRequestText).then(totalTranslation => {
        log(label + "Translation of " + totalRequestText.length + " chars produced " + totalTranslation.length + " chars.");
        var responses = totalTranslation.split(RESPONSE_SEPARATOR);
        log(label + "Translation of " + collectedTexts.length + " parts produced " + responses.length + " parts.");
        if (responses.length != collectedTexts.length) {
            log(label + "Corrupted result: translation of " + collectedTexts.length + " parts produced " + responses.length + " parts.");
            log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
            log(totalRequestText);
            log("========================================");
            log(totalTranslation);
            log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        }
        for (var i = 0; i < responses.length; i++) {
            var translation = responses[i];
            translation = translation.replace(RegExp("[^0]*"), "");
            var segmentId = parseInt(translation, 16) - 0xf00000;
            if (segmentId != NaN) {
                if (segmentId != i) {
                    log("Response segment " + i + " seems to match a different request segment (" + segmentId + ") was for: " + responses[i]);
                }
                if (segmentId < collectedTexts.length) {
                    translation = translation.replace(RegExp(segmentIdentifier(segmentId) + "\n*"), "");
                    cacheValue(collectedTexts[segmentId].data, translation);
                    collectedTexts[segmentId].data = translation;
                }
            } else {
                log("Could not figure out what response segment " + i + "was for: " + responses[i]);
            }
        }
    });
}

async function translateNodes(nodes, collectedTexts=[], collectedCharacterCount=0) {
    while(nodes.length != 0 && translationCount < MAX_TRANSLATION_COUNT) {
        var firstNode = nodes[0];
        var nextNodes = nodes.slice(1);
        if (firstNode instanceof Text) {
            var inputText = firstNode.data;
            var messageLength = REQUEST_SEPARATOR.length + inputText.length + segmentIdentifier(collectedTexts.length).length + 2;
            var cachedValue = cacheValue(inputText);
            if (cachedValue != undefined) {
                firstNode.data = cachedValue;
            } else if (inputText.match(JAPANESE_REGEX) && translationCount < MAX_TRANSLATION_COUNT) {
                if (messageLength >= MAX_LENGTH) {
                    try {
                        await translateBulk([firstNode]);
                    } catch(e) {
                        log("Bulk translation failed: " + e);
                    }
                } else {
                    if (messageLength + collectedCharacterCount > MAX_LENGTH) {
                        log("Processing " + collectedTexts.length + " parts with a total of " + collectedCharacterCount + " bytes");
                        // Adding this  exceed request size, so dispatch the current request queue first.
                        try {
                            await translateBulk(collectedTexts);
                        } catch(e) {
                            log("Bulk translation failed: " + e);
                        }
                        collectedTexts=[];
                        collectedCharacterCount=0
                    }
                    collectedTexts.push(firstNode);
                    collectedCharacterCount += messageLength;
                }
            }
        } else if (firstNode instanceof Element) {
            firstNode.normalize();
            nextNodes.unshift(...firstNode.childNodes);
        }
        nodes = nextNodes;
    }

    // Nothing left to do, just dispatch the queued input.
    if (collectedTexts.length > 0 && translationCount < MAX_TRANSLATION_COUNT) {
        log("Final translation.");
        await translateBulk(collectedTexts);
    }
    log("Jobs done.");
}

async function translateRequest(inputName, inputText) {
    'use strict';
    var requestId = inputName.replace("inputText-", "");
    var outputName = inputName.replace("inputText-", "translation-");
    try {
        return translateTextDeepl(inputText).then(translation => {
            log("Responding request " + inputName + " with a payload of " + translation.length + " chars, input was " + inputText.length + " chars.");
            GM_setValue(outputName, translation);
        }).catch(e => {
            log("Failed to translate " + requestId + ": " + e);
            log("Queueing " + inputName + " for retry");
            GM_setValue(inputName, inputText);
        });
    } catch (error) {
        log("ERROR: " + error);
    }
}
async function daemon() {
    'use strict';

    var storageKeys = GM_listValues();
    for (var i = 0; i < storageKeys.length; i++) {
        if (storageKeys[i].startsWith("inputText-")) {
            var inputText = GM_getValue(storageKeys[i]);
            if (inputText != undefined) {
                GM_deleteValue(storageKeys[i]);
                var req = translateRequest(storageKeys[i], inputText);
                await req;
                break;
            }
        }
    }
    setTimeout(daemon, 50);
}

function startTranslationDaemon() {
    'use strict';
    daemon().then(() => {})
}

function startTranslationClient() {
    'use strict';
    cacheValue("-", "-");
    translateNodes([document.body]).then(() => {});
}

(function() {
    'use strict';
    if (isDaemon()) {
        log("Starting translation service");
        window.setTimeout(startTranslationDaemon(), 1000);
    } else {
        log("Translating this page");
        window.setTimeout(startTranslationClient(), 1000);
    }
})();
