/* =========================================================
   HEALSPHERE - AUTHENTICATION ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const {
    register,
    createAccount,
    login,
    logout,
    getCurrentUser,
    updatePassword
} = require("../controllers/authController");

const protect =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");

const {
    validateRequiredFields,
    validateEmail,
    validatePhone,
    validatePassword
} = require("../middleware/validationMiddleware");


/* ---------- Register ---------- */

router.post(
    "/register",

    validateRequiredFields([
        "name",
        "email",
        "password"
    ]),

    (req, res, next) => {

        if (!validateEmail(req.body.email)) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid email address."

            });

        }

        next();
    },

    (req, res, next) => {

        if (!validatePassword(req.body.password)) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 6 characters."

            });

        }

        next();
    },

    (req, res, next) => {

        if (
            req.body.phone &&
            !validatePhone(req.body.phone)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Phone number must contain exactly 10 digits."

            });

        }

        next();
    },

    register
);


/* ---------- Login ---------- */

router.post(
    "/login",

    validateRequiredFields([
        "email",
        "password"
    ]),

    (req, res, next) => {

        if (!validateEmail(req.body.email)) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid email address."

            });

        }

        next();
    },

    login
);


/* ---------- Admin: Create Administrator ---------- */

router.post(
    "/accounts",
    protect,
    authorizeRoles("admin"),
    validateRequiredFields([
        "name",
        "email",
        "password",
        "role"
    ]),
    (req, res, next) => {

        if (req.body.role !== "admin") {

            return res.status(400).json({

                success: false,

                message:
                    "Only administrator accounts can be created through this endpoint."

            });
        }


        if (!validateEmail(req.body.email)) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid email address."

            });
        }


        if (!validatePassword(req.body.password)) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 6 characters."

            });
        }


        next();
    },
    createAccount
);


/* ---------- Logout ---------- */

router.post(
    "/logout",
    protect,
    logout
);


/* ---------- Current User ---------- */

router.get(
    "/me",
    protect,
    getCurrentUser
);


/* ---------- Change Password ---------- */

router.patch(
    "/password",
    protect,
    validateRequiredFields([
        "currentPassword",
        "newPassword"
    ]),
    (req, res, next) => {

        if (!validatePassword(req.body.newPassword)) {

            return res.status(400).json({

                success: false,

                message:
                    "New password must contain at least 6 characters."

            });
        }

        next();
    },
    updatePassword
);


module.exports = router;