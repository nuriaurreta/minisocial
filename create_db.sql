CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    name TEXT,
    last_name TEXT,
    password TEXT,
    email TEXT UNIQUE
);

CREATE TABLE posts (
    post_id INTEGER PRIMARY KEY,
    body TEXT,
    user_id INTEGER NOT NULL,
    image_url TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE follows (
    followeR_id INTEGER,
    followeD_id INTEGER,
    PRIMARY KEY (followeR_id, followeD_id),
    FOREIGN KEY (followeD_id) REFERENCES users(user_id),
    FOREIGN KEY (followeR_id) REFERENCES users(user_id)
);