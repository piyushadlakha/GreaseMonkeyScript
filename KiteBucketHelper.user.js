// ==UserScript==
// @name         Kite Bucket Helper
// @downloadURL  
// @updateURL    
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://kite.zerodha.com/orders/baskets
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zerodha.com
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
    'use strict';

    var enableDelete = false

    function handleNewModalAdded(mutationsList, observer) {
        mutationsList.forEach((mutation) => {
            if (mutation.type === 'childList') {
                // Check if a new node has been added to the document
                mutation.addedNodes.forEach((node) => {
                    // Check if the added node is a modal element (you can use any criteria to identify modal elements)
                    //console.log(node)
                    if (node.tagName === 'FORM') {// && node.classList === 'order-window layer-2 place buy') {
                        // Execute your function here when a new modal is added

                        var submitButton = node.querySelectorAll('button')[1]
                        var submitButtonType = submitButton.children[0].innerText
                        //if(document.getElementById('AutoAddToggle').checked) {
                        if(submitButtonType == 'Add') {
                            var priceDiv = node.querySelector('header').children[1].children[0]
                            var isCE = node.querySelector('header').children[0].children[0].children[0].children[0].innerText.includes("CE")
                            priceDiv.id = "myPriceDiv"

                            var intervalId = setInterval(function() {
                                if (node.querySelector('#myPriceDiv').innerText !== 'N/A') {

                                    clearInterval(intervalId);

                                    var bucketName = getBucketName()
                                    var isAmo = bucketName.includes("AMO")
                                    var isNifty50 = bucketName.startsWith("NIFTY 50")
                                    if (isAmo) {
                                        var amoNode = node.querySelectorAll('.variety .type.su-radio-wrap')[2].querySelector('input')
                                        amoNode.click() // For AMO
                                    } else {
                                        var regularNode = node.querySelectorAll('.variety .type.su-radio-wrap')[1].querySelector('input')
                                        regularNode.click() // For AMO
                                    }

                                    var buySellSwitch = node.querySelector('.tx-toggle .su-switch-group').querySelector('input')
                                    buySellSwitch.click();

                                    var checkboxes = node.querySelectorAll('.su-checkbox-group')

                                    checkboxes.forEach(function (element) {
                                        element.querySelector('input').click()
                                    })

                                    var maxLossPerShare = 300
                                    var currentOptionPriceString = node.querySelector('#myPriceDiv').innerText;
                                    var currentOptionPrice = parseFloat(currentOptionPriceString.match(/[\d.]+/)[0]);
                                    var stopLossOptionPrice = maxLossPerShare + currentOptionPrice
                                    var stopLossPercentValue = Math.round(stopLossOptionPrice*100/currentOptionPrice)

                                    var radioButtonIndex = isAmo ? 1 : 0
                                    var limitRadio = node.querySelectorAll('.su-radio-group.order-type .su-radio-wrap')[radioButtonIndex].querySelector('input') // 1 for AMO
                                    limitRadio.click()

                                    var qtyNode = node.querySelectorAll('.no.su-input-group.su-static-label')[0].querySelector('input')
                                    //node.querySelectorAll('button')[0].click()
                                    //console.log(node.querySelectorAll('.no.su-input-group.su-static-label'))
                                    qtyNode.value = parseInt(document.querySelector('#QtyValue').value)

                                    var event = new Event('input', { bubbles: true });
                                    qtyNode.dispatchEvent(event);
                                    // For AMO
                                    if (isAmo) {
                                        var limitNode = node.querySelectorAll('.no.su-input-group.su-static-label')[1].querySelector('input')
                                        var limitValue = currentOptionPrice - currentOptionPrice*.4
                                        if (currentOptionPrice < 50) {
                                            limitValue = currentOptionPrice - 20
                                        }
                                        if (limitValue < 0) {
                                            limitValue = 1
                                        }
                                        limitNode.value = Math.ceil(limitValue*20)/20

                                        qtyNode.dispatchEvent(event);
                                        limitNode.dispatchEvent(event);
                                    } else {
                                        var inputBoxes = node.querySelector('.gtt').querySelectorAll('.su-input-group')
                                        var stopLossInputBox = inputBoxes[0].querySelector('input')
                                        var targetInputBox = inputBoxes[1].querySelector('input')
                                        stopLossInputBox.value = stopLossPercentValue
                                        targetInputBox.value = -98

                                        qtyNode.dispatchEvent(event);
                                        stopLossInputBox.dispatchEvent(event);
                                        targetInputBox.dispatchEvent(event);
                                    }

                                    node.querySelectorAll('button')[1].click()
                                    if (isCE) {
                                        executeAdd("PE")
                                    }


                                }
                            }, 500);
                        }
                        // Call your custom function or perform any actions here
                    }
                    // Add
                    else if (document.getElementById('AutoAddToggle') && document.getElementById('AutoAddToggle').checked && node.classList && node.classList.contains('omnisearch-results')) {
                        var tradingSymbols = node.querySelectorAll('li')

                        if (tradingSymbols.length>0) {
                            var indexValue = 0 //document.querySelector('#IndexInputClickValue').value
                            tradingSymbols[indexValue].click()
                        }

                    }
                    // Delete
                    else if (document.getElementById('AutoDeleteToggle') && document.getElementById('AutoDeleteToggle').checked && node.classList && node.classList.contains('row-actions')) {
                        node.children[2].click()
                        deleteAll()
                    }
                    else if (false && node.classList && node.classList.contains('modal-mask') && node.classList.contains('baskets-modal')) {
                        var searchStrikeField = node.querySelector('.su-input-group.su-has-icon.search-input-field').querySelector('input');
                        var bucketName = getBucketName().split('Short')[0]
                        searchStrikeField.value = bucketName + "44000PE"
                        searchStrikeField.click()
                        searchStrikeField.focus()
                        var event = new Event('input', { bubbles: true });
                        searchStrikeField.dispatchEvent(event);
                    }
                });
            }
        });
    }


    // Options for the Mutation Observer (observe changes in the document's body)
    const observerOptions = {
        childList: true, // Watch for child node additions
        subtree: true,
    };

    // Create a new Mutation Observer and start observing
    const observer = new MutationObserver(handleNewModalAdded);
    observer.observe(document.body, observerOptions);


    setTimeout(function () {
        var bucketElements = document.querySelectorAll('.basket-name');
        bucketElements.forEach(function (element) {
            element.addEventListener('click', function(){
                setTimeout(function() {
                    createPeCeFields()
                }, 500)
            })
        })

        setTimeout(function() {

            var toggleDiv = document.createElement('span');
            toggleDiv.style.padding = '10px'

            var toggleAddDiv = document.createElement('span');
            toggleAddDiv.style.padding = '10px'

            var toggleAdd = document.createElement('input');
            toggleAdd.type = 'checkbox';
            toggleAdd.id = 'AutoAddToggle';
            toggleAdd.checked = false;
            toggleAdd.style.margin = '10px'

            var labelAdd = document.createElement('label');
            labelAdd.textContent = 'Add';
            labelAdd.setAttribute('for', 'AutoAddToggle');
            labelAdd.style.fontSize = '16px'

            toggleAddDiv.appendChild(toggleAdd)
            toggleAddDiv.appendChild(labelAdd)


            var toggleDeleteDiv = document.createElement('span');

            var toggleDelete = document.createElement('input');
            toggleDelete.type = 'checkbox';
            toggleDelete.label = "Delete";
            toggleDelete.id = 'AutoDeleteToggle';
            toggleDelete.checked = false;
            toggleDelete.style.margin = '10px'

            var labelDelete = document.createElement('label');
            labelDelete.textContent = 'Delete';
            labelDelete.setAttribute('for', 'AutoDeleteToggle');
            labelDelete.style.fontSize = '16px'

            toggleDeleteDiv.appendChild(toggleDelete)
            toggleDeleteDiv.appendChild(labelDelete)

            var toggleAutoAdd = document.createElement('button');
            toggleAutoAdd.id = 'AutoAddAllToggle';
            toggleAutoAdd.style.margin = '10px'
            toggleAutoAdd.innerText = 'Auto Add'
            toggleAutoAdd.addEventListener('click', clickAllBasketsForAdd)


            var toggleAutoDelete = document.createElement('button');
            toggleAutoDelete.id = 'AutoDeleteAllToggle';
            toggleAutoDelete.style.margin = '10px'
            toggleAutoDelete.innerText = 'Auto Delete'
            toggleAutoDelete.addEventListener('click', clickAllBasketsForDelete)

            var toggleExecuteCurrent = document.createElement('button');
            toggleExecuteCurrent.id = 'ExecuteCurrentToggle';
            toggleExecuteCurrent.style.margin = '10px'
            toggleExecuteCurrent.style.marginTop = '30px'
            toggleExecuteCurrent.innerText = 'Execute Current'
            toggleExecuteCurrent.addEventListener('click', executeCurrent)


            var indexInputDiv = document.createElement('span');

            var indexInputElement = document.createElement('input');
            indexInputElement.type = 'input';
            indexInputElement.value = 0;
            indexInputElement.id = 'IndexInputClickValue';
            indexInputElement.style.margin = '10px'
            indexInputElement.style.height = '35px'
            indexInputElement.style.width = '35px'
            indexInputElement.style.textAlign = 'center'

            indexInputDiv.appendChild(indexInputElement)

            var atmDiffDiv = document.createElement('span');

            var atmDiffElement = document.createElement('input');
            atmDiffElement.type = 'input';
            atmDiffElement.value = 200;
            atmDiffElement.id = 'ATMDiffValue';
            atmDiffElement.style.margin = '10px'
            atmDiffElement.style.height = '35px'
            atmDiffElement.style.width = '35px'
            atmDiffElement.style.textAlign = 'center'

            atmDiffDiv.appendChild(atmDiffElement)

            var qtyDiffDiv = document.createElement('span');

            var qtyDiffElement = document.createElement('input');
            qtyDiffElement.type = 'input';
            qtyDiffElement.value = 10;
            qtyDiffElement.id = 'QtyValue';
            qtyDiffElement.style.margin = '10px'
            qtyDiffElement.style.height = '35px'
            qtyDiffElement.style.width = '35px'
            qtyDiffElement.style.textAlign = 'center'

            qtyDiffDiv.appendChild(qtyDiffElement)


            toggleDiv.appendChild(toggleAddDiv)
            toggleDiv.appendChild(toggleDeleteDiv)
            toggleDiv.appendChild(toggleAutoDelete)
            toggleDiv.appendChild(toggleAutoAdd)
            //toggleDiv.appendChild(indexInputDiv)
            toggleDiv.appendChild(atmDiffDiv)
            toggleDiv.appendChild(qtyDiffDiv)
            toggleDiv.appendChild(toggleExecuteCurrent)

            document.querySelector('.baskets-list .toolbar').appendChild(toggleDiv)

            //document.querySelector('.baskets-list .toolbar').appendChild(toggleAdd)
            //document.querySelector('.baskets-list .toolbar').appendChild(labelAdd)
            //document.querySelector('.baskets-list .toolbar').appendChild(toggleDelete)
            //document.querySelector('.baskets-list .toolbar').appendChild(labelDelete)

        }, 1000)
    }, 1000)

    function executeCurrent() {
        var bucketElements = document.querySelectorAll('.basket-name');
        var basketIndex = bucketElements.length-1
        for ( ; basketIndex>=0 ; basketIndex--) {
            if(bucketElements[basketIndex].innerText.trim().includes("Current")) {
                break
            }
        }
        document.querySelector('#AutoDeleteToggle').click();
        bucketElements[basketIndex].click();
        setTimeout(function() {
            var footerClickButtons = document.querySelectorAll('.modal-footer button')
            footerClickButtons[footerClickButtons.length-1].click()
            document.querySelector('#AutoDeleteToggle').click();
            setTimeout(function() {
                document.querySelector('#AutoAddToggle').click();
                bucketElements[basketIndex].click();
                setTimeout(function() {
                    var footerClickButtons = document.querySelectorAll('.modal-footer button')
                    footerClickButtons[footerClickButtons.length-1].click()
                    document.querySelector('#AutoAddToggle').click();
                }, 5000)
            }, 200)
        }, 2000)

    }

    function clickAllBasketsForAdd() {
        document.querySelector('#AutoAddToggle').click();
        console.log(document.querySelector('#AutoAddToggle').checked)
        var bucketElements = document.querySelectorAll('.basket-name');
        clickBasket(0,bucketElements.length, 5000)
    }
    function clickAllBasketsForDelete() {
        document.querySelector('#AutoDeleteToggle').click();
        console.log(document.querySelector('#AutoDeleteToggle').checked)
        var bucketElements = document.querySelectorAll('.basket-name');
        clickBasket(0,bucketElements.length, 2000)
    }

    function clickBasket(i,total, timeout) {
        if (i>=total) {
            return
        }
        var filterValue = document.querySelectorAll('.toolbar .search-input.su-input-group input')[0].value
        var bucketElements = document.querySelectorAll('.basket-name');
        if(bucketElements[i].innerText.trim().includes(filterValue)) {
            bucketElements[i].click();
            setTimeout(function() {
                var footerClickButtons = document.querySelectorAll('.modal-footer button')
                footerClickButtons[footerClickButtons.length-1].click()
                setTimeout(function() {clickBasket(i+1, total, timeout)}, 200);
            }, timeout)
        } else {
            clickBasket(i+1, total, timeout)
        }
    }

    function executeAdd(key) {

        var bucketName = getBucketName()
        var prefixMap = {
            "NIFTY BANK": "BANKNIFTY",
            "NIFTY 50": "NIFTY"
        }
        var prefix = ""
        for (let key in prefixMap) {
            if (bucketName.startsWith(key)) {
                prefix = prefixMap[key]
            }
        }

        if (!document.getElementById('AutoAddToggle').checked || document.querySelectorAll('.basket-table table').length > 0 ) {
            return
        }
        var modalLayerContainer = document.querySelector('.modal-container.layer-2')
        var searchStrikeField = modalLayerContainer.querySelector('.instrument-search .omnisearch input');
        var value = prefix + " " + modalLayerContainer.querySelector("#"+key+"Strike").innerText.split("-")[1].trim()
        //console.log(searchStrikeField)
        //captureAllEvents(searchStrikeField)

        searchStrikeField.value = value
        setTimeout(function() {
            searchStrikeField.dispatchEvent(new InputEvent("input"))
        }, 500)
    }

    function deleteAll() {
        if (!document.getElementById('AutoDeleteToggle').checked) {
            return
        }
        var modalElement = document.querySelector('.modal-container.layer-2')

        var rows = modalElement.querySelectorAll('.draggable-row')
        if (rows.length > 0) {
            setTimeout(function() {
                rows[0].dispatchEvent(new MouseEvent('mouseenter'))
            }, 500)
        }
    }

    function createPeCeFields() {

        // Find the element you want to click on (replace 'elementSelector' with the actual CSS selector)
        var watchListPrices = document.querySelectorAll('.instruments .last-price')
        var watchListNames = document.querySelectorAll('.instruments .nice-name')


        //console.log(atmStrikePrice)

        var modalElement = document.querySelector('.modal-container.layer-2');

        var header = modalElement.querySelector('.name.su-input-group.disabled')

        var element = modalElement.querySelector('input');
        //var element = elements[elements.length - 1]
        var bucketName = element.value
        var priceToUse = 0
        var strikeLength = 100.0
        var atmDiff = parseInt(document.querySelector('#ATMDiffValue').value)
        for (var wInd = 0;wInd<watchListNames.length;wInd++) {
            if (bucketName.startsWith(watchListNames[wInd].innerText.trim())) {
                priceToUse = watchListPrices[wInd].innerText.trim()
                break
            }
        }
        if (bucketName.startsWith("NIFTY 50")) {
            strikeLength = 50.0
            //atmDiff = 300
        }
        //var bankNiftyPrice = parseFloat(watchListPrices[watchListPrices.length - 1].innerText.trim())
        var atmStrikePrice = Math.round(priceToUse / strikeLength) * strikeLength
        //console.log(priceToUse)
        //console.log(bucketName)
        var atmUpdate = 0
        if (bucketName.includes('ATM+')) {
            atmUpdate = parseInt(bucketName.split('ATM+')[1].trim())
        } else if (bucketName.includes('ATM +')) {
            atmUpdate = parseInt(bucketName.split('ATM +')[1].trim())
        } else if(bucketName.includes('ATM-')) {
            atmUpdate = parseInt(bucketName.split('ATM-')[1].trim())*-1
        } else if(bucketName.includes('ATM -')) {
            atmUpdate = parseInt(bucketName.split('ATM -')[1].trim())*-1
        }
        //console.log(atmUpdate)

        var finalATM = atmStrikePrice + atmUpdate
        var peStrike = finalATM - atmDiff
        var ceStrike = finalATM + atmDiff

        var currentPrice = document.createElement('div');
        currentPrice.className = 'columns three'
        currentPrice.innerHTML = "Current Price - " + priceToUse.toString()

        var currentATM = document.createElement('div');
        currentATM.className = 'columns three'
        currentATM.innerHTML = "Current ATM - " + atmStrikePrice.toString()

        var newATM = document.createElement('div');
        newATM.className = 'columns two'
        newATM.innerHTML = "New ATM - " + finalATM.toString()

        var peStrikeDiv = document.createElement('div');
        peStrikeDiv.className = 'columns two'
        peStrikeDiv.id = "PEStrike"
        peStrikeDiv.innerHTML = "PE - " + peStrike.toString() + "PE"

        var ceStrikeDiv = document.createElement('div');
        ceStrikeDiv.className = 'columns two'
        ceStrikeDiv.id = "CEStrike"
        ceStrikeDiv.innerHTML = "CE - " + ceStrike.toString() + "CE"

        var strikeDiv = document.createElement('div');
        strikeDiv.className = 'row'
        strikeDiv.appendChild(currentPrice)
        strikeDiv.appendChild(currentATM)
        strikeDiv.appendChild(newATM)
        strikeDiv.appendChild(peStrikeDiv)
        strikeDiv.appendChild(ceStrikeDiv)

        var modalHeader = modalElement.querySelector('.modal-header');
        modalHeader.appendChild(strikeDiv)

        executeAdd("CE")
        deleteAll()

    }

    function getBucketName() {
        var modalElement = document.querySelector('.modal-container.layer-2');
        var element = modalElement.querySelector('input');
        return element.value;
    }














    function simulateKeyboard(inputElement, textToType) {

        setTimeout(function () {
            //            inputElement.value = textToType
            for (var i = 0; i < textToType.length; i++) {
                inputElement.value += textToType[i];
                var keyEvent = new KeyboardEvent("keydown", {
                    key: textToType[i],
                    bubbles: true,
                    cancelable: true,
                    isTrusted: true,
                    code: 'Digit'+textToType[i],
                    composed: true,
                    keyCode: textToType[i].charCodeAt(0),
                    view: window
                });
                inputElement.dispatchEvent(keyEvent);

                keyEvent = new KeyboardEvent("keypress", {
                    key: textToType[i],
                    bubbles: true,
                    cancelable: true,
                    isTrusted: true,
                    code: 'Digit'+textToType[i],
                    composed: true,
                    keyCode: textToType[i].charCodeAt(0),
                    view: window
                });
                inputElement.dispatchEvent(keyEvent);

                keyEvent = new KeyboardEvent("keyup", {
                    key: textToType[i],
                    bubbles: true,
                    cancelable: true,
                    isTrusted: true,
                    code: 'Digit'+textToType[i],
                    composed: true,
                    keyCode: textToType[i].charCodeAt(0),
                    view: window
                });
                inputElement.dispatchEvent(keyEvent);
            }

            var event = new Event('input', { bubbles: true });
            inputElement.dispatchEvent(event);
        }, 1000)
    }

    function simulateMouseClick(inputElement) {
        setTimeout(function () {
            var mouseDownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            // Create a mouse up event
            var mouseUpEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            // Dispatch the mouse down event on the input element
            inputElement.dispatchEvent(mouseDownEvent);

            // Dispatch the mouse up event on the input element
            inputElement.dispatchEvent(mouseUpEvent);
        }, 1000)
    }

    function captureAllEvents(inputElement) {
        if (inputElement) {
            console.log(Object.keys(window))
            const allEventTypes = Object.keys(window).filter(key => key.startsWith('on'));
            console.log(allEventTypes)
            // Add event listeners for all event types
            allEventTypes.forEach(eventType => {
                inputElement.addEventListener(eventType.slice(2), function(event) {
                    console.log(`Event type: ${eventType.slice(2)}`);
                    console.log(event);
                    // Add your custom event handling code here
                });
            });


            // You can add more event listeners for other keyboard events as needed
        } else {
            console.error("Input element not found.");
        }
    }

    // Your code here...
})();
