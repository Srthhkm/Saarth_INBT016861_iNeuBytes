/* =========================================================
   HEALSPHERE - DEPARTMENT MODEL
   ========================================================= */

const mongoose = require("mongoose");


/* ---------- Department Schema ---------- */

const departmentSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        head: {
            type: String,
            trim: true,
            default: ""
        },

        location: {
            type: String,
            trim: true,
            default: ""
        },

        description: {
            type: String,
            trim: true,
            default: ""
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


module.exports = mongoose.model(
    "Department",
    departmentSchema
);