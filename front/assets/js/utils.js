var serverAdress = "http://127.0.0.1:7788"
var loader;
var fileSubmit; 
var fileInputElement;

function init() {
    fileInputElement = document.getElementById("fileform__inputfile");
    fileSubmit = document.getElementById("fileform__submit");
    loader = document.querySelector(".loader");
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