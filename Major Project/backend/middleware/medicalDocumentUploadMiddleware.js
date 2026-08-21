/* =========================================================
   HEALSPHERE - MEDICAL DOCUMENT UPLOAD
   ========================================================= */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");


const uploadDirectory = path.join(
    __dirname,
    "../uploads/medical-records"
);


fs.mkdirSync(
    uploadDirectory,
    { recursive: true }
);


const allowedMimeTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png"
]);


const allowedExtensions = new Set([
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png"
]);


const storage = multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        callback(
            null,
            `${crypto.randomUUID()}${extension}`
        );
    }
});


const medicalDocumentUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if (
            allowedMimeTypes.has(file.mimetype) &&
            allowedExtensions.has(extension)
        ) {
            callback(null, true);
            return;
        }

        callback(
            new Error("Only PDF, JPG, JPEG and PNG files are allowed.")
        );
    }
});


function uploadMedicalDocumentFile(req, res, next) {
    medicalDocumentUpload.single("document")(
        req,
        res,
        error => {
            if (error) {
                error.statusCode = 400;
            }

            next(error);
        }
    );
}


module.exports = {
    uploadMedicalDocumentFile,
    uploadDirectory
};
