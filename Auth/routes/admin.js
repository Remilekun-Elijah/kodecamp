const route = require("express").Router();


const admin = require("../controller/admin");
const {loginAuthorization, adminAuthorization} = require("../middleware/authorization");

route.post("/admin/create", loginAuthorization, adminAuthorization,  admin.createAccount)
route.delete("/admin/delete/:id", loginAuthorization, adminAuthorization, admin.deleteAccount);


module.exports = route;