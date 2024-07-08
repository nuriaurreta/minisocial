import sqlite3 from "sqlite3";

// Database connection
let db = new sqlite3.Database('database.db');

function createUser(user){
    return new Promise((resolve, reject)=>{
        db.run("INSERT INTO users (name, last_name, password, email) VALUES (?,?,?,?)",
        [user.name, user.surname, user.password, user.email],
        function(err){
            if(err){
                reject(err);
            } else {
                resolve();
            }
        });
    })
}

export {createUser}
