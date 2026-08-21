/* =========================================================
   HEALSPHERE - NOTIFICATION SERVICE
   ========================================================= */

const Notification = require("../models/notificationModel");


async function createNotification({
    user,
    type = "system",
    title,
    message,
    appointment = null
}) {
    return Notification.create({
        user,
        type,
        title,
        message,
        appointment
    });
}


async function notifyAppointmentUsers(appointment, title, message) {
    const users = [
        appointment.patient?.user?._id || appointment.patient?.user,
        appointment.doctor?.user?._id || appointment.doctor?.user
    ].filter(Boolean);

    await Promise.all(
        users.map(user => createNotification({
            user,
            type: "appointment",
            title,
            message,
            appointment: appointment._id
        }))
    );
}


module.exports = {
    createNotification,
    notifyAppointmentUsers
};
