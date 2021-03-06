// imports express from the node_modules folder
var express = require('express');
const user = require("./controller/user");
const path = require('path');

const upload = require("./utils/multerConfig");

// initialize express to  app variable
const app = express();

app.use(express.static("./views"));
app.use(express.static(path.resolve('public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/v1/', user.homepage)

// updates a user 
app.put('/v1/user/:id', upload.single("avatar"), user.updateUser);

// get all users
app.get("/v1/user/all", user.getAllUsers);

// Get a single user
app.get("/v1/user/:id", user.getOneUser);
// create a user
app.post("/v1/user", user.createUser);
app.delete('/v1/user/:id', user.deleteUser);

// set the port to listening on 
app.set('port', process.env.PORT || 3000);
// get the port and listen on it
app.listen(app.get("port"), _ => console.log(`listening on port ${app.get("port")}`));