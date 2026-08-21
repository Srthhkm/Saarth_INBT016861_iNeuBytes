/* =========================================================
   HEALSPHERE - ADMIN ROUTES
   ========================================================= */

const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
    getAdminProfile,
    updateAdminProfile
} = require("../controllers/adminController");

const router = express.Router();

router.get(
    "/me",
    protect,
    authorizeRoles("admin"),
    getAdminProfile
);

router.put(
    "/me",
    protect,
    authorizeRoles("admin"),
    updateAdminProfile
);

module.exports = router;