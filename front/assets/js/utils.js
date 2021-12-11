var serverAdress = "http://127.0.0.1:7788"
var loader;
var fileSubmit; 
var fileInputElement;
var downloadView;
var downloadLabel;
var downloadLink;
var fileWrapper;
var fileWrapperTitle;

function init() {
    fileInputElement = document.getElementById("fileform__inputfile");
    fileSubmit = document.getElementById("fileform__submit");
    loader = document.querySelector(".loader");
    downloadLabel = document.getElementById("download-filename");
    downloadLink = document.getElementById("download-href");
    downloadView = document.querySelector(".download");
    fileWrapper = document.getElementById("form-file-wrapper");
    fileWrapperTitle = document.getElementById("form-file-title")
}

function toggleLoader(toggle) {
    if (!toggle) loader.classList.add("hide");
    else loader.classList.remove("hide");
}

function getFile() {
    let file = fileInputElement.files[0]
    if (file != undefined) return file;
    else return null;
}