/* =========================================================
   HEALSPHERE - DEPARTMENT CONTROLLER
   ========================================================= */

const Department =
    require("../models/departmentModel");

const Doctor =
    require("../models/doctorModel");


/* ---------- Get All Departments ---------- */

async function getAllDepartments(
    req,
    res,
    next
) {

    try {

        const departments =
            await Department.find()
                .sort({
                    name: 1
                });


        return res.status(200).json({

            success: true,

            count:
                departments.length,

            departments

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Get Department By ID ---------- */

async function getDepartmentById(
    req,
    res,
    next
) {

    try {

        const department =
            await Department.findById(
                req.params.id
            );


        if (!department) {

            return res.status(404).json({

                success: false,

                message:
                    "Department not found."

            });

        }


        return res.status(200).json({

            success: true,

            department

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Create Department ---------- */

async function createDepartment(
    req,
    res,
    next
) {

    try {

        const {
            name,
            head,
            location,
            description
        } = req.body;


        const existingDepartment =
            await Department.findOne({
                name: {
                    $regex:
                        `^${name}$`,
                    $options: "i"
                }
            });


        if (existingDepartment) {

            const error =
                new Error(
                    "Department already exists."
                );

            error.statusCode = 409;

            throw error;

        }


        const department =
            await Department.create({

                name:
                    name.trim(),

                head:
                    head || "",

                location:
                    location || "",

                description:
                    description || "",

                isActive:
                    true

            });


        return res.status(201).json({

            success: true,

            message:
                "Department created successfully.",

            department

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Update Department ---------- */

async function updateDepartment(
    req,
    res,
    next
) {

    try {

        const department =
            await Department.findById(
                req.params.id
            );


        if (!department) {

            return res.status(404).json({

                success: false,

                message:
                    "Department not found."

            });

        }


        if (req.body.name !== undefined) {

            const duplicate =
                await Department.findOne({

                    name: {
                        $regex:
                            `^${req.body.name}$`,
                        $options: "i"
                    },

                    _id: {
                        $ne:
                            department._id
                    }

                });


            if (duplicate) {

                const error =
                    new Error(
                        "Another department with this name already exists."
                    );

                error.statusCode = 409;

                throw error;

            }


            department.name =
                req.body.name.trim();

        }


        if (
            req.body.description !== undefined
        ) {

            department.description =
                req.body.description;

        }


            if (req.body.head !== undefined) {

                department.head =
                req.body.head;

            }


            if (req.body.location !== undefined) {

                department.location =
                req.body.location;

            }


        /*
         * Allows Admin to reactivate a previously
         * deactivated department if required.
         */

        if (
            req.body.isActive !== undefined
        ) {

            department.isActive =
                Boolean(
                    req.body.isActive
                );

        }


        await department.save();


        return res.status(200).json({

            success: true,

            message:
                "Department updated successfully.",

            department

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Delete / Deactivate Department ---------- */

async function deleteDepartment(
    req,
    res,
    next
) {

    try {

        const department =
            await Department.findById(
                req.params.id
            );


        if (!department) {

            return res.status(404).json({

                success: false,

                message:
                    "Department not found."

            });

        }


        /* ---------- Deactivate Department ---------- */

        department.isActive =
            false;

        await department.save();


        /*
         * Doctors assigned to this department
         * are NOT deleted.
         *
         * Historical appointments remain intact.
         *
         * Inactive departments will no longer be
         * available for new doctor assignments
         * or patient bookings.
         */


        return res.status(200).json({

            success: true,

            message:
                "Department deactivated successfully."

        });

    } catch (error) {

        next(error);

    }
}


module.exports = {

    getAllDepartments,

    getDepartmentById,

    createDepartment,

    updateDepartment,

    deleteDepartment

};