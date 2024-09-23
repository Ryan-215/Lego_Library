const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs')

require('dotenv').config();

// define the user schema
const userSchema = new Schema({
    userName: { 
        type: String, 
        unique: true,
    },
    password: String,
    email: String,
    loginHistory: [
        {
            dateTime: Date,
            userAgent: String
        }
    ],
});

// define a User object to be used in this module
let User;

// initialze the connection to the database
function initialize() {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB);
        db.on('error', (err) => { 
            reject(err); 
        })
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    })
}

// register the user to database
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        // if password entered not match, return error
        if(userData.password !== userData.password2) {
            return reject('Passwords do not match');
        } else {
            // encrypt the password
            bcrypt.hash(userData.password, 10)
            .then(hash => {
                let newUser = new User({
                    userName: userData.userName,
                    password: hash,
                    email: userData.email,
                });
                newUser.save()
                .then(() => resolve())
                .catch(err => {
                    if(err.code == 11000) {
                        reject('User Name already taken');
                    } else {
                        reject(`There was an error creating the user: ${err}`);
                    }
                })
            })
            .catch(err => {
                console.log(err);
                reject('There was an error encrypting the password');
            });
        }
    })
}

// check if the user is valid
function checkUser(userData) {
    return new Promise((resolve, reject) => {
        // find the user in database
        User.find({ userName: userData.userName })
        .exec()
        .then(users => {
            if (users.length === 0) {
                reject(`Unable to find user: ${userData.userName}`);
            }
            // verify the hashed password
            bcrypt.compare(userData.password, users[0].password)
            .then(result => {
                if (result === false) {
                    reject(`Incorrect Password for user: ${userData.userName}`);
                } else {
                    // if hit the maxmum login history, remove the last one
                    if(users[0].loginHistory.length == 8) {
                        users[0].loginHistory.pop();
                    }
                    // record to loginHistory
                    users[0].loginHistory.unshift({
                        dateTime: (new Date()).toString(), 
                        userAgent: userData.userAgent
                    });
                    // update the loginHistory to database
                    User.updateOne(
                        { userName: users[0].userName },
                        { $set: { loginHistory: users[0].loginHistory }}
                    ).exec()
                    .then(() => resolve(users[0]))
                    .catch(err => reject(`There was an error verifying the user: ${err}`));
                }
            })
            .catch(err => reject(`There was an error verifying the user: ${err}`));
        })
        .catch(err => reject(`Unable to find user: ${userData.userName}`));
    })
}

// Exports all functions from this module
module.exports = { initialize, registerUser, checkUser };