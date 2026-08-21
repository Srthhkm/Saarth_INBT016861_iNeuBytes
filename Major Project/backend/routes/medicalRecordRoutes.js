/* =========================================================
   HEALSPHERE - MEDICAL RECORD ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const {
    createMedicalRecord,
    getMyMedicalRecords,
    getPatientMedicalRecords,
    getAllMedicalRecords,
    updateMedicalRecord
} = require("../controllers/medicalRecordController");

const {
    uploadMedicalDocument,
    getMyMedicalDocuments,
    downloadMedicalDocument,
    deleteMedicalDocument
} = require("../controllers/medicalDocumentController");

const {
    uploadMedicalDocumentFile
} = require("../middleware/medicalDocumentUploadMiddleware");

const protect =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");


/* ---------- Patient: My Records ---------- */

router.get(
    "/my",
    protect,
    authorizeRoles("patient"),
    getMyMedicalRecords
);


/* ---------- Patient: Uploaded Documents ---------- */

router.get(
    "/documents/my",
    protect,
    authorizeRoles("patient"),
    getMyMedicalDocuments
);


router.post(
    "/documents",
    protect,
    authorizeRoles("patient"),
    uploadMedicalDocumentFile,
    uploadMedicalDocument
);


router.get(
    "/documents/:id/download",
    protect,
    authorizeRoles("patient"),
    downloadMedicalDocument
);


router.delete(
    "/documents/:id",
    protect,
    authorizeRoles("patient"),
    deleteMedicalDocument
);


/* ---------- Doctor: Create Record ---------- */

router.post(
    "/",
    protect,
    authorizeRoles("doctor"),
    createMedicalRecord
);


/* ---------- All Records ---------- */

router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    getAllMedicalRecords
);


/* ---------- Records For Patient ---------- */

router.get(
    "/patient/:patientId",
    protect,
    authorizeRoles(
        "admin",
        "doctor"
    ),
    getPatientMedicalRecords
);


/* ---------- Update Record ---------- */

router.patch(
    "/:id",
    protect,
    authorizeRoles("doctor"),
    updateMedicalRecord
);


module.exports = router;