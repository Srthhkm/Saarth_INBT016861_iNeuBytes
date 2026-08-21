/* =========================================================
   HEALSPHERE - APPOINTMENT CONTROLLER
   ========================================================= */

const Appointment =
    require("../models/appointmentModel");

const Doctor =
    require("../models/doctorModel");

const Patient =
    require("../models/patientModel");

const Department =
    require("../models/departmentModel");

const {
    notifyAppointmentUsers
} = require("../services/notificationService");

/* ---------- Create Appointment ---------- */

async function createAppointment(
    req,
    res,
    next
) {

    try {

        /*
         * Frontend sends:
         *
         * department -> Department ObjectId
         * doctorId   -> Doctor ObjectId
         * date       -> Appointment date
         * time       -> Appointment time
         *
         * The patient is NOT taken from the
         * request body.
         *
         * It is determined from the logged-in user.
         */

        const {
            doctorId,
            department,
            date,
            time,
            reason
        } = req.body;


        /* ---------- Validate Required IDs ---------- */

        if (
            !doctorId ||
            !department ||
            !date ||
            !time
        ) {

            const error =
                new Error(
                    "Doctor, department, date and time are required."
                );

            error.statusCode = 400;

            throw error;
        }


        /* ---------- Find Patient ---------- */

        const patient =
            await Patient.findOne({
                user:
                    req.user._id
            });


        if (!patient) {

            const error =
                new Error(
                    "Patient profile not found."
                );

            error.statusCode = 404;

            throw error;
        }


        /* ---------- Find Doctor ---------- */

        /*
         * IMPORTANT:
         *
         * doctorId is the actual MongoDB
         * Doctor ObjectId.
         *
         * Do NOT use the doctor's display name here.
         */

        const selectedDoctor =
            await Doctor.findById(
                doctorId
            );


        if (!selectedDoctor) {

            const error =
                new Error(
                    "Selected doctor was not found."
                );

            error.statusCode = 404;

            throw error;
        }


        /* ---------- Verify Department ---------- */

        if (
            String(
                selectedDoctor.department
            ) !==
            String(
                department
            )
        ) {

            const error =
                new Error(
                    "The selected doctor does not belong to the selected department."
                );

            error.statusCode = 400;

            throw error;
        }


        /* ---------- Check Doctor Availability ---------- */

        if (
            !selectedDoctor.isAvailable
        ) {

            const error =
                new Error(
                    "The selected doctor is currently unavailable."
                );

            error.statusCode = 400;

            throw error;
        }


        /* ---------- Verify Department ---------- */

        const selectedDepartment =
            await Department.findOne({

                _id:
                    department,

                isActive:
                    true

            });


        if (!selectedDepartment) {

            const error =
                new Error(
                    "Selected department was not found or is inactive."
                );

            error.statusCode = 404;

            throw error;
        }


        /* ---------- Check Existing Appointment ---------- */

        const existingAppointment =
            await Appointment.findOne({

                doctor:
                    selectedDoctor._id,

                appointmentDate:
                    new Date(
                        date
                    ),

                appointmentTime:
                    time,

                status: {

                    $in: [

                        "pending",

                        "confirmed"

                    ]

                }

            });


        if (existingAppointment) {

            const error =
                new Error(
                    "This appointment slot is already booked."
                );

            error.statusCode = 409;

            throw error;
        }


        /* ---------- Create Appointment ---------- */

        const appointment =
            await Appointment.create({

                patient:
                    patient._id,

                doctor:
                    selectedDoctor._id,

                department:
                    selectedDepartment._id,

                appointmentDate:
                    new Date(
                        date
                    ),

                appointmentTime:
                    time,

                reason:
                    reason || "",

                status:
                    "pending"

            });


        /* ---------- Populate Appointment ---------- */

        const populatedAppointment =
            await Appointment.findById(
                appointment._id
            )

                .populate({

                    path:
                        "patient",

                    populate: {

                        path:
                            "user",

                        select:
                            "-password"

                    }

                })

                .populate({

                    path:
                        "doctor",

                    populate: [

                        {

                            path:
                                "user",

                            select:
                                "-password"

                        },

                        {

                            path:
                                "department"

                        }

                    ]

                })

                .populate(
                    "department"
                );

        notifyAppointmentUsers(
            populatedAppointment,
            "New appointment booked",
            `An appointment has been booked for ${populatedAppointment.appointmentDate.toLocaleDateString()} at ${populatedAppointment.appointmentTime}.`
        ).catch(error => console.error("Notification error:", error.message));


        /* ---------- Response ---------- */

        return res.status(201).json({

            success: true,

            message:
                "Appointment booked successfully.",

            appointment:
                populatedAppointment

        });


    } catch (error) {

        if (error.code === 11000) {

            error.statusCode = 409;

            error.message =
                "This appointment slot is already booked.";
        }

        next(error);

    }

}


/* ---------- Get Patient Appointments ---------- */

async function getMyAppointments(
    req,
    res,
    next
) {

    try {

        const patient =
            await Patient.findOne({

                user:
                    req.user._id

            });


        if (!patient) {

            return res.status(404).json({

                success: false,

                message:
                    "Patient profile not found."

            });

        }


        const appointments =
            await Appointment.find({

                patient:
                    patient._id

            })

                .populate({

                    path:
                        "doctor",

                    populate: {

                        path:
                            "user",

                        select:
                            "-password"

                    }

                })

                .populate(
                    "department"
                )

                .sort({

                    appointmentDate:
                        -1,

                    appointmentTime:
                        -1

                });


        return res.status(200).json({

            success: true,

            count:
                appointments.length,

            appointments

        });


    } catch (error) {

        next(error);

    }

}


/* ---------- Get Doctor Appointments ---------- */

async function getDoctorAppointments(
    req,
    res,
    next
) {

    try {

        const doctor =
            await Doctor.findOne({

                user:
                    req.user._id

            });


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor profile not found."

            });

        }


        const appointments =
            await Appointment.find({

                doctor:
                    doctor._id

            })

                .populate({

                    path:
                        "patient",

                    populate: {

                        path:
                            "user",

                        select:
                            "-password"

                    }

                })

                .populate(
                    "department"
                )

                .sort({

                    appointmentDate:
                        1,

                    appointmentTime:
                        1

                });


        return res.status(200).json({

            success: true,

            count:
                appointments.length,

            appointments

        });


    } catch (error) {

        next(error);

    }

}


/* ---------- Get All Appointments ---------- */

async function getAllAppointments(
    req,
    res,
    next
) {

    try {

        const appointments =
            await Appointment.find()

                .populate({

                    path:
                        "patient",

                    populate: {

                        path:
                            "user",

                        select:
                            "-password"

                    }

                })

                .populate({

                    path:
                        "doctor",

                    populate: {

                        path:
                            "user",

                        select:
                            "-password"

                    }

                })

                .populate(
                    "department"
                )

                .sort({

                    appointmentDate:
                        -1,

                    appointmentTime:
                        -1

                });


        return res.status(200).json({

            success: true,

            count:
                appointments.length,

            appointments

        });


    } catch (error) {

        next(error);

    }

}


/* ---------- Update Appointment Status ---------- */

async function updateAppointmentStatus(
    req,
    res,
    next
) {

    try {

        const {
            status,
            notes,
            cancellationReason
        } = req.body;


        const appointment =
            await Appointment.findById(
                req.params.id
            );


        if (!appointment) {

            return res.status(404).json({

                success: false,

                message:
                    "Appointment not found."

            });

        }


        if (req.user.role === "doctor") {
            const doctor = await Doctor.findOne({ user: req.user._id });

            if (!doctor || String(appointment.doctor) !== String(doctor._id)) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to update this appointment."
                });
            }
        }


        const allowedStatuses = [

            "pending",

            "confirmed",

            "completed",

            "cancelled"

        ];


        if (
            status &&
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid appointment status."

            });

        }


        if (status) {

            appointment.status =
                status;

        }


        if (
            notes !== undefined
        ) {

            appointment.notes =
                notes;

        }


        if (
            cancellationReason !== undefined
        ) {

            appointment.cancellationReason =
                cancellationReason;

        }


        await appointment.save();

        const appointmentForNotification = await Appointment.findById(
            appointment._id
        ).populate({
            path: "patient",
            populate: { path: "user", select: "_id" }
        }).populate({
            path: "doctor",
            populate: { path: "user", select: "_id" }
        });

        notifyAppointmentUsers(
            appointmentForNotification,
            "Appointment status updated",
            `Your appointment status is now ${appointment.status}.`
        ).catch(error => console.error("Notification error:", error.message));


        return res.status(200).json({

            success: true,

            message:
                "Appointment updated successfully.",

            appointment

        });


    } catch (error) {

        next(error);

    }

}


/* ---------- Admin: Reschedule Appointment ---------- */

async function rescheduleAppointment(req, res, next) {
    try {
        const { date, time } = req.body;

        if (!date || !time) {
            return res.status(400).json({
                success: false,
                message: "A new date and time are required."
            });
        }

        const appointmentDate = new Date(date);

        if (Number.isNaN(appointmentDate.getTime()) || appointmentDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: "The new appointment date must be in the future."
            });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        if (["completed", "cancelled"].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: "Completed or cancelled appointments cannot be rescheduled."
            });
        }

        const conflict = await Appointment.findOne({
            _id: { $ne: appointment._id },
            doctor: appointment.doctor,
            appointmentDate,
            appointmentTime: time,
            status: { $in: ["pending", "confirmed"] }
        });

        if (conflict) {
            return res.status(409).json({
                success: false,
                message: "That doctor slot is already booked."
            });
        }

        appointment.appointmentDate = appointmentDate;
        appointment.appointmentTime = time;
        await appointment.save();

        const appointmentForNotification = await Appointment.findById(
            appointment._id
        ).populate({
            path: "patient",
            populate: { path: "user", select: "_id" }
        }).populate({
            path: "doctor",
            populate: { path: "user", select: "_id" }
        });

        notifyAppointmentUsers(
            appointmentForNotification,
            "Appointment rescheduled",
            `Your appointment was moved to ${appointmentDate.toLocaleDateString()} at ${time}.`
        ).catch(error => console.error("Notification error:", error.message));

        return res.status(200).json({
            success: true,
            message: "Appointment rescheduled successfully.",
            appointment
        });
    } catch (error) {
        next(error);
    }
}


/* ---------- Cancel Appointment ---------- */

async function cancelAppointment(
    req,
    res,
    next
) {

    try {

        const appointment =
            await Appointment.findById(
                req.params.id
            );


        if (!appointment) {

            return res.status(404).json({

                success: false,

                message:
                    "Appointment not found."

            });

        }


        if (
            req.user.role === "patient"
        ) {

            const patient =
                await Patient.findOne({
                    user: req.user._id
                });

            if (
                !patient ||
                String(appointment.patient) !==
                String(patient._id)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You can only cancel your own appointments."

                });
            }
        }


        appointment.status =
            "cancelled";


        appointment.cancellationReason =
            req.body.reason ||
            "Appointment cancelled.";


        await appointment.save();

        const appointmentForNotification = await Appointment.findById(
            appointment._id
        ).populate({
            path: "patient",
            populate: { path: "user", select: "_id" }
        }).populate({
            path: "doctor",
            populate: { path: "user", select: "_id" }
        });

        notifyAppointmentUsers(
            appointmentForNotification,
            "Appointment cancelled",
            "Your appointment has been cancelled."
        ).catch(error => console.error("Notification error:", error.message));


        return res.status(200).json({

            success: true,

            message:
                "Appointment cancelled successfully.",

            appointment

        });


    } catch (error) {

        next(error);

    }

}


/* ---------- Exports ---------- */

module.exports = {

    createAppointment,

    getMyAppointments,

    getDoctorAppointments,

    getAllAppointments,

    updateAppointmentStatus,

    rescheduleAppointment,

    cancelAppointment

};