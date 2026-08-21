/* =========================================================
   HEALSPHERE - CONTACT MESSAGE MODEL
   ========================================================= */

const mongoose = require("mongoose");


/* ---------- Contact Message Schema ---------- */

const contactMessageSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            trim: true
        },

        subject: {
            type: String,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "new",
                "read",
                "replied"
            ],
            default: "new"
        }

    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "ContactMessage",
    contactMessageSchema
);