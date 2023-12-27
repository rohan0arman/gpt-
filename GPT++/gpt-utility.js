const icons = await import('./gpt-svgicon.js');

let currentTooltipEnd = Promise.resolve();
export const showFadedTooltip = async function (massage, color = '') {
    await currentTooltipEnd
    const tooltip = document.createElement('div');
    tooltip.setAttribute('id', 'tooltip');
    tooltip.style.color = color;
    tooltip.textContent = massage.trim();
    document.querySelector('main').parentNode.parentNode.prepend(tooltip);
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
export const setupSpeechSynthesis = function () {
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
export const utterance = setupSpeechSynthesis();

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
export const newSpeakerButton = function () {
    const speakerButton = document.createElement('button');
    speakerButton.setAttribute('class', 'speakerButton p-1 rounded-md hover:bg-gray-100  dark:hover:bg-gray-700 md:group-hover:visible');
    speakerButton.innerHTML = icons.speaker;
    speakerButton.addEventListener('click', function (event) {
        speechSynthesis.cancel();
        showFadedTooltip('Speeching the text...');
        utterance.text = this.parentElement.textContent;
        console.log('Utterence Text : ',utterance.text);
        speechSynthesis.speak(utterance);
    }.bind(speakerButton));
    return speakerButton;
}

/**
     * Creates a toggleable button element for the play/pause function
     * @returns the playPauseButton.
     */
export const getPlayPauseButton = function () {
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
export const getDownloadButton = function () {
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
export const getAutoStopButton = function () {
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
