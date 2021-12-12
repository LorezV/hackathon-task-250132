const fs = require("fs");
var RussianStemmer = require('snowball-stemmer.jsx/dest/russian-stemmer.common.js').RussianStemmer;
var stemmer = new RussianStemmer();


let data = fs.readFileSync("message.txt", {encoding: "utf-8"});
let rData = ""

for (let i=0; i < data.length; i++) {
    if (data[i] == "\t") rData += " ";
    else if (data[i] == "/") rData += " "
    else if (data[i] != "\r") rData += data[i];
}


rData = rData.split("\n")

let dict = {}

for (let i=0; i<rData.length; i++) {
    let array = rData[i].split(" ");   
    let cat_id = array.shift();
    let words = array.map(value => {return stemmer.stemWord(value)});
    dict[cat_id] = words;
}

let jsonData = JSON.stringify(dict);
console.log(jsonData)

fs.writeFileSync("problems.json", jsonData);