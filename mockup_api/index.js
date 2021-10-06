// imports express from the node_modules folder
var express = require('express');

// initialize express to  app variable
var app = express();

/** MIDDLEWARE  Analogy **/
/*
middleware is a function that gets executed before the route handler
it is used to check if the user is authenticated or not before allowing the user to access the route handler
>> User       Middleware                    Middleware       Handler
// Client -- express.json(bodyParser), app.use(morgan) -- function(handler)
*/
// express.json(bodyParser) middleware to parse the request body
app.use(express.json({ urlEncoded: false }))
    /* 
        ALL USER RECORDS    
     serves as our mock database
    */
let allUserRecords = [{
        id: 1001,
        name: "John Doe",
        age: 30,
        address: "123 Main Street"
    }, {
        id: 1002,
        name: "Jane Doe",
        age: 27,
        address: "123 Main Street"
    },
    {
        id: 1003,
        name: "Joe Smith",
        age: 15,
        address: "123 Main Street"
    }
];

// handler
function getAllUsers(req, res) {
    // checks if users records isn't empty
    if (allUserRecords.length > 0) {
        // send out users records
        res.status(200).send(allUserRecords);
    } else {
        // send out error message
        res.status(404).send("No User at the moment.");
    }
}

// get all users
app.get("/user/all", getAllUsers);


// handler
function updateUser(req, res) {
    const id = parseInt(req.params.id);
    // finds the user 
    const user = allUserRecords.find((user, index) => {
        // returns the user with their index(position) in the array(database)
        if (user.id === id) return user.dataId = index;
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

        // updates the user record with the updated one
        allUserRecords.splice(user.dataId, 1, updatedUserRecord);
        // sends out the updated user record
        res.status(201).json({ success: true, data: updatedUserRecord, message: "User updated successfully" });
    } else res.status(404).json({ success: false, message: "User not found" });
}

// updates a user 
app.put('/user/:id', updateUser);



// handler 
function getOneUser(req, res) {
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
}

// Get a single user
app.get("/user/:id", getOneUser);


// create a user
app.post("/user", (req, res) => {
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
});

// delete a user
app.delete('/user/:id', (req, res) => {
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
    // checks if the user was found or not
    if (user) {
        // delete the user using their index
        allUserRecords.splice(user.dataId, 1);
        // send out response to the client
        res.status(200).send({ succes: true, data: user, message: "User deleted successfully" });
    } else res.status(404).json({ success: false, message: "User not found" });
});

// set the port to listening on 
app.set('port', process.env.PORT || 3000);
// get the port and listen on it
app.listen(app.get("port"), _ => console.log(`listening on port ${app.get("port")}`));
