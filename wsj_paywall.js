// ==UserScript==
// @name         WSJ Paywall
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.wsj.com/articles/*
// @match        https://www.facebook.com/flx/warn/*
// @grant        none
// ==/UserScript==

var labels = document.getElementsByClassName("snippet-label");
for (var i = 0; i < labels.length; i++) {
    var txt = labels[i].innerText;
    if (txt == "TO READ THE FULL STORY") {
        window.location.href='https://m.facebook.com/l.php?u='+encodeURIComponent(window.location.href);
    }
}

var btn = document.getElementById("u_0_t");
if (btn) {
    window.location.href = btn.href;
}
