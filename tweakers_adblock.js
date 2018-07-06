// ==UserScript==
// @name         Remove Google Ads
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://tweakers.net/*
// @grant GM_log
// ==/UserScript==

function removeAds() {
  var divs = document.getElementsByTagName("div");
  var removed = 0;
  for(idx = 0; idx < divs.length; idx++) {
    var div = divs[idx];
    if(div.hasAttribute("data-google-query-id") && div.style.display != "none") {
      div.style.display = "none";
      removed += 1;
    }
  }
  var iframes = document.getElementsByTagName("iframe");
  for(idx = 0; idx < iframes.length; idx++) {
    var iframe = iframes[idx];
    if(iframe.src.startsWith("https://media.adrcdn.com/ads/") && iframe.style.display != "none") {
      iframe.style.display = "none";
      removed += 1;
    }
  }
  var links = document.getElementsByTagName("a");
  for(idx = 0; idx < links.length; idx++) {
    var link = links[idx];
    if(link.hasAttribute("href") && link.getAttribute("href").indexOf("doubleclick.net") >= 0) {
      link.style.display = "none";
      removed += 1;
      //GM_log("Removing " + link.getAttribute("href"));
    }
  }
  // if (removed > 0) alert("Removed " + removed + " advertisement tweets.");
  window.setTimeout(removeTweets, 1000);
}

removeAds();

