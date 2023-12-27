if (window.location.href.startsWith("https://chat.openai.com/")) {
  // When the window is fully loaded, execute the following functions
  window.onload = async () => {
    console.log('GPT++ Content.js loaded');

    /**
     * The function sleep() takes a parameter, ms, which is the number of milliseconds to wait before
     * resolving the promise.
     * @param ms - the number of milliseconds to be delayed.
     * @returns A promise that will resolve after the specified time.
     */
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
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

    function autoWrite(text, inputElement , totalAnimationTime = 100) {
      return new Promise((resolve) => {
        const characters = text.trim().split('');
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

    /* The above code is creating a function that adds an ID to the textarea and button elements. */
    function addIDToElements() {
      document.getElementById('prompt-textarea').setAttribute('id', 'inputTextarea');
      console.log(document.getElementById('inputTextarea'));
      document.querySelector('form div textarea + button').setAttribute('id', 'submitButton');
      console.log(document.getElementById('submitButton'));
    };

    //Creating a link element that links the `element-style.css`
    // const linkElement = document.createElement('link');
    // linkElement.rel = "stylesheet";
    // linkElement.type = "text/css";
    // linkElement.href = await chrome.runtime.getURL("gpt-style.css");
    // document.head.appendChild(linkElement);


    //Global Variables
    let currentIndex = -1;// Keep track of the currentIndex of questions
    // these two variable related to automode
    let autoModeActivated = false;
    let lines;
    let currentTooltipEnd = Promise.resolve();
    //USEFUL GLOBAL VARIABLE 
    let mainElement = document.querySelector('main');
    let formElement = document.querySelector('form');
    let inputTextarea = formElement.querySelector('form div textarea');
    let submitButton = formElement.querySelector('div textarea + button');
    let autoStopButton = document.getElementById('autoStopButton');
    let extBtnContainer = document.getElementById('extBtnContainer');
    // Create a variable for the auto stop button and initialize it to null


    //importing the SVG icons
    const icons = await import('./gpt-svgicon.js');
    const { showFadedTooltip, utterance , newSpeakerButton, getPlayPauseButton, getDownloadButton, getAutoStopButton } = await import('./gpt-utility.js');
    console.log({ icons });


    /**-- these functions are related to different button elements --**/
    /**
     * It returns a new button.
     * @returns The function newSpeakerButton() is being returned.
     */
    function getSpeakerButton() {
      return newSpeakerButton();
    }

    async function addSpeakerButtons(){
      const answerMarkdowns = await findElementByQuerySelectorAll('.markdown');
      //console.log(answerMarkdowns);
      if (answerMarkdowns) {
        answerMarkdowns.forEach(answerNode => {
          if(!answerNode.querySelector('.speakerButton')){
            answerNode.append(getSpeakerButton());
          }
        });
      }
    }

    /* Render the container and buttons */
    /**
     * If the `extBtnContainer` element does not exist in the DOM, create it and add it to the DOM.
     * Then add the `downloadButton` and `playPauseButton` to the `extBtnContainer` element.
     */
    async function renderExtBtnContainer() {
      // Check if the extBtnContainer element exists in the DOM
      extBtnContainer = document.getElementById('extBtnContainer');
      // If it does not exist, create a new one with id and class attributes
      if (extBtnContainer === null) {
        extBtnContainer = document.createElement('div');
        extBtnContainer.setAttribute('id', 'extBtnContainer');
        extBtnContainer.setAttribute('class', 'rounded-md cursor-pointer break-all group');
        document.body.append(extBtnContainer);
      }

      // Add the download button to the container
      extBtnContainer.append(getDownloadButton());
      // If speech synthesis is supported, add the `playPauseButton`
      if ('pause' in speechSynthesis) {
        extBtnContainer.append(getPlayPauseButton());
      } else {
        showFadedTooltip('PAUSE is not supported', 'red');
      }

      addSpeakerButtons();
    }
    // Call the function to render the extension buttons container
    renderExtBtnContainer();



    /* Here is the mutation observers */
    const mainElementObserver = new MutationObserver(async (mutations) => {
      console.log('mainElement updated : ', mutations);
      mainElement = document.querySelector('main');
      inputTextarea = formElement.querySelector('form div textarea');
      submitButton = formElement.querySelector('div textarea + button');

      speechSynthesis.cancel();
      // Add a `copyToClipboardButton` and `speakerButton` button to each answer node
      addSpeakerButtons();

      // Disconnect the previous loadingObserver and connect the `loadingObserver` to observe the 'submitButton' button for changes 
      loadingObserver.disconnect();
      loadingObserver.observe(submitButton, {
        attributes: false,
        childList: true,
        characterData: false,
      });
    });


    // Create a mutation observer for the markdown elements
    const markdownObserver = new MutationObserver((mutations) => {
      // Enable the autoStopButton with visual effects when token(word) generation started 
      if (!autoStopButton) {
        autoStopButton = document.getElementById('autoStopButton');
      }
      autoStopButton.disabled = false;
      autoStopButton.style.color = 'rgb(172, 172, 190)';
      autoStopButton.style.cursor = 'pointer';
      markdownObserver.disconnect();
    });


    // loadingObserver determine when to load the next question(if autoMode Activated) and when to render the buttons
    const loadingObserver = new MutationObserver(async (mutations) => {
      // Get all markdown elements that display answers
      let answerMarkdowns = document.querySelectorAll('.markdown');

      // Check if loading-animation has started
      if (mutations[1].addedNodes[0] === submitButton.querySelector('div.text-2xl')) {
        showFadedTooltip('Answer loading started...');
        console.log('Answer loading started...');
        if (autoModeActivated) {
          
          inputTextarea.disabled = true;
          //observe the `result-streaming` markdown element to observe the textloading
          markdownObserver.observe(document.querySelector('.result-streaming'), {
            childList: true,
            characterData: true,
            subtree: true
          });
        }
      }
      // Check if loading-animation has ended
      else if (mutations[1].addedNodes[0] === submitButton.querySelector('span')) {
        let continueGenerateButton = findElementByText('button', "Continue generating", document.querySelector('form'));
        if (continueGenerateButton) {
          showFadedTooltip('Continuing loading');
          continueGenerateButton.click();
          return;
        }
        //ELSE 
        showFadedTooltip('Answer loading ended...');
        console.log('Answer loading ended...');
        if (autoModeActivated) { //if automode activated 
          if (!autoStopButton) {
            console.error('`autoStopButton` not found');
          }
          if (!inputTextarea || !submitButton) {
            console.error('`inputTextarea/submitButton` not found');
            autoStopButton.click();
            return;
          }
          // Disable the `autoStopButton` with visual effects
          inputTextarea.disabled = false;
          autoStopButton.disabled = true;
          autoStopButton.style.color = 'rgba(100 , 100 , 100 , 1)';
          autoStopButton.style.cursor = 'not-allowed';
          //await sleep(250);//wait 250 ms before searching new question [this is optional for seafty purpous]
          currentIndex++;
          // Load next question if there are more questions
          if (currentIndex < lines.length) {
            let query = lines[currentIndex].trim();
            //inputTextarea.value = query;
            await autoWrite(query, inputTextarea);
            submitButton.click();
            console.log('searching : ',inputTextarea.value);
          } else {
            // if there are no more questions stop the Auto-Mode
            currentIndex = -1; //reset the currentIndex
            autoModeActivated = false; //set the autoModeActivated signal false
            autoStopButton.remove();// remove the autoStopbutton
            inputTextarea.disabled = false;
            inputTextarea.style.cursor = '';
          }
        }
        // these actions will be performed whether autoMode activated or not
        answerMarkdowns[answerMarkdowns.length - 1].append(getSpeakerButton());// Attach `speakerButton` to the last markdown element
        if (!answerMarkdowns[0].querySelector('.speakerButton')) {// Attach `speakerButton` to the first markdown element if they are not already there
          answerMarkdowns[0].append(getSpeakerButton());
        }
      }
      // If somethis wrong happened
      else {
        console.log('Unknown event happened...');
      }
    });
    // Start observing the `submitButton` to detect if loading animation started or not
    submitButton = document.querySelector('div textarea + button');
    loadingObserver.observe(submitButton, {
      attributes: false,
      childList: true,
      characterData: false,
    });

    // Create a MutationObserver for the '#__next' element to observe changes in its children
    const bodyObserver = new MutationObserver(async (mutations) => {
      console.log('mainObserver attached');
      mainElement = document.querySelector('main');
      mainElementObserver.observe(mainElement, {
        childList: true
      });

    });
    // Observe the '#__next' element for changes 
    bodyObserver.observe(document.getElementById('__next'), {
      attributes: false,
      childList: true,
      characterData: false
    });

    // Listen for connection from the popup
    chrome.runtime.onConnect.addListener(port => {
      if (port.name === "popup") {
        // When a message is received from the popup
        port.onMessage.addListener(async function (request) {
          // Activate auto mode and get the lines from the popup message
          if (autoModeActivated) { //if autoMode already activated ,let it complete
            showFadedTooltip('Already Auto-Mode activated...');
            return;
          }
          autoModeActivated = true;
          showFadedTooltip('Auto-Mode activated');
          lines = request.lines;
          console.log(lines);

          // Get inputTextarea and submitButton buttons
          inputTextarea = document.getElementById('prompt-textarea');
          if (!inputTextarea) {
            console.error('inputTextarea element not found');
            return;
          }
          submitButton = document.querySelector('div textarea + button'); // the button that immediately follows by a textarea and they has a parent div 
          if (!submitButton) {
            console.error('submitButton button not found');
            return;
          }
          const extBtnContainer = document.getElementById('extBtnContainer');
          if (!extBtnContainer) {
            console.error('extBtnContainer not found');
            return;
          }
          // Render and get the `autoStopButton`
          extBtnContainer.append(getAutoStopButton());
          autoStopButton = document.getElementById('autoStopButton');
          

          // Search the first question and click submitButton button
          await autoWrite(lines[++currentIndex].trim(), inputTextarea);
          
          submitButton.click();
          console.log('searching : ',inputTextarea.value);
          inputTextarea.style.cursor = 'not-allowed';
          
          // The rest of the operation will be handled by the `loadingObserver`
        });
      }
    });
  }
}


