//jshint esversion:8
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const joi = require("joi");
const emailService = require('../utils/email');

const { userModel, profileModel, permissionModel } = require('../model/user');

exports.createAccount = async(req, res) =>{

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
            user: createdUser._id,
            type: "admin"
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

}

exports.deleteAccount = async (req, res) => {

    try{

        const id = req.params.id;
        const user = await userModel.findById(id);

        console.log(user)

        if(user){
            // delete the user account
            let deletedUser = await userModel.findByIdAndDelete(user._id);
            console.log(deletedUser)
            
            deletedUser = {...deletedUser._doc}

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
                deletedUser.deletedPermission = deletedPermission ? true : false;;
                // send response to client
                res.json({ okay: true, message: "User deleted successfully", deletedUser });
    
            } else res.status(404).json({ okay: false, message: 'User account not found' });
        } else res.status(404).json({ okay: false, message: 'User account not found' });
    }
    catch(error)
    {
        console.log(error)
        res.json({okay: false, message: error.message}
        )
    }
}