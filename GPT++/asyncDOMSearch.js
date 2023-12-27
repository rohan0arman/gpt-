export const findElementByQuery = async function (query, intervalTime = 1000, repetationLimit = null) {
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
                    console.log(`'${query}' Element found `);
                    resolve(result);
                }
            }, intervalTime);
        }
    });
}

export const findElementByQuerySelectorAll = async function (query, intervalTime = 1000, repetationLimit = null) {
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

export const findElementById = async function (id, intervalTime = 1000, repetationLimit = null) {
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



