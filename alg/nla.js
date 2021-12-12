const fs = require("fs");
var RussianStemmer = require('snowball-stemmer.jsx/dest/russian-stemmer.common.js').RussianStemmer;
var stemmer = new RussianStemmer();

let csv = fs.readFileSync("dataset.csv", "utf8");

csvParser();

function csvParser() {
    let msgs = csv.split("\n");
    msgs.shift();
    
    let lastReport = {}

    for (let i = 0; i < msgs.length; i ++) {
        element = msgs[i];
        let isFullReport = false;
        let data = element.split(";");
        console.log(data)

        let object = {
            theme_id: data[2],
            theme_name: data[3],
            message: data[4]
        }
    }
}