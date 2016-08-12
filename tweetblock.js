// ==UserScript==
// @name        Promoted tweet block
// @namespace   org.fixnum.tweetblock
// @include     https://twitter.com/*
// @version     2
// @grant       none
// ==/UserScript==

function removeTweets() {
  var tweets = document.getElementsByClassName("tweet");
  var removed = 0;
  for(tweetIdx = 0; tweetIdx < tweets.length; tweetIdx++) {
    var tweet = tweets[tweetIdx];
    if(tweet.hasAttribute("data-advertiser-id") && tweet.style.display != "none") {
      tweet.style.display = "none";
      removed += 1;
    }
  }
  // if (removed > 0) alert("Removed " + removed + " advertisement tweets.");
  window.setTimeout(removeTweets, 1000);
};

removeTweets();
