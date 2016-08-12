// ==UserScript==
// @name        Cookie monster
// @namespace   org.fixnum.cookiemonster
// @include     http://orteil.dashnet.org/cookieclicker/
// @version     1
// @grant       none
// ==/UserScript==

var autoCookie=false;
var autoGold=false;
var autoUpgrade=false;
var autoClicks=0;
var autoClicksGold=0;
var autoClicksPerWakeup=25;
var autoUpgrades=0;

function clickety() {
  if (autoCookie)
  {
    for (var i = 0; i < autoClicksPerWakeup; i++) {
      Game.ClickCookie();
    }
    autoClicks += autoClicksPerWakeup;
    if (autoClicks % 10000 < autoClicksPerWakeup)
      document.getElementById("autocookie_label").innerHTML = "Auto cookie clicker (" + autoClicks + ")";
    window.setTimeout(clickety);
  } else {
    window.setTimeout(clickety, 1000);
  }
}

function clicketyGold() {
  if (autoGold && document.getElementById('goldenCookie').style.display != 'none') {
   Game.goldenCookie.click();
   autoClicksGold ++;
   document.getElementById("autogold_label").innerHTML = "Auto gold clicker (" + autoClicksGold + ")";
   window.setTimeout(clicketyGold, 5000);
  } else { 
   window.setTimeout(clicketyGold, 250);
  }
}

function clicketyUpgrade() {
  if (autoUpgrade && document.getElementById('techUpgrades').style.display != 'none') {
   eval(document.getElementById('upgrade0').onclick);
   autoUpgrades ++;
   document.getElementById("autoupgrade_label").innerHTML = "Auto upgrader (" + autoUpgrades + ")";
   window.setTimeout(clicketyUpgrade, 5000);
  } else { 
   window.setTimeout(clicketyUpgrade, 250);
  }
}

function toggleAutoClick() {
  autoCookie = ! autoCookie;
  unsafeWindow.console.log("Auto cookie clicking is now " + (autoCookie ? "on" : "off"));
}
function toggleAutoGold() {
  autoGold = ! autoGold;
  unsafeWindow.console.log("Auto gold cookie clicking is now " + (autoGold ? "on" : "off"));
}
function toggleAutoUpgrade() {
  autoUpgrade = ! autoUpgrade;
  unsafeWindow.console.log("Auto upgrade clicking is now " + (autoUpgrade ? "on" : "off"));
}

function setup() {
  var topBar = document.getElementById("topBar");
  var bigCookie = document.getElementById("bigCookie");
  if(topBar != null && bigCookie != null)
  {
    topBar.innerHTML =  "<input type='checkbox' id='autocookie_input'> <span id='autocookie_label'>Auto cookie clicker</span>";
    topBar.innerHTML += "<input type='checkbox' id='autogold_input'> <span id='autogold_label'>Auto gold clicker</span>";
    topBar.innerHTML += "<input type='checkbox' id='autoupgrade_input'> <span id='autoupgrade_label'>Auto upgrader</span>";
    document.getElementById('autocookie_input').addEventListener('change', toggleAutoClick, false);
    document.getElementById('autogold_input').addEventListener('change', toggleAutoGold, false);
    document.getElementById('autoupgrade_input').addEventListener('change', toggleAutoUpgrade, false);
    clickety(); clicketyGold(); clicketyUpgrade();
    unsafeWindow.console.log("Loaded cookie monster.");
  } else {
    unsafeWindow.console.log("Waiting for cookie clicker to load.");
    window.setTimeout(setup, 1000);
  }
}

window.setTimeout(setup, 10000);
