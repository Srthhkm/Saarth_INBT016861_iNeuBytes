/* =========================================================
   HEALSPHERE - PATIENT MEDICAL DOCUMENT MODEL
   ========================================================= */

const mongoose = require("mongoose");


const medicalDocumentSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },

        category: {
            type: String,
            enum: [
                "Prescription",
                "Lab Report",
                "Scan / Imaging",
                "Insurance",
                "Other"
            ],
            default: "Other"
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        originalName: {
            type: String,
            required: true
        },

        storedName: {
            type: String,
            required: true,
            unique: true
        },

        mimeType: {
            type: String,
            required: true
        },

        fileSize: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "MedicalDocument",
    medicalDocumentSchema
);
