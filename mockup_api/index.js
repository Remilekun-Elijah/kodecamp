// imports express from the node_modules folder
var express = require('express');
const user = require("./controller/user");
const contact = require("./controller/contact");
const path = require('path');

const upload = require("./utils/multerConfig");

// initialize express to  app variable
const app = express();

// app.set('view engine', 'ejs'); 
// app.set('views', './views');

app.use(express.static("./views"));
app.use(express.static(path.resolve('public')));

/** MIDDLEWARE  Analogy **/
/*
middleware is a function that gets executed before the route handler
it is used to check if the user is authenticated or not before allowing the user to access the route handler
>> User       Middleware                    Middleware       Handler
// Client -- express.json(bodyParser), app.use(morgan) -- function(handler)
*/
// express.json(bodyParser) middleware to parse the request body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', user.homepage)

// updates a user 
app.put('/user/:id', upload.single("avatar"), user.updateUser);

// get all users
app.get("/user/all", user.getAllUsers);

// Get a single user
app.get("/user/:id", user.getOneUser);
// create a user
app.post("/user", user.createUser);
app.delete('/user/:id', user.deleteUser);

app.post("/contact", contact.processForm);
// set the port to listening on 
app.set('port', process.env.PORT || 3000);
// get the port and listen on it
app.listen(app.get("port"), _ => console.log(`listening on port ${app.get("port")}`));