/* =========================================================
   HEALSPHERE - REPORT SERVICE
   ========================================================= */

const Doctor = require("../models/doctorModel");

const Patient = require("../models/patientModel");

const Appointment =
    require("../models/appointmentModel");

const Department =
    require("../models/departmentModel");


/* ---------- Get System Statistics ---------- */

async function getSystemStatistics() {

    const [
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalDepartments
    ] = await Promise.all([

        Doctor.countDocuments(),

        Patient.countDocuments(),

        Appointment.countDocuments(),

        Department.countDocuments()

    ]);


    return {

        totalDoctors,

        totalPatients,

        totalAppointments,

        totalDepartments

    };
}


/* ---------- Get Appointment Statistics ---------- */

async function getAppointmentStatistics() {

    const [
        pending,
        confirmed,
        completed,
        cancelled
    ] = await Promise.all([

        Appointment.countDocuments({
            status: "pending"
        }),

        Appointment.countDocuments({
            status: "confirmed"
        }),

        Appointment.countDocuments({
            status: "completed"
        }),

        Appointment.countDocuments({
            status: "cancelled"
        })

    ]);


    return {

        pending,

        confirmed,

        completed,

        cancelled

    };
}


module.exports = {
    getSystemStatistics,
    getAppointmentStatistics
};