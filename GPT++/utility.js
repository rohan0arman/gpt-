function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let currentTooltipEnd = Promise.resolve();
/**
 * It creates a new tooltip element, adds it to the DOM, and then removes it after 1.5 seconds.
 *    showes a tooltip message with fading effect
 * @param massage - The text to display in the tooltip.
 */
async function showFadedTooltip(massage, color = '') {
    await currentTooltipEnd

    const tooltip = document.createElement('div');
    tooltip.setAttribute('id', 'tooltip');
    tooltip.style.color = color;
    tooltip.textContent = massage.trim();
    document.querySelector('main').prepend(tooltip);
    currentTooltipEnd = new Promise(resolve => {
        setTimeout(() => {
            tooltip.remove();
            resolve();
        }, 1500);
    })
}


function findElementByText(elementType, text, scopeElement = document) {
    text = text.trim();
    let elementArray = scopeElement.querySelectorAll(elementType);
    //console.log(elementArray);
    for (i = 0; i < elementArray.length; i++) {
        //console.log(elementArray[i])
        if (elementArray[i].innerText == text || elementArray[i].value == text) {
            return elementArray[i];
        }
    }
}

async function findElementByQuery(query, intervalTime = 1000, repetationLimit = null) {
    return new Promise((resolve, reject) => {
        query = query.trim();
        if (repetationLimit) {
            const interval = setInterval(() => {
                if (repetationLimit == 0) {
                    clearInterval(interval);
                    console.log(`'${query}' element not found.`);
                    reject(null);
                } else {
                    console.log(`Searching the '${query}' element.`);
                    let result = document.querySelector(query);
                    repetationLimit--;
                    if (result) {
                        clearInterval(interval);
                        console.log(`Element found : ${result}`);
                        resolve(result);
                    }
                }
            }, intervalTime);
        } else {
            const interval = setInterval(() => {
                console.log(`Searching the '${query}' element .`)
                let result = document.querySelector(query);

                if (result) {
                    clearInterval(interval);
                    console.log(`Element found : ${result}`);
                    resolve(result);
                }
            }, intervalTime);
        }
    });
}

async function findElementByQuerySelectorAll(query, intervalTime = 1000, repetationLimit = null) {
    return new Promise((resolve, reject) => {
        query = query.trim();
        if (repetationLimit) {
            const interval = setInterval(() => {
                if (repetationLimit == 0) {
                    clearInterval(interval);
                    console.log(`'${query}' Element not found.`);
                    reject(null);
                } else {
                    console.log(`Searching the '${query}' element .`);
                    let result = document.querySelectorAll(query);
                    repetationLimit--;
                    if (result) {
                        clearInterval(interval);
                        console.log(`Element found : ${result}`);
                        resolve(result);
                    }
                }
            }, intervalTime);
        } else {
            const interval = setInterval(() => {
                console.log(`Searching the '${query}' element .`)
                let result = document.querySelectorAll(query);

                if (result) {
                    clearInterval(interval);
                    console.log(`'${query}' Element found `);
                    resolve(result);
                }
            }, intervalTime);
        }
    });
}

function autoWrite(text, inputElement, totalAnimationTime = 100) {
    return new Promise((resolve) => {
        const characters = text.split('');
        inputElement.focus();
        let index = 0;
        const inputInterval = setInterval(() => {
            if (index < characters.length) {
                inputElement.value += characters[index];
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                index++;
            } else {
                clearInterval(inputInterval);
                resolve();
            }
        }, totalAnimationTime / characters.length);
    });
}


function getStyledMarkupDocument() {
    // Get the entire page's HTML markup
    let styledMarkupDocument = document.documentElement.outerHTML;
    // Include the CSS stylesheets in the HTML markup
    for (let i = 0; i < document.styleSheets.length; i++) {
        let sheet = document.styleSheets[i];
        let rules = sheet.rules || sheet.cssRules;
        let css = '';
        for (let j = 0; j < rules.length; j++) {
            css += rules[j].cssText;
        }
        styledMarkupDocument += '<style type="text/css">' + css + '</style>';
    }
    return styledMarkupDocument;
}

function downloadAsHTML(event) {
    const styledMarkupDocument = getStyledMarkupDocument();
    // Create a download link element and trigger a click on it
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));
    downloadLink.setAttribute('download', `${document.title}.html`);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
