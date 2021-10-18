// imports express from the node_modules folder
var express = require('express');
const user = require("./controller/user");
const authorization = require("./middleware/authorization");
const morgan = require("morgan");
const path = require('path');

const upload = require("./utils/multerConfig");

// initialize express to  app variable
const app = express();

// set the view engine to ejs
// app.set('view engine', 'ejs'); 
// app.set('views', './views');

app.use(express.static("./views"));
app.use(express.static(path.resolve('public')));
app.use(morgan("dev"));
/** MIDDLEWARE  Analogy **/
/*
middleware is a function that gets executed before the route handler
it is used to check if the user is authenticated or not before allowing the user to access the route
>> User       Middleware                    Middleware       Handler
// Client -- express.json(bodyParser), app.use(morgan) -- function(handler)
*/
// express.json(bodyParser) middleware to parse the request body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// display the home page
app.get('/', user.homepage);

// displays the profile page
app.get("/profile", user.profile);

// uploads the user image
app.post('/user/uploadPic', upload.single('avatar'), user.uploadImage);

// creates a new user account
app.post("/user/signup", user.createUser);

// authenticates the user
app.post('/user/login', user.signIn);

// gets the user profile
app.post('/profile', authorization, user.getProfile);



// sets the port to listening on 
app.set('port', process.env.PORT || 3000);

app.listen(app.get("port"), _ => console.log(`listening on port ${app.get("port")}`));