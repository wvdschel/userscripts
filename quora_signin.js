// ==UserScript==
// @name         Quora sign-in wall remover
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.quora.com/*
// @grant        none
// ==/UserScript==

function removeWall() {
    divs = document.getElementsByTagName("div");
    for (var i=0; i < divs.length; i++) {
        var div = divs[i];
        if (div.id.indexOf("_signup_wall_wrapper") != -1) {
            div.parentNode.removeChild(div);
        }
    }
}

setTimeout(removeWall, 500);
