import express from "express";
import nunjucks from "nunjucks";

let PORT = 3000;
let app = express();
nunjucks.configure('templates', {
    express: app,
    autoescape: true,   // Escape dangerous strings
    watch: true         // Reload templates on change
});
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// Routes
app.get("/login", (req, res)=>{
    res.render("login.njk");
});

app.get("/register", (req, res)=>{
    res.render("register.njk");
});
app.post("/register", (req, res)=>{
    console.log(req.body);
    res.send("HAS MANDADO UN REGISTRO");
});

app.listen(PORT, ()=>{
    console.log("listening in port", PORT);
});