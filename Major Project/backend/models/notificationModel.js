/* =========================================================
   HEALSPHERE - NOTIFICATION MODEL
   ========================================================= */

const mongoose = require("mongoose");


const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        type: {
            type: String,
            enum: ["appointment", "medical-record", "system"],
            default: "system"
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        readAt: {
            type: Date,
            default: null
        },

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            default: null
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "Notification",
    notificationSchema
);
