/* =========================================================
   HEALSPHERE - DOCTOR MODEL
   ========================================================= */

const mongoose = require("mongoose");


/* ---------- Doctor Schema ---------- */

const doctorSchema = new mongoose.Schema(
    {

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },

        qualification: {
            type: String,
            required: true,
            trim: true
        },

        experience: {
            type: Number,
            required: true,
            min: 0
        },

        consultationFee: {
            type: Number,
            required: true,
            min: 0
        },

        specialization: {
            type: String,
            trim: true
        },

        availability: {
            type: String,
            trim: true,
            default: "Mon - Sat, 9:00 AM - 5:00 PM"
        },

        bio: {
            type: String,
            trim: true,
            default: ""
        },

        profileImage: {
            type: String,
            default: ""
        },

        isAvailable: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "Doctor",
    doctorSchema
);