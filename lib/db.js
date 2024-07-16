import sqlite3 from "sqlite3";

// Database connection
let db = new sqlite3.Database('database.db');

function close(){
    return new Promise((resolve, reject)=>{
        db.close((err) => {
            if (err) {
                return reject();
            }
            console.log('Database connection closed');
            resolve();
        });
    });
}

function createUser(user){
    return new Promise((resolve, reject)=>{
        db.get("INSERT INTO users (name, last_name, password, email) VALUES (?,?,?,?) RETURNING user_id",
        [user.name, user.surname, user.password, user.email],
        function(err, data){
            if(err){
                reject(err);
            } else {
                resolve(data.user_id);
            }
        });
    })
}

function createPost(body, image_url, user_id){
    return new Promise((resolve, reject)=>{
        db.run("INSERT INTO posts (body, image_url, user_id) VALUES (?,?,?)",
        [body, image_url, user_id],
        function(err){
            if(err){
                reject(err);
            } else {
                resolve();
            }
        });
    })
}

function getUserByEmail(email){
    return new Promise((resolve, reject)=>{
        db.get("SELECT * from users WHERE email = ?",
        [email],
        function(err, row){
            if(err){
                reject(err);
            } else {
                resolve(row);
            }
        });
    })
}

function getUsers(){
    return new Promise((resolve, reject)=>{
        db.all("SELECT * from users",
        [],
        function(err, rows){
            if(err){
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
}

function follow(follower, followed){
    return new Promise((resolve, reject)=>{
        db.run("INSERT INTO follows (followeR_id, followeD_id) VALUES (?,?)",
        [follower, followed],
        function(err){
            if(err){
                reject(err);
            } else {
                resolve();
            }
        });
    })
}

function unfollow(follower, followed){
    return new Promise((resolve, reject)=>{
        db.run("DELETE FROM follows WHERE followeR_id = ? AND followeD_id = ?",
        [follower, followed],
        function(err){
            if(err){
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function getFollowed(user_id){
    return new Promise((resolve, reject)=>{
        db.all("SELECT followeD_id from follows WHERE followeR_id = ?",
        [user_id],
        function(err, rows){
            if(err){
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
}

function getFollowedPosts(user_id){
    return new Promise((resolve, reject)=>{
        db.all(`SELECT p.body, p.image_url, u.name FROM follows
            JOIN posts AS p ON followeD_id = p.user_id
            JOIN users AS u ON p.user_id = u.user_id
            WHERE followeR_id = ?`,
        [user_id],
        function(err, rows){
            if(err){
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
}

export {createUser, createPost, getUserByEmail, getUsers, follow, unfollow, getFollowed, getFollowedPosts, close}
