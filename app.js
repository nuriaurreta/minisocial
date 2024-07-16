import express from "express";
import nunjucks from "nunjucks";
import session from "express-session";
import * as Passwords from "./lib/password.js";
import * as Db from "./lib/db.js";
import csurf from "csurf";
import multer from "multer";

let PORT = 3000;
let app = express();

// Multipart formdata
const upload = multer({
    dest: 'uploads/',
    limits: {fileSize: 5*1000*1000}  // PUT LIMITS!!! We don't want to fill our disks!
 });

// Configure template system
nunjucks.configure('templates', {
    express: app,
    autoescape: true,   // Escape dangerous strings
    watch: true         // Reload templates on change
});

// Minimal session storage (it's bad, use something better later)
app.use(session({
  secret: 'this should be a proper secret',
  cookie: {
    maxAge: 60000,
    // sameSite: "strict", // SameSite attribute in cookies mitigate CSRF
  }
}));

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// For CSRF mitigation
const csrfMiddleware = csurf("This also should be a secret!!!!", ["POST"]);

// Middleware
function protectedByLogin(req, res, next){
    if(req.session.user_id !== undefined){
        next();
    } else {
        res.redirect("/login");
    } 
}

// Routes

// Static file server for the uploads
app.use('/uploads', express.static('uploads'));

// This route requires multipart-formdata processing before CSRF middleware,
// assign CSRF middleware manually
app.post("/shout", protectedByLogin, upload.single('shout_image'), csrfMiddleware, async (req, res)=>{
    console.log(req.file);
    Db.createPost(req.body.shout_body, req.file.path, req.session.user_id);
    res.redirect("/home");
});

// Apply csrf to the rest of the POST routes
app.use(csrfMiddleware);

app.get("/", protectedByLogin, (req, res)=>{
    res.redirect("/home");
});
app.get("/home", protectedByLogin, async (req, res)=>{
    let posts = await Db.getFollowedPosts(req.session.user_id);
    let csrfToken = req.csrfToken();
    res.render("home.njk", {posts, csrfToken});
});

app.get("/users", protectedByLogin, async (req, res)=>{
    let users = await Db.getUsers();
    let followed = await Db.getFollowed(req.session.user_id);
    let isFollowed = (user, follows)=>{
        return follows.find((el)=> el.followeD_id == user.user_id );
    }
    res.render("users.njk", {users, followed, isFollowed});
});

app.get("/follow/:followed_id", protectedByLogin, async(req, res)=>{
    await Db.follow(req.session.user_id, req.params.followed_id);
    res.redirect("/users");
});
app.get("/unfollow/:followed_id", protectedByLogin, async(req, res)=>{
    await Db.unfollow(req.session.user_id, req.params.followed_id);
    res.redirect("/users");
})

app.get("/logout", (req, res)=>{
    req.session.user_id = undefined;
    res.redirect("/login");
});

app.get("/login", (req, res)=>{
    const csrfToken = req.csrfToken();
    res.render("login.njk", {csrfToken});
});
app.post("/login", async (req, res)=>{
    const csrfToken = req.csrfToken();
    let user = await Db.getUserByEmail(req.body.email);
    if( user && await Passwords.compare(req.body.password, user.password) ){
        // logged in successfully
        req.session.user_id = user.user_id;
        console.log("logged in successfully");
        res.redirect("/home");
    } else {
        res.status(400).render("login.njk", {message: "Wrong credentials", csrfToken});
    }
})

app.get("/register", (req, res)=>{
    const csrfToken = req.csrfToken();
    res.render("register.njk", {csrfToken});
});
app.post("/register", async (req, res)=>{
    if(req.body.password !== req.body["repeat-password"]){
        res.status(400).render("register.njk", {message: "Passwords do not match"});
        return;
    }
    try{
        let salt = await Passwords.genSalt(10);
        let hashedPass = await Passwords.hash(req.body.password, salt);
        req.body.password = hashedPass;
        let user_id = await Db.createUser(req.body);
        // I know the user so I can set the session now
        req.session.user_id = user_id;
        res.redirect("/home");
    } catch (error){
        // Error, try again
        const csrfToken = req.csrfToken();
        res.status(400).render("register.njk", {message: 'Some error happened', csrfToken});
    }
});



const server = app.listen(PORT, ()=>{
    console.log("listening in port", PORT);
});


function shutdown() {
    console.log('Shutdown signal caught, shutting down');
    let dbEnd = Db.close();
    let serverEnd = new Promise((resolve, reject)=>{
        server.close(() => {
            console.log('HTTP server closed')
            resolve();
        });
    });
    Promise.all([dbEnd, serverEnd]).then(()=>process.exit());
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);