// /**
//  * @param {number} columnNumber
//  * @return {string}
//  */

// var convertToTitle = function(columnNumber) {
//     let pow = 1;
//     let d = 1;
//     result = ''
//     while(d = Math.floor(columnNumber / Math.pow(26,pow)) > 0){
//         // d = Math.floor(columnNumber / Math.pow(26,pow));
//         console.log(d);
//         result = String.fromCharCode(d + 64) + result;
//         columnNumber -= columnNumber % Math.pow(26,pow);
//         pow++;
//     };

//     return result;
// };

// console.log(convertToTitle(701))

/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(nums) {
    let len = nums.length;
    let unique = nums[0];
    let result = [nums[0]];
    let uniqueElementPosition = 0;
    let ei = len - 1;
    for(let i = 1 ; i < nums.length ; i++){
        console.log(nums[i])
        if(nums[i] == unique){
            result[ei] = '_';
            ei --;
            //continue;
        }else{
            unique = nums[i];
            result[++uniqueElementPosition] = unique;
        }
    }
    return result;
};

console.log(removeDuplicates([1,1,2]))