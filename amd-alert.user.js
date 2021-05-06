// ==UserScript==
// @name        Alert when available - amd.com
// @namespace   Violentmonkey Scripts
// @match       https://www.amd.com/en/direct-buy/be
// @grant       GM_log
// @grant       GM_openInTab
// @grant       GM_notification
// @version     1.0
// @author      -
// @description 6/5/2021, 10:59:23
// ==/UserScript==

const PRODUCT_NAME_FILTER = "radeon"

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
  var products = document.getElementsByClassName("direct-buy");
  var availableProducts = [];
  for (var product of products) {
    var titleElems = product.getElementsByClassName("shop-title");
    var productName = "NO PRODUCT NAME";
    if (titleElems.length >= 1) {
      productName = titleElems[0].innerText;
    }
    var buyButtons = product.getElementsByClassName("btn-shopping-cart");
    if (buyButtons.length >= 1 && productName.toLowerCase().includes(PRODUCT_NAME_FILTER.toLowerCase())) {
      availableProducts.push(productName);
      if (!quiet()) {
        GM_notification({title: productName + ' is available from AMD.com', image: '', text: 'Click here to open the product page', onclick: notificationClicked }); 
      }
    } else {
      product.parentElement.parentElement.style.display = "none";
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