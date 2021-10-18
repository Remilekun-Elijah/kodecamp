const multer = require("multer");
const path = require("path");
const uuid = require("uuid");
const storage = multer.diskStorage({

    destination: function(req, file, cb) {
        cb(null, 'uploads');

    },
    filename: function(req, file, cb) {

        let filename = `${uuid.v4()}${path.extname(file.originalname)}`;
        cb(null, filename);

    },
    // 50mb max file size
    fileSize: 50000000,
    fileFilter: function(req, file, cb) {}
});

const upload = multer({ storage: storage });
module.exports = upload;