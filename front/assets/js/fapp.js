document.addEventListener("DOMContentLoaded", (event) => {
    console.log("Page ready");
    main();
})


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
                let data = await response.json();
                releaseUrl(serverAdress + "/" + data["url"]);
            }
            toggleLoader(false);
        })
    } else {
        console.log("Error");
    }
}

function validateFileForm(file) {
    if (file != null && file != undefined) {
        if (file.type == "application/vnd.ms-excel" || file.type == "text/xml") {
            return true;
        }
    }
    return false;
}

function releaseUrl(url) {
    let a = document.createElement("a");
    a.href = url;
    a.download = true;
    document.body.appendChild(a);
    a.click();
    a.remove();
}