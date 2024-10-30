import bcrypt from "bcryptjs";

// Promise based bcrypt module

function genSalt(rounds){
    return new Promise((resolve, reject)=>{
        bcrypt.genSalt(rounds, (err, salt)=>{
            if(err){
                reject(err);
            } else {
                resolve(salt);
            }
        });
    });
}

function hash(password, salt){
    return new Promise((resolve, reject)=>{
        bcrypt.hash(password, salt, (err, hash)=>{
            console.log(hash);
            if(err){
                reject(err);
            } else {
                resolve(hash);
            }
         });
    });
}

function compare(password, hash){
    // This one has Promise support, do directly
    return bcrypt.compare(password, hash);
}

export {genSalt, hash, compare};
