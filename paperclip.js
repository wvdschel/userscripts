// ==UserScript==
// @name         Paperclip Factory!
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://www.decisionproblem.com/paperclips/index2.html
// @grant        none
// ==/UserScript==

function checkBox(id, label_text) {
    var p = document.createElement('p');
    var cb = document.createElement('input');
    var label = document.createElement('label');
    cb.type = "checkbox";
    cb.checked = false;
    cb.id = id;
    label.appendChild(cb);
    label.appendChild(document.createTextNode(label_text));
    p.appendChild(label);
    return p;
}

function createInterface() {
    var console = elem("consoleDiv");
    var botDiv = document.createElement('div');
    botDiv.id = 'botDiv';
    botDiv.style.float = 'right';
    botDiv.style.width = '40%';

    botDiv.appendChild(checkBox('makePaperclip', 'Automatically make single paperclips'));
    botDiv.appendChild(checkBox('adjustPrice', 'Automatically adjust prices'));
    botDiv.appendChild(checkBox('buyWire', 'Buy wire at good prices'));
    botDiv.appendChild(checkBox('expandMem', 'Automatically expand memory'));
    botDiv.appendChild(checkBox('expandProc', 'Automatically expand processors'));
    botDiv.appendChild(checkBox('computeOps', 'Quantum computer sysadmin'));
    botDiv.appendChild(checkBox('runTournaments', 'Run tournaments and pick winners'));
    botDiv.appendChild(checkBox('depositFunds', 'Invest savings'));
    botDiv.appendChild(checkBox('withdrawFunds', 'Withdraw all funds from the investment bank'));
    botDiv.appendChild(checkBox('adjustSwarm', 'Tune swarm computing for maximum production'));

    var botLog = document.createElement('p');
    botLog.className = "consoleOld";
    botLog.id = "botLog";
    botDiv.appendChild(botLog);

    elem('page').appendChild(botDiv);
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
    if(msgs.length > 30) {
        msgs = msgs.slice(0, 30);
    }
    msgs = [message].concat(msgs);
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

function isInvesting() {
    return elem("investmentEngine").style.display != "none";
}

function isDesigningProbe() {
    return elem("probeDesignDiv").style.display != "none";
}

function canRunTournament() {
    return elem("strategyEngine").style.display != "none";
}

function hasSwarm() {
    return elem("swarmEngine").style.display != "none";
}

function hasQuantumComputer() {
    return elem("qComputing").style.display != "none";
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

function makePaperclip() {
    if (! elem('makePaperclip').checked) {
        setTimeout(makePaperclip, 1000);
        return;
    }
    var unsoldStock = parseNumericValue(elem("unsoldClips"));
    if (unsoldStock > 2000) {
        elem('makePaperclip').checked = false;
        log("No point in making paperclips by hand anymore, giving up.");
    }
    clipClick(1);
    setTimeout(makePaperclip, 200);
}

var wireLow = 16;
function buyWire_() {
    if (! elem('buyWire').checked) {
        setTimeout(buyWire_, 100);
        return;
    }
    if (!isManufacturing()) {
        log("No longer manufacturing, giving up on buying wire.");
        elem('buyWire').checked = false;
        elem('buyWire').disabled = true;
        return;
    }
    var repeatTime = 500;
    var btn = elem("btnBuyWire");
    var wireLeft = parseNumericValue(elem("wire"));
    var wirePrice = parseNumericValue(elem("wireCost"));
    var wireRate = parseNumericValue(elem("clipmakerRate"));
    var secondsLeft = wireLeft / wireRate;
    if (! btn.disabled) {
        if (secondsLeft < 120 && wirePrice < wireLow * 0.9) {
            //click(btn);
            buyWire();
            repeatTime = 10;
        } else if (secondsLeft < 5 || wireLeft < 250) {
            //log("Only " + secondsLeft + " seconds of wire left - automatically buying wire for $" + wirePrice);
            buyWire();
        }
    }
    wireLow = (wireLow * 0.985 + wirePrice * 0.015);
    setTimeout(buyWire_, repeatTime);
}

function adjustPrice() {
    if (! elem('adjustPrice').checked) {
        setTimeout(adjustPrice, 100);
        return;
    }
    if (!isInBusiness()) {
        log("No longer doing business, giving up on selling paperclips.");
        elem('adjustPrice').checked = false;
        elem('adjustPrice').disabled = true;
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
    var checkbox = elem('computeOps');
    if (hasQuantumComputer() && checkbox.disabled) {
        log("Unlocking computer automation.");
        checkbox.disabled = false;
    }
    if (!hasQuantumComputer() && !checkbox.disabled) {
        log("No quantum computer available.");
        checkbox.disabled = true;
    }
    if (! checkbox.checked) {
        setTimeout(computeOps, 100);
        return;
    }
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
        if (name_and_score) {
            var name = name_and_score.split(":")[0].trim();
            var score = parseInt(name_and_score.split(":")[1].trim());
            if (! strats[name]) {
                strats[name] = 0;
            }
            strats[name] += score;
        }
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
        elem('runTournaments').checked = true;
    }
}

function runTournaments() {
    var checkbox = elem("runTournaments");
    if (canRunTournament() && checkbox.disabled) {
        log("Unlocking tournament automation.");
        checkbox.disabled = false;
    }
    if (!canRunTournament() && !checkbox.disabled) {
        log("No tournament engine available.");
        checkbox.disabled = true;
    }
    if (! checkbox.checked) {
        setTimeout(runTournaments, 100);
        return;
    }

    var yomiCount = parseNumericValue(elem('yomiDisplay'));
    if (!isInBusiness() && !isDesigningProbe() && yomiCount > 1000000) {
        log("Yomi is no longer needed, pausing tournaments.");
        elem('runTournaments').checked = false;
        waitForSpace();
        setTimeout(runTournaments, 100);
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
    var swarmBox = elem("adjustSwarm");
    if (hasSwarm() && swarmBox.disabled) {
        log("Swarm created - unlocking swarm tuning.");
        swarmBox.disabled = false;
    }
    if (!hasSwarm() && !swarmBox.disabled) {
        log("No swarm active - locking swarm tuning.");
        swarmBox.disabled = true;
    }
    if (swarmBox.checked) {
        var amountOfNanoWire = elem("nanoWire").innerText;
        var planetDepleted = elem("availableMatterDisplay").innerText == "0" && elem("acquiredMatterDisplay").innerText == "0";
        var outOfMatter = elem("acquiredMatterDisplay").innerText == "0";
        var outOfWire = amountOfNanoWire == "0" ||
            amountOfNanoWire.indexOf(" billion ") >= 0  ||
            amountOfNanoWire.indexOf(" trillion ") >= 0;
        var productionBalanced = amountOfNanoWire.indexOf(" quadrillion ") >= 0;
        var slider = elem("slider");
        var value = parseInt(slider.value);
        var min = parseInt(slider.min) + 15;
        var max = parseInt(slider.max);

        if (planetDepleted) {
            if (value < max) {
                slider.value = value + 1;
            }
        } else if (/*outOfMatter ||*/ outOfWire) {
            if (value > min) {
                slider.value = value - 1;
            }
        } else if(!productionBalanced) {
            if (value < max) {
                slider.value = value + 1;
            }
        }
    }
    setTimeout(autoTuneSwarm, 100);
}

var withdrawingFunds = false;
function hedgeFundManager() {
    var repeatTime = 1000;
    var withdrawBox = elem('withdrawFunds');
    var depositBox = elem('depositFunds');
    if (isInvesting()) {
        if (withdrawBox.disabled) {
            log("Investment bank is available, enabling investment options.");
            withdrawBox.disabled = false;
            depositBox.disabled = false;
        }
        if (depositBox.checked && withdrawBox.checked) {
            if(withdrawingFunds) {
                log("Cannot withdraw and deposit at the same time, stopping withdrawal");
                withdrawBox.checked = false;
            } else {
                log("Cannot withdraw and deposit at the same time, stopping deposits");
                depositBox.checked = false;
            }
        }
        withdrawingFunds = withdrawBox.checked;
        if (withdrawBox.checked) {
            investWithdraw();
            repeatTime = 100;
        }
        if (depositBox.checked) {
            investDeposit();
            repeatTime = 10000;
        }
    } else if (!withdrawBox.disabled) {
        log("Investment bank is not available, disabling investment options.");
        withdrawBox.checked = false;
        withdrawBox.disabled = true;
        depositBox.checked = false;
        depositBox.disabled = true;
        repeatTime = 1000;
    }
    setTimeout(hedgeFundManager, repeatTime);
}

function expandComputer() {
    var procButton = elem("btnAddProc");
    var memButton = elem("btnAddMem");
    var repeatTime = 1000;
    var procBox = elem('expandProc');
    var memBox = elem('expandMem');
    if (hasQuantumComputer() && procBox.disabled) {
        log("Unlocking computer expansion.");
        procBox.disabled = false;
        memBox.disabled = false;
    }
    if (!hasQuantumComputer() && !procBox.disabled) {
        procBox.disabled = true;
        memBox.disabled = true;
    }

    if(elem("expandMem").checked) {
        if(!memButton.disabled) {
            repeatTime = 30;
            addMem();
        }
    }

    if(elem("expandProc").checked) {
        if(!procButton.disabled) {
            repeatTime = 30;
            addProc();
        }
    }
    setTimeout(expandComputer, repeatTime);
}

function init() {
    createInterface();
    log("Initializing bot.");
    makePaperclip();
    buyWire_();
    adjustPrice();
    computeOps();
    expandComputer();
    runTournaments();
    hedgeFundManager();
    startAutoTuneSwarm();
}

(function() {
    'use strict';
    setTimeout(init, 8000);
})();
