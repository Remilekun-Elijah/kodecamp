const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
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