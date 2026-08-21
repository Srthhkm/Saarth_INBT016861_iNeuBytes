/* =========================================================
   HEALSPHERE - REPORT ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const {
    getSystemReport,
    getAppointmentReport
} = require("../controllers/reportController");

const protect =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");


/* ---------- System Report ---------- */

router.get(
    "/system",
    protect,
    authorizeRoles("admin"),
    getSystemReport
);


/* ---------- Appointment Report ---------- */

router.get(
    "/appointments",
    protect,
    authorizeRoles("admin"),
    getAppointmentReport
);


module.exports = router;