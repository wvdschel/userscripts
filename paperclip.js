// ==UserScript==
// @name         Paperclip Factory!
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://www.decisionproblem.com/paperclips/index2.html
// @grant        none
// ==/UserScript==

function createLog() {
    var console = elem("consoleDiv");
    var botLog = document.createElement('p');
    botLog.className = "consoleOld";
    botLog.id = "botLog";
    console.appendChild(botLog);
}

function log(msg) {
    var date = new Date();
    var hours = date.getHours() < 10 ? "0" + date.getHours() : "" + date.getHours();
    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : "" + date.getMinutes();
    var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : "" + date.getSeconds();
    var ts = "[" + hours + ":" + minutes + ":" + seconds + "] ";
    var message = ts + msg;
    var console = elem("botLog");
    var msgs = console.innerHTML.split("<br>");
    if(msgs.length > 15) {
        msgs = msgs.slice(msgs.length - 15);
    }
    msgs.push(message);
    console.innerHTML = msgs.join("<br>");
}

function elem(id) {
    return document.getElementById(id);
}

function parseNumericValue(elem) {
    return parseFloat(elem.innerText.split(",").join(""));
}

function isManufacturing() {
    return elem("manufacturingDiv").style.display != "none";
}

function isInBusiness() {
    return elem("businessDiv").style.display != "none";
}

function isDesigningProbe() {
    return elem("probeDesignDiv").style.display != "none";
}

function click(elem) {
    if (elem.fireEvent) {
        elem.fireEvent('onclick');
    } else {
        var click = document.createEvent("MouseEvents");
        click.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0, false, false, false, false, 0, null);
        elem.dispatchEvent(click);
        elem.focus();

        var evObj = document.createEvent('Events');
        evObj.initEvent("click", true, false);
        evObj.which = elem;
        elem.dispatchEvent(evObj);
    }
}

function makePaperclip(repeatTime=0) {
    //var btn = elem("btnMakePaperclip");
    //click(btn);
    clipClick(1);
    if(repeatTime) {
         setTimeout(function(){ makePaperclip(repeatTime); }, repeatTime);
    }
}

var wireLow = 16;
function buyWire() {
    if (!isManufacturing()) {
        log("No longer manufacturing, giving up on buying wire.");
        return;
    }
    var btn = elem("btnBuyWire");
    var wireLeft = parseNumericValue(elem("wire"));
    var wirePrice = parseNumericValue(elem("wireCost"));
    var wireRate = parseNumericValue(elem("clipmakerRate"));
    var secondsLeft = wireLeft / wireRate;
    if (! btn.disabled) {
        if (secondsLeft < 120 && wirePrice < wireLow) {
            log("Only " + secondsLeft + " seconds of wire left and price is lower than target of $ " + wireLow +
                " - automatically buying wire for $" + wirePrice);
            //click(btn);
            buyWire();
        }
    }
    wireLow = (wireLow * 0.985 + wirePrice * 0.015);
    setTimeout(buyWire, 100);
}

function adjustPrice() {
    if (!isInBusiness()) {
        log("No longer doing business, giving up on selling paperclips.");
        return;
    }
    var unsoldStock = parseNumericValue(elem("unsoldClips"));
    var soldPerSec = parseNumericValue(elem("avgSales"));
    var secondsLeft = unsoldStock / soldPerSec;
    var price = parseNumericValue(elem("margin"));
    var btn = null;
    if (secondsLeft < 5) {
        btn = elem("btnRaisePrice");
        //log("Automatically raising price: " + secondsLeft + " seconds of inventory.");
        //click(btn);
        raisePrice();
        if (secondsLeft < 1) {
            setTimeout(adjustPrice, 1000);
        } else {
            setTimeout(adjustPrice, 5000);
        }
    } else if(secondsLeft > 10) {
        btn = elem("btnLowerPrice");
        if(price < 0.02) {
            log("Inventory is growing (" + secondsLeft + " seconds of stock), but cannot lower prices any further.");
        } else {
            //log("Automatically lowering price: " + secondsLeft + " seconds of inventory.");
            //click(btn);
            lowerPrice();
        }
        if (secondsLeft > 30) {
            setTimeout(adjustPrice, 1000);
        } else {
            setTimeout(adjustPrice, 5000);
        }
    } else {
        setTimeout(adjustPrice, 500);
    }
}

function computeOps() {
    var opacity = 0;
    for (var chip = 0; chip < 10; chip++) {
        var chipId = "qChip" + chip;
        opacity += parseFloat(elem(chipId).style.opacity);
    }
    if (opacity > 0) {
        //click(elem("btnQcompute"));
        qComp();
    }
    setTimeout(computeOps, 60);
}

var strats = {};
function updateStrats() {
    for(var i = 0; i < 8; i++) {
        var res = elem("results" + i).innerText;
        var name_and_score = res.split(".")[1];
        var name = name_and_score.split(":")[0].trim();
        var score = parseInt(name_and_score.split(":")[1].trim());
        if (! strats[name]) {
            strats[name] = 0;
        }
        strats[name] += score;
    }
}

function bestStrat() {
    var bestStrat = "";
    var bestScore = 0;
    for(var strat in strats) {
        if(strats[strat] > bestScore) {
            bestStrat = strat;
            bestScore = strats[strat];
        }
    }
    return bestStrat;
}

function waitForTournament() {
    var tournamentAvailable = ! elem("btnNewTournament").disabled;
    if (tournamentAvailable) {
        var stratPicker = elem('stratPicker');
        var prevStrat = stratPicker.options[stratPicker.selectedIndex].innerText;
        updateStrats();
        var newStrat = bestStrat();
        if (prevStrat != newStrat) {
            log("Switching strategies: " + newStrat + " beats " + prevStrat);
            for (var i = 0; i < stratPicker.options.length; i++) {
                if(newStrat == stratPicker.children[i].innerText) {
                    stratPicker.selectedIndex = i;
                }
            }
        }
        setTimeout(runTournaments, 3000);
    } else {
        setTimeout(waitForTournament, 100);
    }
}

function waitForSpace() {
    if (!isDesigningProbe()) {
        setTimeout(waitForSpace, 1000);
    } else {
        runTournaments();
    }
}

function runTournaments() {
    if (!isInBusiness() && !isDesigningProbe()) {
        log("Yomi is no longer needed, pausing up on tournaments.");
        waitForSpace();
        return;
    }
    var tournamentAvailable = ! elem("btnNewTournament").disabled;
    var runAvailable = ! elem("btnRunTournament").disabled;
    if(tournamentAvailable) {
        newTourney();
        setTimeout(runTournaments, 100);
    } else if(runAvailable) {
        var stratPicker = elem('stratPicker');
        if (stratPicker.selectedIndex == 0) {
            log("No strategy selected - picking the first strategy.");
            stratPicker.selectedIndex = 1;
        }
        runTourney();
        setTimeout(waitForTournament, 1000);
    } else {
        setTimeout(runTournaments, 100);
    }
}

function startAutoTuneSwarm() {
    elem("slider").value = elem("slider").max;
    autoTuneSwarm();
}

function autoTuneSwarm() {
    var planetDepleted = elem("availableMatterDisplay").innerText == "0";
    var outOfMatter = elem("acquiredMatterDisplay").innerText == "0";
    var outOfWire = elem("nanoWire").innerText == "0";
    var slider = elem("slider");
    var value = parseInt(slider.value);
    var min = parseInt(slider.min);
    var max = parseInt(slider.max);

    if (planetDepleted) {
        slider.value = max;
    } else if (/*outOfMatter ||*/ outOfWire) {
        if (value > min) {
            slider.value = value - 1;
        }
    } else {
        if (value < max) {
            slider.value = value + 1;
        }
    }
    setTimeout(autoTuneSwarm, 150);
}

function init() {
    createLog();
    log("Initializing bot.");
    buyWire();
    adjustPrice();
    computeOps();
    runTournaments();
    startAutoTuneSwarm();
}

(function() {
    'use strict';
    setTimeout(init, 8000);
    //makePaperclip(200);
})();
