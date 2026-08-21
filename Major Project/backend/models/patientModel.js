/* =========================================================
   HEALSPHERE - PATIENT MODEL
   ========================================================= */

const mongoose = require("mongoose");


/* ---------- Patient Schema ---------- */

const patientSchema = new mongoose.Schema(
    {

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        age: {
            type: Number,
            min: 0,
            max: 150
        },

        gender: {
            type: String,
            enum: [
                "Male",
                "Female",
                "Other",
                "Prefer not to say"
            ]
        },

        dateOfBirth: {
            type: Date
        },

        address: {
            type: String,
            trim: true,
            default: ""
        },

        bloodGroup: {
            type: String,
            trim: true,
            default: ""
        },

        emergencyContact: {
            name: {
                type: String,
                trim: true,
                default: ""
            },

            phone: {
                type: String,
                trim: true,
                default: ""
            },

            relationship: {
                type: String,
                trim: true,
                default: ""
            }
        },

        profileImage: {
            type: String,
            default: ""
        }

    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "Patient",
    patientSchema
);