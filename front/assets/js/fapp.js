document.addEventListener("DOMContentLoaded", (event) => {
    console.log("Page ready");
    main();
})


window.onload = () => {
    console.log("window loaded");
    console.log(document.getElementById("fileform__inputfile"));
}


function main() {
    init();
    toggleLoader(false);
    fileSubmit.addEventListener("click", sendFile)
}

async function sendFile(event) {
    let file = getFile();
    let formData = new FormData();
    formData.append("file", file);

    if (validateFileForm(file)) {
        toggleLoader(true);


        let formData = new FormData();
        formData.append("file", file, file.name);

        await fetch(serverAdress + "/api/test", {
            method: "POST",
            body: formData
        }).then(async (response) => {
            if (response.ok) {
                let text = await response.text();
                fetch(serverAdress + "/download/" + text);
            }
            toggleLoader(false);
        })
    } else {
        console.log("Error");
    }
}

function validateFileForm(file) {
    if (file != null && file != undefined) {
        console.log(file.type)
        if (file.type == "application/vnd.ms-excel" || file.type == "text/xml") {
            return true;
        }
    }
    return false;
}