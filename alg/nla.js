const FuzzySet = require('fuzzyset')
const fs = require("fs");
var RussianStemmer = require('snowball-stemmer.jsx/dest/russian-stemmer.common.js').RussianStemmer;
var stemmer = new RussianStemmer();
const problems = loadStemmingProblems("problems.json");

class Report {
    constructor(themeId, themeText, messageId, messageText) {
        this.themeId = themeId;
        this.themeText = themeText;
        this.messageId = messageId;
        this.messageText = messageText; 
        this.gMessageText = ""
        this.stemmed = [],
        this.coincidences = [[1, 12], [12, 33], [6, 55]]
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
            let report = new Report(parseInt(array[2]), array[3], i, array.slice(4).join(";").replace(/\s+/g, " ").trim())
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
    data = data.replace(/[.,\/#!$%"'\^&\*;:{}=\-_`~()]/g, " ");
    data = data.replace(/\s+/g, " ");
    return data;
}

function stemText(text) {
    let result = []
    let tokens = text.split(" ");
    tokens.forEach(element => {
        result.push(stemmer.stemWord(element));
    });
    return result;
}


function isFullReport(array) {
    let controlSymbol1 = array[0];
    let controlSymbol2 = array[3];
    if (!isNaN(controlSymbol1) || !isNaN(controlSymbol2)) return true;
    return false;
}

function convertReportsToCsv(reports) {
    let text = "";

    reports.forEach(element => {
        let string = "";
        string += element.messageId + ";";
        string += element.messageText + ";";
        element.coincidences.forEach(coin => {
            string += coin[0] + ":" + problems[coin[0]].text + ":" + coin[1] + ";";
        });
        string += "\n";
        text += string;
    });

    return text;
}


function loadStemmingProblems(path) {
    let data = fs.readFileSync(path, "utf8");
    data = JSON.parse(data);
    return (data);
}

function coincidenceReport(report) {
    let result = [];

    let words = report.gMessageText.split(" ");

    Object.keys(problems).forEach(key => {
        problem = problems[key];
        let percent = 1
        problem.stemmed.forEach(pword => {
            let a = FuzzySet()
            a.add(pword);
            words.forEach(word => {
                let res = a.get(word);
                if (res != null) {
                    percent *= res[0][0]
                }
            })
        });
        if (percent == 1){
            percent = 0
        }
        percent = parseInt(percent * 100) / 100
        result.push([problem.id, parseInt(percent * 100)]);
    });

    result.sort((a, b) => {
        if (a[1] > b[1]) return -1;
        if (a[1] == b[1]) return 0;
        else return 1;
    });
    result = result.slice(0, 3);
    console.log(result);
    return result;
}


function main() {
    let csv = fs.readFileSync("dataset.csv", "utf8");
    let reports = parseCsvReports(csv);
    for (let i = 0; i < reports.length; i++) {
        reports[i].gMessageText = grindingText(reports[i].messageText);
        reports[i].stemmed = stemText(reports[i].gMessageText);
        reports[i].coincidences = coincidenceReport(reports[i]);
    }

    let csvdata = convertReportsToCsv(reports);
    fs.writeFileSync("result.csv", csvdata);
}

main()
