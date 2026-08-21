/* =========================================================
   HEALSPHERE - CONTACT ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const {
    createContactMessage,
    getContactMessages,
    updateContactMessage,
    replyToContactMessage
} = require("../controllers/contactController");

const protect =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");

const {
    validateRequiredFields,
    validateEmail
} = require("../middleware/validationMiddleware");


/* ---------- Submit Contact Message ---------- */

router.post(
    "/",
    validateRequiredFields([
        "name",
        "email",
        "message"
    ]),
    (req, res, next) => {

        if (!validateEmail(String(req.body.email).trim())) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid email address."

            });
        }


        next();
    },
    createContactMessage
);


router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    getContactMessages
);


router.patch(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateContactMessage
);


router.post(
    "/:id/reply",
    protect,
    authorizeRoles("admin"),
    validateRequiredFields(["reply"]),
    replyToContactMessage
);


module.exports = router;