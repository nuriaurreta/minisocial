import express from "express";
import nunjucks from "nunjucks";
import * as Passwords from "./lib/password.js";
import * as Db from "./lib/db.js"

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
app.post("/login", async (req, res)=>{
    let user = await Db.getUserByEmail(req.body.email);
    if( user && await Passwords.compare(req.body.password, user.password) ){
        // logged in successfully
        console.log("logged in successfully");
        res.redirect("/home");
    } else {
        res.render("login.njk", {message: "Wrong credentials"});
    }
})

app.get("/register", (req, res)=>{
    res.render("register.njk");
});
app.post("/register", async (req, res)=>{
    if(req.body.password !== req.body["repeat-password"]){
        res.render("register.njk", {message: "Passwords do not match"});
        return;
    }
    try{
        let salt = await Passwords.genSalt(10);
        let hashedPass = await Passwords.hash(req.body.password, salt);
        req.body.password = hashedPass;
        await createUser(req.body);
        // TODO: Registered properly, what should I do now??
        res.render("/unaPlantilla.njk");
    } catch (error){
        console.log(error);
    }
});

app.listen(PORT, ()=>{
    console.log("listening in port", PORT);
});
