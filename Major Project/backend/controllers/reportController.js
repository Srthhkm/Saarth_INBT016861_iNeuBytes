/* =========================================================
   HEALSPHERE - REPORT CONTROLLER
   ========================================================= */

const {
    getSystemStatistics,
    getAppointmentStatistics
} = require("../services/reportService");


/* ---------- System Statistics ---------- */

async function getSystemReport(
    req,
    res,
    next
) {

    try {

        const statistics =
            await getSystemStatistics();


        return res.status(200).json({

            success: true,

            statistics

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Appointment Statistics ---------- */

async function getAppointmentReport(
    req,
    res,
    next
) {

    try {

        const statistics =
            await getAppointmentStatistics();


        return res.status(200).json({

            success: true,

            statistics

        });

    } catch (error) {

        next(error);

    }
}


module.exports = {

    getSystemReport,
    getAppointmentReport

};