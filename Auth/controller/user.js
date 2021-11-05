//jshint esversion:8
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const joi = require("joi");
const { userDatabase, profileDatabase } = require("../model/database");

const { userModel, profileModel, permissionModel } = require('../model/user');
let uuid = require("uuid");

uuid = uuid.v4;

const accountDb = userDatabase;
const fs = require('fs'),
    path = require("path");

const emailService = require('../utils/email');
const { log } = require("console");

exports.homepage = function(req, res) {
    res.render('index');
};



// handler
exports.profile = function(req, res) {
    res.sendFile(path.resolve("views/profile.html"));
};

exports.uploadImage = (req, res) => {
    const email = req.userEmail;

    if (req.file) {
        // move image to public directory
        fs.renameSync(path.resolve(req.file.path), path.resolve(`public/img/${req.file.filename}`));
        // get the user profile details
        const user = accountDb.find(account => account.email == email);
        // if a user was found
        console.log(user);
        if (user) {
            profileDatabase.find(profile => {
                // attaches the user profile to the user account  
                profile.accountId = user.id;
                profile.status = user.status;
                profile.image = `../img/${req.file.filename}`;

                res.status(201).json({
                    okay: true,
                    data: profile,
                    message: "File uploaded successfully"
                });
            })

        } else {

            res.status(404).json({ okay: false, message: 'User account not found' });
        }
    } else res.status(304).json({ okay: false, message: "Failed to upload image" });
};


exports.deleteUser = async function(req, res) {

    const id = res.locals.userId;
    console.log(id);
    try {
        // deletes user account
        let deletedUsers = await userModel.findByIdAndDelete(id);
        let deletedUser = {...deletedUsers._doc };

        console.log(deletedUser);
        // checks if the user account was deleted / found
        if (deletedUser) {
            // deletes the user's password
            delete deletedUser.password;

            // deletes user profile
            const deletedProfile = await profileModel.findOneAndDelete({ email: deletedUser.email });

            // returns true if the user's profile was deleted / found or not
            deletedUser.deletedProfile = deletedProfile ? true : false;
            // deletes user permission
            const deletedPermission = await permissionModel.findOneAndDelete({ user: deletedUser._id });
            // returns true if the user's permisson was deleted / found or not
            // deletedUser.deletedPermission = deletedPermission ? true : false;

            deletedUser.deletedPermission = true;
            // send response to client
            res.json({ okay: true, message: "User deleted successfully", deletedUser });

        } else res.status(404).json({ okay: false, message: 'User account not found' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ okay: false, message: err.message });
    }

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

        // converts the user email to lowercase
        email = email.toLowerCase();

        // hashes the user password
        password = bcrypt.hashSync(password, 10);

        // creates the user data
        const user = {
            name,
            email,
            password
        };

        // saves the user in the db
        const createdUser = await userModel.create(user);

        // setup permission
        const permission = {
            user: createdUser._id
        };
        // save permission
        const createdPermission = await permissionModel.create(permission);

        // creates the user profile data
        const profile = {
            name,
            email,
            status: createdUser._id,
            permission: createdPermission._id
        };
        console.log(permission);
        // save user profile in the db
        const createdProfile = await profileModel.create(profile);

        // encrypt user id
        const token = jwt.sign({ id: createdUser._id }, 'lucifer_secret', { expiresIn: '1d' });

        // send account activation email
        emailService.sendEmail({
            email: createdUser.email,
            subject: 'Verify your account',
            body: `<h3> Welcome to our platform</h3> <p> Please use the button to verify your account.</p> <a href="http://localhost:3000/user/verify/?secure=${token}"> Activate account</a> `
        });

        // sends out response to the client
        res.json({ okay: true, message: "User created successfully" });

    } catch (err) {
        console.log(err);
        if (err.details) res.status(422).json({ okay: false, message: err.details[0].message })
        else res.status(500).json({ okay: false, message: err.message })
    }

};

exports.signIn = async(req, res) => {
    const object = joi.object({
        email: joi.string().email({ minDomainSegments: 2 }).required(),
        password: joi.string().required()
    });

    try {
        const data = await object.validateAsync(req.body);
        let { email, password } = data;
        // converts the user email to lowercase
        email = email.toLowerCase();

        userModel.findOne({ email }, (err, user) => {

            if (err || !user) res.status(404).json({ okay: false, message: "user not found" });
            else {
                const isPassword = bcrypt.compareSync(password, user.password);
                if (isPassword) {
                    // generates user token 
                    const token = jwt.sign({ id: user.id, email: user.email }, 'lucifer_secret', { expiresIn: '2d' });

                    // send out response with their token
                    res.status(200).json({ okay: true, user, token: `Bearer ${token}`, message: ' Logged in successfully' });
                } else {
                    res.status(400).json({ okay: false, message: ' Incorrect password' });
                }
            }
        });

    } catch (err) {
        res.status(422).json({ okay: false, message: err.details[0].message });
    }
};

// verify user account
exports.verifyAccount = async(req, res) => {
    const token = req.query.secure;
    try {
        // get the user id
        const { id } = jwt.verify(token, 'lucifer_secret');
        // get the user from the database
        const user = accountDb.find(data => data.id == id);
        log(user);
        // if user exist
        if (user) {
            // check if their not verified
            if (user.status != "verified") {
                // verifies user account
                user.status = "verified";
                accountDb.splice(accountDb.indexOf(user), 1, user);

                // send them an account verified email
                emailService.sendEmail({
                    email: user.email,
                    subject: 'Account verified',
                    body: `<h3> Welcome to our platform</h3> <p> Your account has been verified successfully.</p> `
                });

                // send a response to the client
                res.status(200).json({ okay: true, message: 'Account verified successfully' });

            } else res.status(304).json({ okay: false, message: 'User account already verified' });

        } else res.status(404).json({ okay: false, message: 'User not found' });

    } catch (err) {
        res.status(422).json({ okay: false, message: err.message });
    }
};


exports.getProfile = async(req, res) => {
    const email = res.locals.userEmail;

    // gets the user account details
    const account = await userModel.findOne({ email: email });

    // checks if user exist
    if (account) {
        // gets the user profile details
        profileModel
            .findOne({ email: email })
            .populate({ path: "status", select: "status" })
            .populate({ path: "permission", select: "type" })
            .then((profile) => {
                console.log(profile);

                // console.log(account);
                if (profile.email == account.email) {
                    // attaches the user profile to the user account  
                    profile.accountId = account._id;
                    profile.status = profile.status.status;
                    // sends out response to the client
                    res.status(200).json({ okay: true, data: profile });
                } else res.status(404).json({ okay: false, message: 'User profile not found' });
            }).catch(err => console.log(err));

    } else res.status(404).json({ okay: false, message: 'User account not found' });
};

exports.updateProfile = async(req, res) => {
    const email = req.userEmail;

    const user = accountDb.find(account => account.email == email);
    // if user was found
    if (user) {
        // gets the user profile details
        profileDatabase.find(profile => {
            const updatedProfile = {...profile, ...req.body };
            res.status(201).json({ okay: true, data: updatedProfile });
        })
    } else {
        res.status(404).json({ okay: false, message: 'User account not found' });
    }
}