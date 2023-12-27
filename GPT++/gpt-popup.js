/**
* Joins multilines into one array. This is used to join multi - line text to a single text
* @param linesArray - Array of lines to join
* @return { Array } Array of joined lines in the same order as the input array. Each element of the array is an
*/function joinMultilines(linesArray) {
  const questionType = document.getElementById('question-type');
  const resultArray = [];
  // This function splits the lines in the array into a single currentLine.
  for (let i = 0; i < linesArray.length; i++) {
    let currentLine = linesArray[i].trim(); // Remove leading and trailing whitespaces from the current currentLine.

    // If the currentLine is empty, skip to the next currentLine.
    if (!currentLine) {
      continue;
    }

    if(currentLine.startsWith("`") && currentLine.endsWith("`")){
      currentLine = currentLine.substring(1,currentLine.length -1);
    }// Concatenate all the lines between the start and end of a currentLine.
    else if (currentLine.startsWith("`")) { // If the currentLine starts with `, concatenate lines until the ending ` is found.
      currentLine = currentLine.substring(1); // Remove the starting ` from the currentLine.
      let closingBacktickIndex = i;
      let breakWhile = false;
      // Iterates over the lines in the array until the starting and ending ` are found.
      while (++closingBacktickIndex < linesArray.length && !breakWhile) { // Iterate over the following lines until the ending ` is found.
        let nextLine = linesArray[closingBacktickIndex].trim(); // Remove leading and trailing whitespaces from the ending currentLine.

        // Concatenate all the lines from staring ` to ending ` into a single currentLine.
        if (nextLine.endsWith("`")) { // If the ending currentLine ends with `, concatenate all the lines between the starting and ending `.
          linesArray[closingBacktickIndex] = nextLine.substring(0, nextLine.length - 1); // Remove the ending ` from the ending currentLine.

          // Concatenate all the lines between the starting and ending lines.
          for (let j = i + 1; j <= closingBacktickIndex; j++) {
            currentLine += ` ${linesArray[j].trim()}`;
          }

          i = closingBacktickIndex; // Set the current index to the ending index so that the for loop skips the concatenated lines.

          //Stops the whileloop
          breakWhile = true;
          closingBacktickIndex = linesArray.length;
        }
      }
    }
    console.log(currentLine);

    resultArray.push(`${currentLine} ${questionType.value}`); // Add the currentLine to the result array if it does not start with `.

  }
  return resultArray;
}

window.onload = () => {
  const lineCounter = document.getElementById('line-counter');
  const textarea = document.getElementById("textarea");
  const mulilineIndexArray = [];

  /**
   * It takes the textarea's value, splits it into an array of lines, and then loops through the array,
   * checking for backticks. If it finds a backtick, it checks the next line for a backtick. If it
   * finds a backtick, it checks the next line for a backtick. If it finds a backtick, it checks the
   * next line for a backtick. If it finds a backtick, it checks the next line for a backtick. If it
   * finds a backtick, it checks the next line for a backtick. If it finds a backtick, it checks the
   * next line for a backtick. If it finds a backtick, it checks the next line for a backtick. If it
   * finds a backtick, it checks the next line for a backtick. If it finds a backtick, it checks the
   * next line for a backtick. If it finds a backtick, it checks the next line for
   * @returns The line numbers of the textarea.
   */
  function renderlineCounter() {
    if (textarea.value == '') {
      lineCounter.textContent = null;
      return;
    }
    const lineNumberArray = [];
    const linesArray = textarea.value.split("\n");
    let openingBacktickIndex = null;
    let closingBacktickIndex = null;
    let breakWhile = false;
    //console.log(linesArray);
    for (let i = 1; i <= linesArray.length; i++) {
      lineNumberArray.push(`${i}\n`);
    }

    for (let i = 0; i < linesArray.length; i++) {
      let line = linesArray[i].trim();
      if (line.startsWith('`')) {
        openingBacktickIndex = i;
        closingBacktickIndex = i;
        while (++closingBacktickIndex < linesArray.length && !breakWhile) {
          let nextLine = linesArray[closingBacktickIndex].trim();
          if (nextLine.endsWith('`')) {
            breakWhile = true;
            let emptyLines = closingBacktickIndex - openingBacktickIndex;
            for (let q = 1; q <= emptyLines; q++) {
              lineNumberArray.splice(openingBacktickIndex + 1, 0, `^\n`);
              lineNumberArray.pop();
            }
            i = closingBacktickIndex;
            mulilineIndexArray.push({
              startIndex: openingBacktickIndex,
              endIndex: closingBacktickIndex
            });
            closingBacktickIndex = linesArray.length;
          }
        }
        breakWhile = false;
      }
    }
    lineCounter.textContent = lineNumberArray.join('');
  }
  renderlineCounter();

  /* Synchronizing the scroll of the textarea and the line counter. */
  textarea.addEventListener('scroll', function syncronizeScrool() {
    lineCounter.scrollTop = textarea.scrollTop;
  });

  /* Changing the color of the textarea and the line counter when the textarea is focused. */
  textarea.addEventListener('focus', () => {
    lineCounter.style.color = 'rgba(256,256,256,0.5)';
    textarea.style.color = 'rgba(256,256,256,0.5)';
    textarea.value = textarea.value.trim();
    renderlineCounter();
  });
  /* Changing the color of the textarea and the line counter when the textarea is focused. */
  textarea.addEventListener('blur', () => {
    lineCounter.style.color = 'grey';
    textarea.style.color = 'grey';
    textarea.value = textarea.value.trim();
    renderlineCounter();
  });
  /* Used to render the line counter when the textarea is focused. */
  textarea.addEventListener('input', (event) => {
    //console.log(event);
    if (textarea.value.split('\n').length === 1) {
      renderlineCounter();
      return;
    }
    if (event.data === null) {
      renderlineCounter();
    }
    if (event.data === '`') {
      renderlineCounter();
    }
  });

  const form = document.getElementById('input-form');
  //console.log(form);
  //Add event listeners to the form.
  if (form != null) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      ////console.log("handler attached");
      const input = textarea.value;
      let linesArray = input.split('\n');
      linesArray = joinMultilines(linesArray);
      console.log(linesArray);
      let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      let activeTabId = tabs[0].id;
      //console.log(activeTabId);
      const port = await chrome.tabs.connect(tabs[0].id, { name: "popup" }); // establishing a connection with content.js
      port.postMessage({ lines: linesArray });
      window.close();
    });
  }
}



