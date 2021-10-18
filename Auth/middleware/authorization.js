const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    try {
        // extracts the token from the header
        let token = req.headers.authorization.split(' ')[1];
        // verifies the user token
        const data = jwt.verify(token, 'lucifer_secret');
        // attaches the user id to the request
        res.locals.userId = data.id;
        // move to next middleware
        next();
    } catch (err) {
        console.log(err.message);
        return res.status(401).json({
            message: 'Unauthorized user'
        });
    }
};