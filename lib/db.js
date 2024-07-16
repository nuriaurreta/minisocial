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


function query(how, q, params, key){
    return new Promise((resolve, reject)=>{
        db[how](q, params, function(err, data){
            if(err){
                reject(err);
            } else {
                if(key){
                    resolve(data[key]);
                }
                else{
                    resolve(data);
                }
            }
        });
    })
}

function createUser(user){
    return query("get",
        "INSERT INTO users (name, last_name, password, email) VALUES (?,?,?,?) RETURNING user_id",
        [user.name, user.surname, user.password, user.email],
        "user_id");
}


function createPost(body, image_url, user_id){
    return query("run",
        "INSERT INTO posts (body, image_url, user_id) VALUES (?,?,?)",
        [body, image_url, user_id]);
}

function getUserByEmail(email){
    return query("get", "SELECT * from users WHERE email = ?",
        [email],
    );
}

function getUsers(){
    return query("all", "SELECT * from users");
}

function follow(follower, followed){
    return query("run", "INSERT INTO follows (followeR_id, followeD_id) VALUES (?,?)",
        [follower, followed]);
}

function unfollow(follower, followed){
    return query("run", "DELETE FROM follows WHERE followeR_id = ? AND followeD_id = ?",
        [follower, followed]);
}

function getFollowed(user_id){
    return query("all", "SELECT followeD_id from follows WHERE followeR_id = ?",
        [user_id]);
}

function getFollowedPosts(user_id){
    return query("all",
        `SELECT p.body, p.image_url, u.name FROM follows
            JOIN posts AS p ON followeD_id = p.user_id
            JOIN users AS u ON p.user_id = u.user_id
            WHERE followeR_id = ?`,
        [user_id]);
}

export {createUser, createPost, getUserByEmail, getUsers, follow, unfollow, getFollowed, getFollowedPosts, close}
