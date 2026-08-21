/* =========================================================
   HEALSPHERE - PATIENT ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const {

    getMyProfile,
    updateMyProfile,
    getAllPatients,
    createPatient,
    updatePatient,
    getDoctorPatients,
    getPatientById,
    deletePatient

} = require("../controllers/patientController");

const protect =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");


/* ---------- Current Patient ---------- */

router.get(

    "/me",

    protect,

    authorizeRoles("patient"),

    getMyProfile

);


/* ---------- Update Current Patient ---------- */

router.patch(

    "/me",

    protect,

    authorizeRoles("patient"),

    updateMyProfile

);


/* ---------- Admin: Get All Patients ---------- */

router.get(

    "/",

    protect,

    authorizeRoles("admin"),

    getAllPatients

);


/* ---------- Admin: Create Patient ---------- */

router.post(

    "/",

    protect,

    authorizeRoles("admin"),

    createPatient

);


/* ---------- Admin: Update Patient ---------- */

router.patch(

    "/:id",

    protect,

    authorizeRoles("admin"),

    updatePatient

);


/* ---------- Doctor: Get My Patients ---------- */

/*
 * This route must appear before /:id.
 *
 * Otherwise "doctor" would be interpreted
 * as a patient ID and MongoDB would throw:
 *
 * Cast to ObjectId failed for value "doctor"
 */

router.get(

    "/doctor",

    protect,

    authorizeRoles("doctor"),

    getDoctorPatients

);


/* ---------- Get Patient By ID ---------- */

router.get(

    "/:id",

    protect,

    authorizeRoles(
        "admin",
        "doctor"
    ),

    getPatientById

);


/* ---------- Admin: Delete Patient ---------- */

router.delete(

    "/:id",

    protect,

    authorizeRoles("admin"),

    deletePatient

);


module.exports = router;