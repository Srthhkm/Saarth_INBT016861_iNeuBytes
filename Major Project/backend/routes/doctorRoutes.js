/* =========================================================
   HEALSPHERE - DOCTOR ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const {
    createDoctor,
    getAllDoctors,
    getDoctorsByDepartment,
    getDoctorById,
    getMyProfile,
    updateDoctor,
    deleteDoctor
} = require("../controllers/doctorController");

const protect =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");


/* ---------- Admin: Create Doctor ---------- */

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createDoctor
);


/* ---------- Current Doctor ---------- */

router.get(
    "/me",
    protect,
    authorizeRoles("doctor"),
    getMyProfile
);


/* ---------- Doctors By Department ---------- */

/*
 * Must appear before /:id so "department"
 * isn't interpreted as a doctor ID.
 */

router.get(
    "/department/:departmentId",
    protect,
    authorizeRoles(
        "admin",
        "doctor",
        "patient"
    ),
    getDoctorsByDepartment
);


/* ---------- All Doctors ---------- */

router.get(
    "/",
    protect,
    authorizeRoles(
        "admin",
        "doctor",
        "patient"
    ),
    getAllDoctors
);


/* ---------- Doctor By ID ---------- */

router.get(
    "/:id",
    protect,
    authorizeRoles(
        "admin",
        "doctor",
        "patient"
    ),
    getDoctorById
);


/* ---------- Update Doctor ---------- */

router.patch(
    "/:id",
    protect,
    authorizeRoles("admin", "doctor"),
    updateDoctor
);


/* ---------- Delete Doctor ---------- */

router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteDoctor
);


module.exports = router;