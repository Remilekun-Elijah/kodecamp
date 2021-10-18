//jshint esversion:8
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const joi = require("joi");
const { userDatabase, profileDatabase } = require("../model/database");
const uuid = require("uuid/v4");
const db = userDatabase;
const fs = require('fs'),
    path = require("path");


exports.homepage = function(req, res) {
    res.render('index');
};



// handler
exports.profile = function(req, res) {
    res.sendFile(path.resolve("views/profile.html"));
};

exports.uploadImage = (req, res) => {

    if (req.file) {

        // move image to public directory
        fs.renameSync(path.resolve(req.file.path), path.resolve(`public/img/${req.file.filename}`));

        res.status(201).json({
            okay: true,
            image: `../img/${req.file.filename}`,
            message: "File uploaded successfully"
        });

    } else res.status(304).json({ okay: false, message: "Failed to upload image" });
};
// handler 
exports.getOneUser = function(req, res) {
    // get the id from the request
    const id = req.params.id;
    // find the user with the id
    const user = allUserRecords.find(user => {
        // if the user id matches the id from the request retun the user
        if (user.id === Number(id)) return user;
        // if the user id doesn't match the id from the request return false
        else return false;
    });
    // check if user exists before sending out response
    if (user) res.status(200).send(user);
    else res.status(404).send("User not found");
};

exports.deleteUser = function(req, res) {
    const id = parseInt(req.params.id);

    // filters through the userRecords 
    const user = allUserRecords.find((user, index) => {

        // checks if the user id matches the id in the url
        if (user.id === id) {
            //  attaches the user index to the user details
            user.dataId = index;
            // return the user
            return user;
        } else {
            // return false if the user id doesn't match the id in the url
            return false;
        }
    });

    if (user) {
        // delete the user using their index
        allUserRecords.splice(user.dataId, 1);
        // send out response to the client
        res.status(200).send({ succes: true, data: user, message: "User deleted successfully" });
    } else res.status(404).json({ success: false, message: "User not found" });
};


exports.createUser = async function(req, res) {
    // design object schema for joi
    const objectSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email({ minDomainSegments: 2 }).required(),
        password: joi.string().required(),
        Cpassword: joi.ref('password')
    });
    try {
        const data = await objectSchema.validateAsync(req.body);
        let { name, email, password } = data;
        // hashes the user password
        password = bcrypt.hashSync(password, 10);

        // creates the user data
        const user = {
            id: uuid(),
            name,
            email,
            status: "pending",
            password,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        // creates the user profile data
        const profile = {
            id: uuid(),
            name,
            email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        // saves the user in the db
        db.push(user);
        // save user profile in the db
        profileDatabase.push(profile);
        // sends out response to the client
        res.json({ okay: true, message: "User created successfully" });

    } catch (err) {
        console.log(err)
        res.status(422).json({ okay: false, message: err.details[0].message })
    }

};

exports.signIn = async(req, res) => {
    const object = joi.object({
        email: joi.string().email({ minDomainSegments: 2 }).required(),
        password: joi.string().required()
    });

    try {
        const data = await object.validateAsync(req.body);
        const { email, password } = data;
        // find user 
        db.find(user => {
            // find user by email
            if (user.email == email) {
                // verifies user password
                const isPassword = bcrypt.compareSync(password, user.password);
                if (isPassword) {
                    // generates user token 
                    const token = jwt.sign({ id: user.id }, 'lucifer_secret', { expiresIn: '2d' });

                    // send out response with their token
                    res.status(200).json({ okay: true, token: `Bearer ${token}`, message: ' Logged in successfully' });
                } else {
                    res.status(400).json({ okay: false, message: ' Incorrect password' });
                }
            } else res.status(404).json({ okay: false, message: 'User not found' });
        })
    } catch (err) {
        res.status(422).json({ okay: false, message: err.details[0].message });
    }
};

exports.getProfile = async(req, res) => {
    const id = res.locals.userId;
    console.log(id);
    // gets the user account details
    const account = db.find(data => data);

    profileDatabase.find(profile => {
        if (profile.email == account.email) {
            // attaches the user profile to the user account  
            profile.accountId = account.id;
            profile.status = account.status;
            // sends out response to the client
            res.status(200).json({ okay: true, data: profile });
        } else res.status(404).json({ okay: false, message: 'User profile not found' });
    })
};