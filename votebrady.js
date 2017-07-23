// ==UserScript==
// @name        Brady Voter 9000
// @namespace   org.fixnum.bradyvoter
// @include     http://www.radiotimes.com/news/2017-07-21/radio-times-radio-and-podcast-champion-round-4-5
// @version     1
// @grant       none
// ==/UserScript==
function click(elem) {
    var click = document.createEvent("MouseEvents");
    click.initMouseEvent("click", true, true, window,
        0, 0, 0, 0, 0, false, false, false, false, 0, null);
    elem.dispatchEvent(click);
    elem.focus();
}

function voteBrady() {
    var done = false;
    var sleep_time = 500;

    var return_button = document.getElementsByClassName("pds-return-poll")[0];
    if (return_button != null) {
        unsafeWindow.console.log("Clicking return to poll.");
        click(return_button);
        done = true;
    }

    if (!done) {
        var labels = document.getElementsByTagName("label");
        for (var i = 0; i < labels.length; i++) {
            var l = labels[i];
            //unsafeWindow.console.log("Label text: <" + l.textContent + ">");

            if (l.textContent == "Brady Haran") {
                var radioID = l.getAttribute("for");
                unsafeWindow.console.log("Brady's radio button is " + radioID);
                var radio = document.getElementById(radioID);
                if (!radio.checked) {
                    unsafeWindow.console.log("Clicking Brady's label.");
                    click(l);
                    done = true;
                } else {
                    var links = document.getElementsByTagName("a");
                    for (var i = 0; i < links.length; i++) {
                        var link = links[i];
                        if (link.textContent == "Vote") {
                            unsafeWindow.console.log("Clicking Vote button.");
                            click(link);
                            sleep_time = 2500;
                            done = true;
                        }
                    }
                }
            }
        }
    }

    if (!done) {
        unsafeWindow.console.log("Didn't do anything this time around.");
    }

    window.setTimeout(voteBrady, sleep_time);
}

unsafeWindow.console.log("Vote go!");
window.setTimeout(voteBrady, 5000);
