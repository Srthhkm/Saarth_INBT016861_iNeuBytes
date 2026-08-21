/* =========================================================
   HEALSPHERE - MEDICAL RECORD CONTROLLER
   ========================================================= */

const MedicalRecord =
    require("../models/medicalRecordModel");

const Patient =
    require("../models/patientModel");

const Doctor =
    require("../models/doctorModel");

const Appointment =
    require("../models/appointmentModel");

/* ---------- Create Medical Record ---------- */

async function createMedicalRecord(
    req,
    res,
    next
) {

    try {

        const {
            patient,
            appointment,
            diagnosis,
            symptoms,
            treatment,
            prescription,
            notes
        } = req.body;


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


        const selectedPatient =
            await Patient.findById(
                patient
            );


        if (!selectedPatient) {

            return res.status(404).json({

                success: false,

                message:
                    "Patient not found."

            });

        }


        if (appointment) {

            const selectedAppointment =
                await Appointment.findById(
                    appointment
                );


            if (!selectedAppointment) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Appointment not found."

                });

            }


            if (
                selectedAppointment.doctor.toString() !==
                doctor._id.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized to create a record for this appointment."

                });

            }

        }


        const record =
            await MedicalRecord.create({

                patient:
                    selectedPatient._id,

                doctor:
                    doctor._id,

                appointment:
                    appointment || undefined,

                diagnosis,

                symptoms:
                    symptoms || "",

                treatment:
                    treatment || "",

                prescription:
                    prescription || "",

                notes:
                    notes || ""

            });


        const populatedRecord =
            await MedicalRecord.findById(
                record._id
            )
                .populate({
                    path: "patient",
                    populate: {
                        path: "user",
                        select: "-password"
                    }
                })
                .populate({
                    path: "doctor",
                    populate: {
                        path: "user",
                        select: "-password"
                    }
                })
                .populate(
                    "appointment"
                );


        return res.status(201).json({

            success: true,

            message:
                "Medical record created successfully.",

            record:
                populatedRecord

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Get Patient Medical Records ---------- */

async function getMyMedicalRecords(
    req,
    res,
    next
) {

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


        const records =
            await MedicalRecord.find({

                patient:
                    patient._id

            })
                .populate({
                    path: "doctor",
                    populate: {
                        path: "user",
                        select: "-password"
                    }
                })
                .populate(
                    "appointment"
                )
                .sort({
                    recordDate: -1
                });


        return res.status(200).json({

            success: true,

            count:
                records.length,

            records

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Get Patient Records By ID ---------- */

async function getPatientMedicalRecords(
    req,
    res,
    next
) {

    try {

        const records =
            await MedicalRecord.find({

                patient:
                    req.params.patientId

            })
                .populate({
                    path: "doctor",
                    populate: {
                        path: "user",
                        select: "-password"
                    }
                })
                .populate(
                    "appointment"
                )
                .sort({
                    recordDate: -1
                });


        return res.status(200).json({

            success: true,

            count:
                records.length,

            records

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Get All Medical Records ---------- */

async function getAllMedicalRecords(
    req,
    res,
    next
) {

    try {

        const records =
            await MedicalRecord.find()
                .populate({
                    path: "patient",
                    populate: {
                        path: "user",
                        select: "-password"
                    }
                })
                .populate({
                    path: "doctor",
                    populate: {
                        path: "user",
                        select: "-password"
                    }
                })
                .populate(
                    "appointment"
                )
                .sort({
                    recordDate: -1
                });


        return res.status(200).json({

            success: true,

            count:
                records.length,

            records

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Update Medical Record ---------- */

async function updateMedicalRecord(
    req,
    res,
    next
) {

    try {

        const record =
            await MedicalRecord.findById(
                req.params.id
            );


        if (!record) {

            return res.status(404).json({

                success: false,

                message:
                    "Medical record not found."

            });

        }


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


        if (
            record.doctor.toString() !==
            doctor._id.toString()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not authorized to update this record."

            });

        }


        const allowedFields = [

            "diagnosis",
            "symptoms",
            "treatment",
            "prescription",
            "notes"

        ];


        allowedFields.forEach(
            (field) => {

                if (
                    req.body[field] !== undefined
                ) {

                    record[field] =
                        req.body[field];

                }

            }
        );


        await record.save();


        return res.status(200).json({

            success: true,

            message:
                "Medical record updated successfully.",

            record

        });

    } catch (error) {

        next(error);

    }
}


module.exports = {

    createMedicalRecord,

    getMyMedicalRecords,

    getPatientMedicalRecords,

    getAllMedicalRecords,

    updateMedicalRecord

};