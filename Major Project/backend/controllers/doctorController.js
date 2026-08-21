/* =========================================================
   HEALSPHERE - DOCTOR CONTROLLER
   ========================================================= */

const Doctor =
    require("../models/doctorModel");

const User =
    require("../models/userModel");

const Department =
    require("../models/departmentModel");

const {
    hashPassword
} = require("../utils/password");


/* ---------- Create Doctor ---------- */

async function createDoctor(
    req,
    res,
    next
) {

    try {

        const {
            name,
            email,
            phone,
            password,
            department,
            qualification,
            experience,
            consultationFee,
            specialization,
            availability,
            bio,
            profileImage
        } = req.body;


        /* ---------- Check Department ---------- */

        const selectedDepartment =
            await Department.findOne({
                _id: department,
                isActive: true
            });


        if (!selectedDepartment) {

            const error =
                new Error(
                    "Selected department was not found or is inactive."
                );

            error.statusCode = 404;

            throw error;
        }


        /* ---------- Check Existing User ---------- */

        const existingUser =
            await User.findOne({
                email:
                    email.toLowerCase()
            });


        if (existingUser) {

            const error =
                new Error(
                    "An account with this email already exists."
                );

            error.statusCode = 409;

            throw error;
        }


        /* ---------- Hash Password ---------- */

        const hashedPassword =
            await hashPassword(
                password
            );


        /* ---------- Create User ---------- */

        const user =
            await User.create({

                name,

                email:
                    email.toLowerCase(),

                phone,

                password:
                    hashedPassword,

                role:
                    "doctor"

            });


        try {

            /* ---------- Create Doctor Profile ---------- */

            const doctor =
                await Doctor.create({

                    user:
                        user._id,

                    department:
                        selectedDepartment._id,

                    qualification,

                    experience:
                        Number(experience),

                    consultationFee:
                        Number(consultationFee),

                    specialization:
                        specialization || "",

                    availability:
                        availability ||
                        "Mon - Sat, 9:00 AM - 5:00 PM",

                    bio:
                        bio || "",

                    profileImage:
                        profileImage || "",

                    isAvailable:
                        true

                });


            /* ---------- Return Complete Doctor ---------- */

            const createdDoctor =
                await Doctor.findById(
                    doctor._id
                )
                    .populate(
                        "user",
                        "-password"
                    )
                    .populate(
                        "department"
                    );


            return res.status(201).json({

                success: true,

                message:
                    "Doctor added successfully.",

                doctor:
                    createdDoctor

            });

        } catch (error) {

            /*
             * If Doctor creation fails after the User
             * was created, remove the User as well.
             * This prevents orphaned doctor accounts.
             */

            await User.findByIdAndDelete(
                user._id
            );

            throw error;
        }

    } catch (error) {

        next(error);

    }
}


/* ---------- Get All Doctors ---------- */

async function getAllDoctors(
    req,
    res,
    next
) {

    try {

        const doctors =
            await Doctor.find()
                .populate(
                    "user",
                    "-password"
                )
                .populate(
                    "department"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            count:
                doctors.length,

            doctors

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Get Doctors By Department ---------- */

async function getDoctorsByDepartment(
    req,
    res,
    next
) {

    try {

        /* ---------- Verify Department ---------- */

        const department =
            await Department.findOne({
                _id:
                    req.params.departmentId,

                isActive:
                    true
            });


        if (!department) {

            return res.status(404).json({

                success: false,

                message:
                    "Department not found or is inactive."

            });

        }


        /* ---------- Find Doctors ---------- */

        const doctors =
            await Doctor.find({

                department:
                    department._id,

                isAvailable:
                    true

            })
                .populate(
                    "user",
                    "-password"
                )
                .populate(
                    "department"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            count:
                doctors.length,

            doctors

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Get Doctor By ID ---------- */

async function getDoctorById(
    req,
    res,
    next
) {

    try {

        const doctor =
            await Doctor.findById(
                req.params.id
            )
                .populate(
                    "user",
                    "-password"
                )
                .populate(
                    "department"
                );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found."

            });

        }


        return res.status(200).json({

            success: true,

            doctor

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Get Current Doctor ---------- */

async function getMyProfile(
    req,
    res,
    next
) {

    try {

        const doctor =
            await Doctor.findOne({

                user:
                    req.user._id

            })
                .populate(
                    "user",
                    "-password"
                )
                .populate(
                    "department"
                );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor profile not found."

            });

        }


        return res.status(200).json({

            success: true,

            doctor

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Update Doctor ---------- */

async function updateDoctor(
    req,
    res,
    next
) {

    try {

        const doctor =
            await Doctor.findById(
                req.params.id
            );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found."

            });

        }


        /* ---------- Department Validation ---------- */

        if (
            req.body.department !== undefined
        ) {

            const department =
                await Department.findOne({

                    _id:
                        req.body.department,

                    isActive:
                        true

                });


            if (!department) {

                const error =
                    new Error(
                        "Selected department was not found or is inactive."
                    );

                error.statusCode = 404;

                throw error;
            }


            doctor.department =
                department._id;

        }


        /* ---------- Update Professional Fields ---------- */

        if (
            req.body.specialization !== undefined
        ) {

            doctor.specialization =
                req.body.specialization;

        }


        if (
            req.body.qualification !== undefined
        ) {

            doctor.qualification =
                req.body.qualification;

        }


        if (
            req.body.experience !== undefined
        ) {

            doctor.experience =
                Number(
                    req.body.experience
                );

        }


        if (
            req.body.consultationFee !== undefined
        ) {

            doctor.consultationFee =
                Number(
                    req.body.consultationFee
                );

        }


        if (
            req.body.availability !== undefined
        ) {

            doctor.availability =
                req.body.availability;

        }


        if (
            req.body.bio !== undefined
        ) {

            doctor.bio =
                req.body.bio;

        }


        if (
            req.body.profileImage !== undefined
        ) {

            doctor.profileImage =
                req.body.profileImage;

        }


        if (
            req.body.isAvailable !== undefined
        ) {

            doctor.isAvailable =
                Boolean(
                    req.body.isAvailable
                );

        }


        await doctor.save();


        /* ---------- Update User Information ---------- */

        if (doctor.user) {

            const userUpdates = {};


            if (
                req.body.name !== undefined
            ) {

                userUpdates.name =
                    req.body.name;

            }


            if (
                req.body.phone !== undefined
            ) {

                userUpdates.phone =
                    req.body.phone;

            }


            if (
                req.body.email !== undefined
            ) {

                userUpdates.email =
                    String(req.body.email).trim().toLowerCase();

            }


            if (
                Object.keys(
                    userUpdates
                ).length > 0
            ) {

                await User.findByIdAndUpdate(

                    doctor.user,

                    userUpdates,

                    {
                        new: true,
                        runValidators: true
                    }

                );

            }

        }


        /* ---------- Return Updated Doctor ---------- */

        const updatedDoctor =
            await Doctor.findById(
                doctor._id
            )
                .populate(
                    "user",
                    "-password"
                )
                .populate(
                    "department"
                );


        return res.status(200).json({

            success: true,

            message:
                "Doctor updated successfully.",

            doctor:
                updatedDoctor

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Delete / Deactivate Doctor ---------- */

async function deleteDoctor(
    req,
    res,
    next
) {

    try {

        const doctor =
            await Doctor.findById(
                req.params.id
            );


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found."

            });

        }


        /* ---------- Deactivate Doctor ---------- */

        doctor.isAvailable =
            false;

        await doctor.save();


        /* ---------- Deactivate User Account ---------- */

        if (doctor.user) {

            await User.findByIdAndUpdate(

                doctor.user,

                {
                    isActive:
                        false
                },

                {
                    new: true,
                    runValidators: true
                }

            );

        }


        return res.status(200).json({

            success: true,

            message:
                "Doctor deactivated successfully."

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Export Controller ---------- */

module.exports = {

    createDoctor,

    getAllDoctors,

    getDoctorsByDepartment,

    getDoctorById,

    getMyProfile,

    updateDoctor,

    deleteDoctor

};