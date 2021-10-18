const path = require("path");
const db = require('../model/database');
exports.processForm = (req, res) => {
    // how to distructure javascript object
    const { firstName, lastName, message } = req.body;
    console.log(req.body);
    if (!firstName || !lastName || !message) {
        // respond with a file
        // res.sendFile(path.resolve("views/error.html"));
        // respond with an object
        res.status(422).json({ ok: false, message: "Please fill all fields" })
    } else {
        db.contactDatabase.push({ firstName, lastName, message });
        // res.sendFile(path.resolve("views/success.html"))

        res.status(201).json({ ok: true, message: "Message sent!" })
    }
};