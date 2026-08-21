/* =========================================================
   HEALSPHERE - APPOINTMENT MODEL
   ========================================================= */

const mongoose = require("mongoose");


/* ---------- Appointment Schema ---------- */

const appointmentSchema = new mongoose.Schema(
    {

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },

        appointmentDate: {
            type: Date,
            required: true
        },

        appointmentTime: {
            type: String,
            required: true,
            trim: true
        },

        reason: {
            type: String,
            trim: true,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "completed",
                "cancelled"
            ],
            default: "pending"
        },

        notes: {
            type: String,
            trim: true,
            default: ""
        },

        cancellationReason: {
            type: String,
            trim: true,
            default: ""
        }

    },
    {
        timestamps: true
    }
);


/* ---------- Indexes ---------- */

/*
 * Helps prevent accidental duplicate bookings
 * for the same doctor, date and time.
 */
appointmentSchema.index(
    {
        doctor: 1,
        appointmentDate: 1,
        appointmentTime: 1
    },
    {
        name: "unique_active_doctor_slot",
        unique: true,
        partialFilterExpression: {
            status: {
                $ne: "cancelled"
            }
        }
    }
);


module.exports = mongoose.model(
    "Appointment",
    appointmentSchema
);