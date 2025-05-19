// ==UserScript==
// @name         Kite Bucket Executor
// @downloadURL  https://github.com/piyushadlakha/GreaseMonkeyScript/raw/refs/heads/main/KiteBucketExecutor.user.js
// @updateURL    https://github.com/piyushadlakha/GreaseMonkeyScript/raw/refs/heads/main/KiteBucketExecutor.user.js
// @namespace    http://tampermonkey.net/
// @version      1
// @description  try to take over the world!
// @author       You
// @match        https://kite.zerodha.com/orders/baskets?*updateCurrent*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zerodha.com
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
    'use strict';
    const urlSearchParams = new URL(window.location.href).searchParams

    function clickExecuteCurrentToggle() {
        const button = document.getElementById("ExecuteCurrentToggle");
        const qty = urlSearchParams.get("executeQuantity") || 1;
        const strikeLength = urlSearchParams.get("executeStrikeLength") || 0;
        if (button) {
            document.querySelectorAll('.toolbar .search-input.su-input-group input')[0].value = "Current"
            console.log("Button found. Clicking...");
            document.getElementById("QtyValue").value = qty;
            document.querySelector('#ATMDiffValue').value = strikeLength;
            button.click();
            //setTimeout(function() {button.click()}, 3000);
        } else {
            console.warn("Button not found. Retrying in 3 seconds...");
            setTimeout(clickExecuteCurrentToggle, 3000);
        }
    }

    // Optional: Only run if executeCurrent=true is present in the URL
    const shouldExecute = urlSearchParams.get("updateCurrent") === "true";
    if (shouldExecute) {
        clickExecuteCurrentToggle();
    }

})();
