// imports express from the node_modules folder
var express = require('express');
const user = require("./controller/user");
const authorization = require("./middleware/authorization");
const morgan = require("morgan");
const path = require('path');
const mongoose = require('mongoose');

// loads environment variables from .env file
require('dotenv/config');

//connect to mongodb
mongoose.connect(process.env.MONGODB_URI, (err) => {
    if (err) console.log(err.message);
    else console.log("connected to mongodb");
});

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

// verifies the user account
app.get("/user/verify", user.verifyAccount);

// authenticates the user
app.post('/user/login', user.signIn);

// gets the user profile
app.post('/profile', authorization, user.getProfile);

app.patch('/profile', authorization, user.updateProfile);

// deletes user account
app.delete('/user', authorization, user.deleteUser);
// sets the port to listening on 
app.set('port', process.env.PORT || 3000);

app.use(function(req, res, next) {
    res.status(404).sendFile(require('path').join(__dirname, 'views', 'error.html'));
});
app.listen(app.get("port"), _ => console.log(`listening on port ${app.get("port")}`));