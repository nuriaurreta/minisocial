import express from "express";

let app = express();

app.get("/", (req, res)=>{
    res.send("hola");
})

app.listen(3000);