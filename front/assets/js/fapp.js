document.addEventListener("DOMContentLoaded", (event) => {
    console.log("Page ready");
    main();
})

let loader;
let fileSubmit; 
let fileInputElement;

function main() {
    fileInputElement = document.getElementById("fileform__inputfile");
    fileSubmit = document.getElementById("fileform__submit");
    loader = document.querySelector(".loader");

    toggleLoader(false);

    fileSubmit.addEventListener("click", async (event) => {
        toggleLoader(true);
        let response = await fetch("http://127.0.0.1:7788/api/test").then( async (response) => {
            if (response.ok) {
                let json = await response.text();
                console.log(json)
                toggleLoader(false)
            }
        });
    });
}


function toggleLoader(toggle) {
    if (!toggle) loader.classList.add("hide");
    else loader.classList.remove("hide");
}