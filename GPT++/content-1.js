if (window.location.href.startsWith("https://chat.openai.com/")) {
  // When the window is fully loaded, execute the following functions
  window.onload = async () => {
    console.log('Content.js loaded');

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


    /* The above code is creating a function that adds an ID to the textarea and button elements. */
    function addIDToElements() {
      document.getElementById('prompt-textarea').setAttribute('id', 'inputTextarea');
      console.log(document.getElementById('inputTextarea'));
      document.querySelector('form div textarea + button').setAttribute('id', 'submitButton');
      console.log(document.getElementById('submitButton'));
    };

    //Creating a link element that links the `element-style.css`
    const linkElement = document.createElement('link');
    linkElement.rel = "stylesheet";
    linkElement.type = "text/css";
    linkElement.href = await chrome.runtime.getURL("element-style.css");
    document.head.appendChild(linkElement);

    //importing the SVG icons
    const icons = await import('./gpt-svgicon.js');

    //Global Variables
    let currentIndex = -1;// Keep track of the currentIndex of questions
    // these two variable related to automode
    let autoModeActivated = false;
    let lines;
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

    /**
     * It creates a new SpeechSynthesisUtterance object, sets the voice, rate, pitch, and volume, and
     * returns the object.
     * @returns The utterance object is being returned.
     */
    function setupSpeechSynthesis() {
      if ('speechSynthesis' in window) {
        let utterance = new SpeechSynthesisUtterance();
        // Set up the utterance
        //console.log(speechSynthesis.getVoices())
        utterance.voice = window.speechSynthesis.getVoices()[0]; // set voice to the first available voice
        utterance.rate = 1.25; // Set the speaking rate
        utterance.pitch = 0.5; // Set the pitch
        utterance.volume = 1; // Set the volume
        return utterance;
      } else {
        showFadedTooltip('WebSpeech API not found...', 'red');
        console.log('Web Speech API is not supported in this browser.');
      }
    }
    //get a configured instance of SpeechSynthesisUtterance
    const utterance = setupSpeechSynthesis();

    /**-- these functions are related to different button elements --**/

    // /** DISABLED BECAUSE NEWER VERTION CHATGPT ADDED A COPY BUTTON ON EVERY RESPONSE CARD
    //  * It creates a button that copies the text of its parent element to the clipboard
    //  * @returns a button element.
    //  */
    // function newCopyToClipboardButton() {
    //   const copyToClipboardButton = document.createElement('button');
    //   copyToClipboardButton.setAttribute('class', 'copyToClipboardButton p-1 rounded-md hover:bg-gray-100  dark:hover:bg-gray-700 md:group-hover:visible');
    //   copyToClipboardButton.innerHTML = icons.copy;
    //   copyToClipboardButton.addEventListener('click', function (event) {
    //     if (navigator.clipboard.writeText) {
    //       navigator.clipboard.writeText(this.parentElement.innerText)
    //         .then(() => {
    //           //console.log('showing tooltip');
    //           showFadedTooltip('Text copied...');
    //         })
    //         .catch((err) => {
    //           showFadedTooltip('Error in copying...', 'red');
    //           console.log('Error copying text to clipboard: ', err);
    //         });
    //     } else { // If the browser does not support the Clipboard API, select the text of the parent element and copy it using the execCommand() method
    //       this.parentElement.select();
    //       document.execCommand("copy");
    //     }
    //   }.bind(copyToClipboardButton));
    //   return copyToClipboardButton;
    // }
    // /**
    //  * It returns a new copy to clipboard button.
    //  * @returns A function.
    //  */
    // function getCopyToClipboardButton() {
    //   return newCopyToClipboardButton();
    // }

    /**
     * It creates a button element, sets its class, sets its innerHTML to the speaker icon, and adds an
     * event listener to it.
     * 
     * The event listener is a function that cancels any current speech synthesis, shows a tooltip,
     * sets the text of the utterance to the text of the parent element, and then speaks the utterance.
     * 
     * The function returns the button element.
     * @returns A button element with the class speakerButton.
     */
    function newSpeakerButton() {
      const speakerButton = document.createElement('button');
      speakerButton.setAttribute('class', 'speakerButton p-1 rounded-md hover:bg-gray-100  dark:hover:bg-gray-700 md:group-hover:visible');
      speakerButton.innerHTML = icons.speaker;
      speakerButton.addEventListener('click', function (event) {
        speechSynthesis.cancel();
        showFadedTooltip('Speeching the text...');
        utterance.text = this.parentElement.textContent;
        ////console.log(utterance.text);
        speechSynthesis.speak(utterance);
      }.bind(speakerButton));
      return speakerButton;
    }
    /**
     * It returns a new button.
     * @returns The function newSpeakerButton() is being returned.
     */
    function getSpeakerButton() {
      return newSpeakerButton();
    }

    /**
     * Creates a toggleable button element for the play/pause function
     * @returns the playPauseButton.
     */
    function getPlayPauseButton() {
      const playPauseButton = document.createElement('button');
      playPauseButton.setAttribute('id', 'playPauseButton');
      playPauseButton.setAttribute('class', 'defaultButton');
      playPauseButton.innerHTML = icons.pause;
      playPauseButton.style.display = 'none';

      playPauseButton.addEventListener('click', function () {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
          // If speech is currently being spoken and not paused, pause it
          speechSynthesis.pause();
          showFadedTooltip('Speech Paused...');
        } else {
          // If speech is currently paused, resume it
          speechSynthesis.resume();
          showFadedTooltip('Speech Resumed...');
        }
      });

      // Add event listeners for speech synthesis events
      utterance.onstart = () => {
        // When speech starts, display the `playPauseButton` and change its icon to the pause icon
        playPauseButton.innerHTML = icons.pause;
        playPauseButton.style.display = '';
      }
      utterance.onpause = () => {
        // When speech is paused, change the `playPauseButton` icon to the play icon
        playPauseButton.innerHTML = icons.play;
      }
      utterance.onresume = () => {
        // When speech is resumed, change the `playPauseButton` icon back to the pause icon
        playPauseButton.innerHTML = icons.pause;
      }
      utterance.onend = () => {
        // When speech ends, hide the `playPauseButton`
        playPauseButton.style.display = 'none';
      }
      return playPauseButton;
    }

    /**
     * It creates a download button and sets up a click event that downloads the current page as an
     * HTML file
     * @returns the downloadButton element.
     */
    function getDownloadButton() {

      const downloadButton = document.createElement('button');
      downloadButton.setAttribute('id', 'downloadButton');
      downloadButton.setAttribute('class', 'defaultButton');
      downloadButton.innerHTML = icons.download;

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
        // Hide unnecessary elements
        showFadedTooltip('Downloading as HTML file...');
        document.querySelector('form').style.display = 'none';
        document.getElementById('extBtnContainer').style.display = 'none';
        document.querySelector('nav').parentNode.parentNode.parentNode.parentNode.style.display = 'none';

        const styledMarkupDocument = getStyledMarkupDocument();

        // Create a download link element and trigger a click on it
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(styledMarkupDocument));
        downloadLink.setAttribute('download', `${styledMarkupDocument.title}.html`);
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Unhide unnecessary elements
        document.querySelector('form').style.display = '';
        document.getElementById('extBtnContainer').style.display = 'flex';
        document.querySelector('nav').parentNode.parentNode.parentNode.parentNode.style.display = '';
      }

      function downloadAsPdf() {
        let styledMarkupDocument = getStyledMarkupDocument();
        const pdf = new jsPDF();
        pdf.html(styledMarkupDocument, {
          callback: function () {
            // Save PDF
            pdf.save(`${document.title}.pdf`);
          }
        });
      }

      // chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      //   if (request.action === "savePage") {
      //     console.log('Alt+S pressed...');

      //   }
      // });

      downloadButton.addEventListener('click', downloadAsHTML); // Use bind to make sure "this" inside the event listener refers to the download button element
      return downloadButton;
    }

    /**
     * It creates a button element with an event listener that clicks the stop button when the button
     * is clicked
     * @returns the autoStopButton element.
     */
    function getAutoStopButton() {
      // create the auto-stop button element
      console.log('this is autostop button');
      const autoStopButton = document.createElement('button');
      autoStopButton.setAttribute('id', 'autoStopButton');
      autoStopButton.setAttribute('class', 'defaultButton')
      autoStopButton.innerHTML = icons.cancel;

      autoStopButton.addEventListener('click', function (event) {
        // get the stop button element and click it to force stop the automated search
        let stopButton = document.querySelectorAll('form div button:has(svg):has(rect)')[0];
        if (stopButton != null) {
          currentIndex = -1; //reset the currentIndex
          autoModeActivated = false; //set the autoModeActivated signal false
          inputTextarea.disabled = false;
          inputTextarea.style.cursor = '';
          stopButton.focus();
          stopButton.click();
          autoStopButton.focus();
          autoStopButton.remove(); // remove the auto-stop button after stopping the search
        }
      }.bind(autoStopButton));

      //as inline styling with js (btn.style.color = 'grey') will override the css hover effect (color change)
      //this two event-listner used to create hover effect
      autoStopButton.addEventListener('mouseover', function () {
        autoStopButton.style.color = 'rgb(217,217,227)';
      });
      autoStopButton.addEventListener('mouseout', function () {
        autoStopButton.style.color = 'rgb(172, 172, 190)';
      });

      return autoStopButton;
    }

    /* Render the container and buttons */

    /**
     * If the `extBtnContainer` element does not exist in the DOM, create it and add it to the DOM.
     * Then add the `downloadButton` and `playPauseButton` to the `extBtnContainer` element.
     */
    async function renderExtBtnContainer() {
      // Check if the extBtnContainer element exists in the DOM
      let extBtnContainer = document.getElementById('extBtnContainer');

      // If it does not exist, create a new one with id and class attributes
      if (extBtnContainer === null) {
        extBtnContainer = document.createElement('div');
        extBtnContainer.setAttribute('id', 'extBtnContainer');
        extBtnContainer.setAttribute('class', 'rounded-md cursor-pointer break-all group');
        let mainElement = await findElementByQuery('main');
        console.log(mainElement);
        mainElement.prepend(extBtnContainer);
      }

      // Add the download button to the container
      extBtnContainer.append(getDownloadButton());
      // If speech synthesis is supported, add the `playPauseButton`
      if ('pause' in speechSynthesis) {
        extBtnContainer.append(getPlayPauseButton());
      } else {
        showFadedTooltip('PAUSE is not supported', 'red');
      }
    }
    // Call the function to render the extension buttons container
    renderExtBtnContainer();

    //USEFUL GLOBAL VARIABLE 
    let inputTextarea = await findElementByQuery('form div textarea');
    let submitButton = await findElementByQuery('div textarea + button');
    // Create a variable for the auto stop button and initialize it to null
    let autoStopButton = null;

    /* Here is the mutation observers */
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
        if (autoModeActivated) { //if automode activated 
          if (!autoStopButton) {
            console.error('`autoStopButton` not found');
            return;
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
          } else {
            // if there are no more questions stop the Auto-Mode
            currentIndex = -1; //reset the currentIndex
            autoModeActivated = false; //set the autoModeActivated signal false
            autoStopButton.remove();// remove the autoStopbutton
            inputTextarea.disabled = false;
            inputTextarea.style.cursor = '';
          }

          // these actions will be performed whether autoMode activated or not
          // Attach `speakerButton` to the last markdown element
          answerMarkdowns[answerMarkdowns.length - 1].append(getSpeakerButton());
          //answerMarkdowns[answerMarkdowns.length - 1].prepend(getCopyToClipboardButton());

          // Attach `speakerButton` and `copyToClipboardButton` to the first markdown element if they are not already there
          if (!answerMarkdowns[0].querySelector('.speakerButton')) {
            answerMarkdowns[0].append(getSpeakerButton());
          }
          // if (!answerMarkdowns[0].querySelector('.copyToClipboardButton')) {
          //   answerMarkdowns[0].prepend(getCopyToClipboardButton());
          // }
        } else {
          console.log('Unknown event happened...');
        }
      }

    });
    // Start observing the `submitButton` to detect if loading animation started or not
    loadingObserver.observe(submitButton, {
      attributes: false,
      childList: true,
      characterData: false,
    });

    // Create a MutationObserver for the '#__next' element to observe changes in its children
    const bodyObserver = new MutationObserver(async (mutations) => {
      speechSynthesis.cancel();// When the '#__next' element is updated, cancel any in-progress speech synthesis 
      if (!document.getElementById('extBtnContainer')) {
        renderExtBtnContainer();// Re-render the 'extBtnContainer'
      }

      // Add a `copyToClipboardButton` and `speakerButton` button to each answer node
      const answerMarkdowns = await findElementByQuerySelectorAll('.markdown');
      console.log(answerMarkdowns)
      if (answerMarkdowns) {
        answerMarkdowns.forEach(answerNode => {
          //answerNode.prepend(getCopyToClipboardButton());

          answerNode.append(getSpeakerButton());
        });
      }
      // Get the inputTextarea and submitButton elements
      inputTextarea = await findElementByQuery('form div textarea');
      submitButton = await findElementByQuery('div textarea + button');

      // Disconnect the previous loadingObserver and connect the `loadingObserver` to observe the 'submitButton' button for changes 
      loadingObserver.disconnect();
      loadingObserver.observe(submitButton, {
        attributes: false,
        childList: true,
        characterData: false,
      });
    });
    // Observe the '#__next' element for changes 
    bodyObserver.observe(document.querySelector('#__next div.overflow-hidden').lastChild, {
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

          inputTextarea.style.cursor = 'not-allowed';

          // Search the first question and click submitButton button
          await autoWrite(lines[++currentIndex].trim(), inputTextarea);

          console.log(inputTextarea.value);

          submitButton.click();

          // The rest of the operation will be handled by the `loadingObserver`
        });
      }
    });

  }
}


