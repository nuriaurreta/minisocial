import express from "express";
import nunjucks from "nunjucks";
import session from "express-session";
import * as Passwords from "./lib/password.js";
import * as Db from "./lib/db.js"

let PORT = 3000;
let app = express();
nunjucks.configure('templates', {
    express: app,
    autoescape: true,   // Escape dangerous strings
    watch: true         // Reload templates on change
});

// Minimal session storage (it's bad, use something better later)
app.use(session({
  secret: 'this should be a proper secret',
  cookie: { maxAge: 60000 }
}));

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// Routes
app.get("/home", (req, res)=>{
    if(req.session.user_id !== undefined){
        // is logged
        // TODO: render the posts of the people I follow
        res.render("home.njk");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res)=>{
    req.session.user_id = undefined;
    res.redirect("/login");
});

app.get("/login", (req, res)=>{
    res.render("login.njk");
});
app.post("/login", async (req, res)=>{
    let user = await Db.getUserByEmail(req.body.email);
    if( user && await Passwords.compare(req.body.password, user.password) ){
        // logged in successfully
        req.session.user_id = user.user_id;
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
