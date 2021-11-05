const { Schema, model } = require('mongoose');

const accountSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "pending",
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

});

const profileSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    status: {
        type: Schema.Types.ObjectId,
        ref: "accounts"
    },
    permission: {
        type: Schema.Types.ObjectId,
        ref: "permissions"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const permissionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "accounts"
    },
    type: {
        type: String,
        required: true,
        trim: true,
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

exports.userModel = model('accounts', accountSchema);
exports.permissionModel = model('permissions', permissionSchema);
exports.profileModel = model('profiles', profileSchema);