/* =========================================================
   HEALSPHERE - MEDICAL RECORD MODEL
   ========================================================= */

const mongoose = require("mongoose");


/* ---------- Medical Record Schema ---------- */

const medicalRecordSchema = new mongoose.Schema(
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

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment"
        },

        diagnosis: {
            type: String,
            required: true,
            trim: true
        },

        symptoms: {
            type: String,
            trim: true,
            default: ""
        },

        treatment: {
            type: String,
            trim: true,
            default: ""
        },

        prescription: {
            type: String,
            trim: true,
            default: ""
        },

        notes: {
            type: String,
            trim: true,
            default: ""
        },

        recordDate: {
            type: Date,
            default: Date.now
        }

    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "MedicalRecord",
    medicalRecordSchema
);