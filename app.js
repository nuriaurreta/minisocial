import express from "express";
import nunjucks from "nunjucks";
import sqlite3 from "sqlite3";

let PORT = 3000;
let app = express();
nunjucks.configure('templates', {
    express: app,
    autoescape: true,   // Escape dangerous strings
    watch: true         // Reload templates on change
});
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// Database connection
let db = new sqlite3.Database('database.db');

// Routes
app.get("/login", (req, res)=>{
    res.render("login.njk");
});

app.get("/register", (req, res)=>{
    res.render("register.njk");
});
app.post("/register", (req, res)=>{
    console.log(req.body);
    db.run("INSERT INTO users (name, last_name, password, email) VALUES (?,?,?,?)",
        [req.body.name, req.body.surname, req.body.password, req.body.email],
        function (error){
            if(error){ throw error; }
            res.send("Row inserted!");
        }
    );
});

app.listen(PORT, ()=>{
    console.log("listening in port", PORT);
});