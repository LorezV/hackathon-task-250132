const express = require("express")

const app  = express()
const jsonParser = express.json();

app.use(express.static(__dirname + "/public"));


app.get("/api/test", (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.send("answer");
})

app.listen(7788, () => {
    console.log("Сервер запущен...")
})