const jwt = require('jsonwebtoken');

exports.loginAuthorization = (req, res, next) => {
    try {
        // gets the token from authorization header
        let token = req.headers.authorization.split(" ")[1];
        // verifies the token
        const user = jwt.verify(token, "lucifer_secret");
        // attaches the user email to the request 
        res.locals.userEmail = user.email;

        // attaches the user id to the request
        res.locals.userId = user.id;
        // attaches the user email to req object
        req.userEmail = user.email;
        next();
    } catch (error) {
        res.status(401).json({ okay: false, message: "Session expired, please login again." });
    }
}

exports.adminAuthorization = async (req, res, next) => {
    const { userModel, profileModel, permissionModel } = require('../model/user');
    try {
        const permission = await permissionModel.findOne({user: res.locals.userId});

    // checks if user exist
    if (permission) {
        // gets the user profile details
        if(permission.type === "admin"|| permission.type === "superAdmin") next();
        else res.status(401).json({ okay: false, message: "User not authorized!" });
    } else res.status(404).json({ okay: false, message: 'User account not found' });
    } catch (error) {
        res.status(500).json({ okay: false, message: error.message });
    }
}