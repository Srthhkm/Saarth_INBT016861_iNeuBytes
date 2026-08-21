/* =========================================================
   HEALSPHERE - PATIENT CONTROLLER
   ========================================================= */

const Patient =
    require("../models/patientModel");

const User =
    require("../models/userModel");

const Doctor =
    require("../models/doctorModel");

const Appointment =
    require("../models/appointmentModel");

const {
    hashPassword
} = require("../utils/password");


/* ---------- Get Current Patient ---------- */

async function getMyProfile(req, res, next) {

    try {

        const patient =
            await Patient.findOne({
                user: req.user._id
            }).populate(
                "user",
                "-password"
            );


        if (!patient) {

            return res.status(404).json({

                success: false,

                message:
                    "Patient profile not found."

            });
        }


        return res.status(200).json({

            success: true,

            patient

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Update Current Patient ---------- */

async function updateMyProfile(req, res, next) {

    try {

        const patient =
            await Patient.findOne({
                user: req.user._id
            });


        if (!patient) {

            return res.status(404).json({

                success: false,

                message:
                    "Patient profile not found."

            });
        }


        const allowedFields = [
            "dateOfBirth",
            "gender",
            "address",
            "bloodGroup",
            "emergencyContact"
        ];


        allowedFields.forEach(
            (field) => {

                if (
                    req.body[field] !== undefined
                ) {

                    patient[field] =
                        req.body[field];

                }

            }
        );


        await patient.save();


        /*
         * Basic account information is stored
         * separately in the User document.
         */

        const userUpdates = {};

        if (req.body.name !== undefined) {

            userUpdates.name =
                req.body.name;

        }


        if (req.body.phone !== undefined) {

            userUpdates.phone =
                req.body.phone;

        }


        if (req.body.email !== undefined) {

            userUpdates.email =
                String(req.body.email).trim().toLowerCase();

        }


        if (
            Object.keys(userUpdates).length > 0
        ) {

            await User.findByIdAndUpdate(
                req.user._id,
                userUpdates,
                {
                    new: true,
                    runValidators: true
                }
            );

        }


        const updatedPatient =
            await Patient.findOne({
                user: req.user._id
            }).populate(
                "user",
                "-password"
            );


        return res.status(200).json({

            success: true,

            message:
                "Patient profile updated successfully.",

            patient:
                updatedPatient

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Get All Patients ---------- */

async function getAllPatients(
    req,
    res,
    next
) {

    try {

        const patients =
            await Patient.find()
                .populate(
                    "user",
                    "-password"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            count:
                patients.length,

            patients

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Admin: Create Patient ---------- */

async function createPatient(req, res, next) {

    try {

        const {
            name,
            email,
            phone,
            password,
            age,
            gender,
            address
        } = req.body;


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


        const user =
            await User.create({

                name,

                email:
                    email.toLowerCase(),

                phone,

                password:
                    await hashPassword(password),

                role: "patient"

            });


        try {

            const patient =
                await Patient.create({

                    user:
                        user._id,

                    age,
                    gender,
                    address

                });


            const createdPatient =
                await Patient.findById(
                    patient._id
                ).populate(
                    "user",
                    "-password"
                );


            return res.status(201).json({

                success: true,

                message:
                    "Patient added successfully.",

                patient:
                    createdPatient

            });

        } catch (error) {

            await User.findByIdAndDelete(
                user._id
            );

            throw error;
        }

    } catch (error) {

        next(error);

    }
}


/* ---------- Admin: Update Patient ---------- */

async function updatePatient(req, res, next) {

    try {

        const patient =
            await Patient.findById(
                req.params.id
            );


        if (!patient) {

            return res.status(404).json({

                success: false,

                message:
                    "Patient not found."

            });
        }


        const userUpdates = {};

        ["name", "email", "phone"].forEach(
            field => {

                if (req.body[field] !== undefined) {

                    userUpdates[field] =
                        field === "email"
                            ? req.body[field].toLowerCase()
                            : req.body[field];
                }
            }
        );


        if (userUpdates.email) {

            const duplicateUser =
                await User.findOne({
                    email:
                        userUpdates.email,

                    _id: {
                        $ne:
                            patient.user
                    }
                });


            if (duplicateUser) {

                const error =
                    new Error(
                        "An account with this email already exists."
                    );

                error.statusCode = 409;

                throw error;
            }
        }


        ["age", "gender", "address"].forEach(
            field => {

                if (req.body[field] !== undefined) {
                    patient[field] =
                        req.body[field];
                }
            }
        );


        await patient.save();


        if (Object.keys(userUpdates).length > 0) {

            await User.findByIdAndUpdate(
                patient.user,
                userUpdates,
                {
                    new: true,
                    runValidators: true
                }
            );
        }


        const updatedPatient =
            await Patient.findById(
                patient._id
            ).populate(
                "user",
                "-password"
            );


        return res.status(200).json({

            success: true,

            message:
                "Patient updated successfully.",

            patient:
                updatedPatient

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Doctor: Get My Patients ---------- */

async function getDoctorPatients(
    req,
    res,
    next
) {

    try {

        /* ---------- Find Doctor Profile ---------- */

        const doctor =
            await Doctor.findOne({
                user: req.user._id
            });


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor profile not found."

            });

        }


        /* ---------- Find Doctor's Appointments ---------- */

        const appointments =
            await Appointment.find({

                doctor:
                    doctor._id

            }).select(
                "patient"
            );


        /* ---------- Get Unique Patient IDs ---------- */

        const patientIds = [
            ...new Set(

                appointments.map(
                    appointment =>
                        appointment.patient.toString()
                )

            )
        ];


        /* ---------- Fetch Patients ---------- */

        const patients =
            await Patient.find({

                _id: {
                    $in:
                        patientIds
                }

            })
            .populate(
                "user",
                "-password"
            )
            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            success: true,

            count:
                patients.length,

            patients

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Get Patient By ID ---------- */

async function getPatientById(
    req,
    res,
    next
) {

    try {

        const patient =
            await Patient.findById(
                req.params.id
            ).populate(
                "user",
                "-password"
            );


        if (!patient) {

            return res.status(404).json({

                success: false,

                message:
                    "Patient not found."

            });

        }


        return res.status(200).json({

            success: true,

            patient

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Delete Patient ---------- */

async function deletePatient(
    req,
    res,
    next
) {

    try {

        const patient =
            await Patient.findById(
                req.params.id
            );


        if (!patient) {

            return res.status(404).json({

                success: false,

                message:
                    "Patient not found."

            });

        }


        const userId =
            patient.user;


        await Patient.findByIdAndDelete(
            patient._id
        );


        if (userId) {

            await User.findByIdAndDelete(
                userId
            );

        }


        return res.status(200).json({

            success: true,

            message:
                "Patient deleted successfully."

        });

    } catch (error) {

        next(error);

    }
}


module.exports = {

    getMyProfile,
    updateMyProfile,

    getAllPatients,
    createPatient,
    updatePatient,
    getDoctorPatients,
    getPatientById,
    deletePatient

};