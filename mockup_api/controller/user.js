const allUserRecords = require("../model/database");

exports.homepage = function(req, res) {
    res.render('index');
};
// handler
exports.getAllUsers = function(req, res) {
    // checks if users records isn't empty
    if (allUserRecords.length > 0) {
        // send out users records
        res.status(200).send(allUserRecords);
    } else {
        // send out error message
        res.status(404).send("No User at the moment.");
    }
};


// handler
exports.updateUser = function(req, res) {
    const id = parseInt(req.params.id);
    const user = allUserRecords.find((user, index) => {
        // returns the user with their index(position) in the array(database)
        if (user.id === id) {
            user.dataId = index;
            return user;
        }
        // return false if user isn't found
        else return false;
    });

    if (user) {
        // creates a new user object
        let updatedUserRecord = {};
        // sets the updated record id to the user id
        updatedUserRecord.id = user.id;
        // sets the updated user name to the user new name or use the old name
        updatedUserRecord.name = req.body.name || user.name;
        // sets the updated user age to the user new age or use the old age
        updatedUserRecord.age = req.body.age || user.age;
        // sets the updated user address to the user new address or use the old address
        updatedUserRecord.address = req.body.address || user.address;

        // update photo
        updatedUserRecord.photo = req.file.path || user.photo;
        // updates the user record with the updated one
        allUserRecords.splice(user.dataId, 1, updatedUserRecord);
        // sends out all users records with the updated one
        res.status(201).json({ success: true, data: updatedUserRecord, message: "User updated successfully" });
    } else res.status(404).json({ success: false, message: "User not found" });
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


exports.createUser = function(req, res) {
    // object destructuring
    const { name, address, age } = req.body;
    // checks if the request data isn't empty
    if (name && address && age) {
        // create a new id if the array is empty
        let id = 1000;
        // gets the last users id and increment it by 1 if the array is not empty
        if (allUserRecords.length > 0) id = allUserRecords[allUserRecords.length - 1].id + 1;
        // sets the user id 
        req.body.id = id;
        // save the data in our database
        allUserRecords.push(req.body);

        // send out response to the client
        res.status(201).json({ success: true, data: req.body });
    } else {
        // sends out error if the request data is empty or missing some required data
        res.status(400).json({ success: false, message: "Bad input" });
    }
};