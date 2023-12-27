function joinMultilines(linesArray) {
  const resultArray = [];
  // This function splits the lines in the array into a single currentLine.
  for (let i = 0; i < linesArray.length; i++) {
    let currentLine = linesArray[i].trim(); // Remove leading and trailing whitespaces from the current currentLine.

    // If the currentLine is empty, skip to the next currentLine.
    if (!currentLine) {
      continue;
    }

    // Concatenate all the lines between the start and end of a currentLine.
    if (currentLine.startsWith("`")) { // If the currentLine starts with `, concatenate lines until the ending ` is found.
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
      resultArray.push(currentLine);
    } else {
      resultArray.push(currentLine); // Add the currentLine to the result array if it does not start with `.
    }
  }
  return resultArray;
}

s = ["hi","i am ","Rohan","are you fine"];;
console.log(joinMultilines(s))


  

  
  
  

  
  // async function getElementByQuery(id){
  //   return new Promise(
  //     (resolve) => {
  //       const interval = setInterval(()=>{
  //         let result = document.getElementById(id);
  //         if(result){
  //           clearInterval(interval);
  //           console.log(result);
  //           resolve(result);     
  //         }
  //       } , 1000);
  //     }
  //   )}
   
  // getElementByQuery('q').then((result) => {console.log('result :: ',result)});

  

  
  function renderlineCounter() {
    lineCounter.textContent = null;
    if (textarea.value == '') {
      return;
    }
    const lineNumberArray = [];
    const linesArray = textarea.value.split("\n");
    //console.log(lineNumberArray);
    let currentLineNumber = null;
    let openingBacktickIndex = null;
    console.log(linesArray);
    for (let i = 0; i < linesArray.length; i++) {
      (!openingBacktickIndex) ? currentLineNumber = i + 1 : currentLineNumber++;

      lineNumberArray.push(`${currentLineNumber}\n`);
      let line = linesArray[i].trim();
      if (line.startsWith("`")) {
        openingBacktickIndex = i;
        let closingBacktickIndex = i;
        let breakWhile = false;
        while (++closingBacktickIndex < linesArray.length && !breakWhile) {
          line = linesArray[closingBacktickIndex].trim();
          if (line.endsWith("`")) {
            let balnkLineNumberQuantity = closingBacktickIndex - openingBacktickIndex;
            for (let j = 0; j < balnkLineNumberQuantity; j++) {
              lineNumberArray.push('"\n');
            }
            // lineNumberArray = lineNumberArray.slice(0,lineNumberArray.length-balnkLineNumberQuantity);
            currentLineNumber = openingBacktickIndex + 1;
            i = closingBacktickIndex;
            //Stops the whileloop
            breakWhile = true;
            closingBacktickIndex = linesArray.length;
          }
        }
      }
      lineCounter.textContent = lineNumberArray.join('');
    }
  }
  renderlineCounter();




  async function findElementByQuery(id, intervalTime = 1000, repetationLimit = null) {
    return new Promise((resolve, reject) => {
      id = id.trim();
      if (repetationLimit) {
        const interval = setInterval(() => {
          if (repetationLimit == 0) {
            clearInterval(interval);
            console.log(`'${id}' Element not found.`);
            reject(null);
          } else {
            console.log(`Searching the '${id}' element .`);
            let result = document.getElementById(id);
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
          console.log(`Searching the '${id}' element .`)
          let result = document.getElementById(id);

          if (result) {
            clearInterval(interval);
            console.log(`'${id}' Element found `);
            resolve(result);
          }
        }, intervalTime);
      }
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

  function downloadStyledMarkup() {
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(getStyledMarkupDocument()));
    downloadLink.setAttribute('download', `${document.title}.html`);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }


