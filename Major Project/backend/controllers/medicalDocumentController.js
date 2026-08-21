/* =========================================================
   HEALSPHERE - PATIENT MEDICAL DOCUMENT CONTROLLER
   ========================================================= */

const fs = require("fs/promises");
const path = require("path");

const MedicalDocument = require("../models/medicalDocumentModel");
const Patient = require("../models/patientModel");
const {
    uploadDirectory
} = require("../middleware/medicalDocumentUploadMiddleware");


async function getCurrentPatient(userId) {
    return Patient.findOne({
        user: userId
    });
}


async function uploadMedicalDocument(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a document to upload."
            });
        }

        const patient = await getCurrentPatient(req.user._id);

        if (!patient) {
            await fs.unlink(req.file.path).catch(() => {});

            return res.status(404).json({
                success: false,
                message: "Patient profile not found."
            });
        }

        const document = await MedicalDocument.create({
            patient: patient._id,
            title: req.body.title || req.file.originalname,
            category: req.body.category || "Other",
            description: req.body.description || "",
            originalName: req.file.originalname,
            storedName: req.file.filename,
            mimeType: req.file.mimetype,
            fileSize: req.file.size
        });

        return res.status(201).json({
            success: true,
            message: "Medical document uploaded successfully.",
            document: {
                ...document.toObject(),
                downloadUrl: `/api/medical-records/documents/${document._id}/download`
            }
        });
    } catch (error) {
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(() => {});
        }

        next(error);
    }
}


async function getMyMedicalDocuments(req, res, next) {
    try {
        const patient = await getCurrentPatient(req.user._id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found."
            });
        }

        const documents = await MedicalDocument.find({
            patient: patient._id
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            count: documents.length,
            documents: documents.map(document => ({
                ...document.toObject(),
                downloadUrl: `/api/medical-records/documents/${document._id}/download`
            }))
        });
    } catch (error) {
        next(error);
    }
}


async function downloadMedicalDocument(req, res, next) {
    try {
        const patient = await getCurrentPatient(req.user._id);
        const document = patient
            ? await MedicalDocument.findOne({
                _id: req.params.id,
                patient: patient._id
            })
            : null;

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Medical document not found."
            });
        }

        const filePath = path.join(
            uploadDirectory,
            document.storedName
        );

        return res.download(
            filePath,
            document.originalName,
            error => {
                if (error && !res.headersSent) {
                    next(error);
                }
            }
        );
    } catch (error) {
        next(error);
    }
}


async function deleteMedicalDocument(req, res, next) {
    try {
        const patient = await getCurrentPatient(req.user._id);
        const document = patient
            ? await MedicalDocument.findOneAndDelete({
                _id: req.params.id,
                patient: patient._id
            })
            : null;

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Medical document not found."
            });
        }

        await fs.unlink(
            path.join(uploadDirectory, document.storedName)
        ).catch(() => {});

        return res.status(200).json({
            success: true,
            message: "Medical document deleted successfully."
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    uploadMedicalDocument,
    getMyMedicalDocuments,
    downloadMedicalDocument,
    deleteMedicalDocument
};
