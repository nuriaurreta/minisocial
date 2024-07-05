import express from "express";
import nunjucks from "nunjucks";

let PORT = 3000;
let app = express();
nunjucks.configure('templates', {
    express: app,
    autoescape: true,   // Escape dangerous strings
    watch: true         // Reload templates on change
});

app.get("/login", (req, res)=>{
    res.render("login.njk");
})

app.listen(PORT, ()=>{
    console.log("listening in port", PORT);
});