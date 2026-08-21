/* =========================================================
   HEALSPHERE - DEPARTMENT ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require("../controllers/departmentController");

const protect =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");


/* ---------- Get All Departments ---------- */

router.get(
    "/",
    protect,
    authorizeRoles(
        "admin",
        "doctor",
        "patient"
    ),
    getAllDepartments
);


/* ---------- Get Department By ID ---------- */

router.get(
    "/:id",
    protect,
    authorizeRoles(
        "admin",
        "doctor",
        "patient"
    ),
    getDepartmentById
);


/* ---------- Create Department ---------- */

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createDepartment
);


/* ---------- Update Department ---------- */

router.patch(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateDepartment
);


/* ---------- Delete Department ---------- */

router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteDepartment
);


module.exports = router;