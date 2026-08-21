/* =========================================================
   HEALSPHERE - APPOINTMENT ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const {
    createAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAllAppointments,
    updateAppointmentStatus,
    rescheduleAppointment,
    cancelAppointment
} = require("../controllers/appointmentController");

const protect =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");


/* ---------- Patient: Create Appointment ---------- */

router.post(
    "/",
    protect,
    authorizeRoles("patient"),
    createAppointment
);


/* ---------- Patient: My Appointments ---------- */

router.get(
    "/my",
    protect,
    authorizeRoles("patient"),
    getMyAppointments
);


/* ---------- Doctor: My Appointments ---------- */

router.get(
    "/doctor",
    protect,
    authorizeRoles("doctor"),
    getDoctorAppointments
);


/* ---------- Admin: All Appointments ---------- */

router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    getAllAppointments
);


/* ---------- Update Appointment Status ---------- */

router.patch(
    "/:id/status",
    protect,
    authorizeRoles(
        "admin",
        "doctor"
    ),
    updateAppointmentStatus
);


/* ---------- Admin: Reschedule Appointment ---------- */

router.patch(
    "/:id/reschedule",
    protect,
    authorizeRoles("admin"),
    rescheduleAppointment
);


/* ---------- Cancel Appointment ---------- */

router.patch(
    "/:id/cancel",
    protect,
    authorizeRoles(
        "admin",
        "doctor",
        "patient"
    ),
    cancelAppointment
);


module.exports = router;