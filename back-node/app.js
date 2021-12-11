const express = require("express");
const multer = require("multer");
const fs = require("fs");
const upload = multer({dest: 'uploads/'})

const app  = express()
const jsonParser = express.json();
const parser  = express.urlencoded({extended: false});

app.use(express.static(__dirname + "/public"));
app.use(parser);
app.use(jsonParser);

app.get("download/:filename", (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.send(request.params["filename"]);

    try {
        console.log(__dirname);
        response.download(__dirname + "/uploads/" + "03b1cd3cb747017d0becc314169cb7e3");
    } catch (err) {
        console.log(err);
        response.statusCode = 500;
        response.send(err);
    }
});


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

    // Do stuff

    try {
        let filename = request.file.filename;
        fs.writeFileSync("downloads/" + filename, fileData);
        response.send(filename);
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

// app.post("/api/test", upload.single("file"), async (request, response) => {
//     await response.set("Access-Control-Allow-Origin", "*");
//     console.log(request.file);

//     await fs.readFile(request.file.destination + request.file.filename, "utf8", async (err, data) => {
//         if (err) throw err;
//         console.log(data);
//         response.send("End!")
//         await fs.unlink(request.file.destination + request.file.filename, async (err) => {
//             if (err) throw err;
//             console.log("Файл удалён!");
//         });
//     });

// });

app.listen(7788, () => {
    console.log("Сервер запущен...");
});