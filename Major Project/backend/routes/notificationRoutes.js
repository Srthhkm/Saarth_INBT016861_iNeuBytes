/* =========================================================
   HEALSPHERE - NOTIFICATION ROUTES
   ========================================================= */

const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/my", protect, getMyNotifications);
router.patch("/read-all", protect, markAllNotificationsRead);
router.patch("/:id/read", protect, markNotificationRead);

module.exports = router;