const express = require("express");
const multer = require("multer");
const FuzzySet = require('fuzzyset')
const fs = require("fs");
const upload = multer({dest: 'uploads/'})
const RussianStemmer = require('snowball-stemmer.jsx/dest/russian-stemmer.common.js').RussianStemmer;


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

// Init express app
const app  = express()
const jsonParser = express.json();
const parser  = express.urlencoded({extended: false});
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/downloads"));
app.use(parser);
app.use(jsonParser);


// Some settings.
const stemmer = new RussianStemmer();
const file_extension = ".csv";
const problems = loadStemmingProblems("problems.json");



app.post("/api/test", upload.single("file"), (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    console.log(request.file);
    let fileData;

    try {
        let data = fs.readFileSync(request.file.destination + request.file.filename, "utf8");
        fileData = data;
    } catch(err) {
        console.log(err);
        response.statusCode = 500;
        response.send(err);
    }

    let reports = parseCsvReports(fileData);
    for (let i = 0; i < reports.length; i++) {
        reports[i].gMessageText = grindingText(reports[i].messageText);
        reports[i].stemmed = stemText(reports[i].gMessageText);
        reports[i].coincidences = coincidenceReport(reports[i]);
    }

    let csvdata = convertReportsToCsv(reports);

    try {
        let date = new Date();
        let filename = `${date.getFullYear()}.${date.getMonth()}.${date.getMonth()}__${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}__${date.getMilliseconds()}` + file_extension;
        fs.writeFileSync("downloads/" + filename, csvdata);

        let responseData = {
            url: filename,
            text: fileData
        }

        response.send(JSON.stringify(responseData));
    } catch (err) {
        console.log(err);
        response.statusCode = 500;
        response.send(err);
    }


    try {
        fs.unlinkSync(request.file.destination + request.file.filename);
        console.log("Файл был удалён.")
    } catch (err) {
        console.log("Ошибка при удалении файла.")
        console.log(err);
    }

});

app.listen(7788, () => {
    console.log("Сервер запущен...");
});

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