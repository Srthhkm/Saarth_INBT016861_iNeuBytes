/* =========================================================
   HEALSPHERE - USER MODEL
   ========================================================= */

const mongoose = require("mongoose");


/* ---------- User Schema ---------- */

const userSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: ["admin", "doctor", "patient"],
            default: "patient",
            required: true
        },

        phone: {
            type: String,
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps: true
    }
);


/* ---------- Remove Password from JSON Responses ---------- */

userSchema.methods.toJSON = function () {

    const user = this.toObject();

    delete user.password;

    return user;
};


module.exports = mongoose.model("User", userSchema);