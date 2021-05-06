// ==UserScript==
// @name        Alert when available - ldlc.com
// @namespace   Violentmonkey Scripts
// @match       https://www.ldlc.com/fr-be/informatique/pieces-informatique/carte-graphique-interne/*
// @grant       GM_log
// @grant       GM_openInTab
// @grant       GM_notification
// @version     1.0
// @author      -
// @description 6/5/2021, 10:59:23
// ==/UserScript==

const PRODUCT_NAME_FILTER = ["6800", "6700", "3060", "3070", "3080", "3090"]

function quiet() {
  return window.location.hash == "#quiet"
}

function notificationClicked() {
  GM_openInTab(window.location.href + "#quiet", false);
}

function playSound() {
  const audio = new Audio("https://onlineclock.net/audio/options/rooster.mp3");
  audio.play();
}

function checkPage() {
  "use strict"
  var products = document.getElementsByClassName("pdt-item");
  var availableProducts = [];
  for (var product of products) {
    var titleElems = product.getElementsByClassName("title-3");
    var productName = "NO PRODUCT NAME";
    if (titleElems.length >= 1) {
      productName = titleElems[0].innerText;
    }
    var buyButtons = product.getElementsByClassName("stock-2");
    var found = false;
    if (buyButtons.length >= 1) {
      for (var filter of PRODUCT_NAME_FILTER) {
        if (productName.toLowerCase().includes(filter.toLowerCase())) {
          found = true;
          break;
        }
      }
      if (found) {
        availableProducts.push(productName);
        if (!quiet()) {
          GM_notification({title: productName + ' is available from AMD.com', image: '', text: 'Click here to open the product page', onclick: notificationClicked }); 
        }
      }
    }
    if (! found) {
      product.style.display = "none";
    }
  }
  GM_log("" + availableProducts);
  if (availableProducts.length > 0) {
    if (!quiet()) {
      playSound();
      alert("Available products:\n\n" + availableProducts.join("\n"));
    }
    return true;
  }
  return false;
}

if (!checkPage()) {
  setTimeout(function(){ location.reload(); }, 5*1000);
} else {
  setTimeout(function(){ location.reload(); }, 300*1000);
}