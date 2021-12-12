const fs = require("fs");
const az = require("az");
var RussianStemmer = require('snowball-stemmer.jsx/dest/russian-stemmer.common.js').RussianStemmer;
var stemmer = new RussianStemmer();

class Report {
    constructor(themeId, themeText, messageId, messageText) {
        this.themeId = themeId;
        this.themeText = themeText;
        this.messageId = messageId;
        this.messageText = messageText; 
    }
}

function parseCsvReports(filedata) {
    let msgs = filedata.split("\n");
    msgs.shift();
    let csvReports = []
    let lastReport = new Report(0, "", 0, "");
    let lastBeenFullReport = false;

    for (let i = 0; i < msgs.length; i ++) {
        let element = msgs[i];
        let array = element.split(";");

        if (isFullReport(array)) {
            let report = new Report(parseInt(array[2]), array[3], i, array.slice(4).join(";"))
            lastReport = report;
            if (lastBeenFullReport) {
                csvReports.push(report);
            }
            lastBeenFullReport = true;
        } else {
            lastReport.messageText += element;
            lastBeenFullReport = false;
        }
    }
    return csvReports;
}

function grindingText(text) {
    let data = text;
    data = data.replace(/\d+/g, "");
    data = data.replace(/\s[А-я]{1,2}\s/g, " ");
    data = data.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");
    data = data.replace(/\s+/g, " ");
    return data;
}


function isFullReport(array) {
    let controlSymbol1 = array[0];
    let controlSymbol2 = array[3];
    if (!isNaN(controlSymbol1) || !isNaN(controlSymbol2)) return true;
    return false;
}

let csv = fs.readFileSync("dataset.csv", "utf8");
let reports = parseCsvReports(csv);
reports.forEach(element => {
    element.gMessageText = grindingText(element.messageText);
});

for (let i = 0; i < reports.length; i++) {
    let tokens = az.Tokens(reports[i].gMessageText).done();
    console.log("----------   " + reports[i].gMessageText)
}