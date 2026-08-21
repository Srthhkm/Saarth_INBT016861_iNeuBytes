/* =========================================================
   HEALSPHERE - NOTIFICATION CONTROLLER
   ========================================================= */

const Notification = require("../models/notificationModel");


async function getMyNotifications(req, res, next) {
    try {
        const notifications = await Notification.find({
            user: req.user._id
        }).sort({
            createdAt: -1
        }).limit(50);

        return res.status(200).json({
            success: true,
            unreadCount: notifications.filter(
                notification => !notification.readAt
            ).length,
            notifications
        });
    } catch (error) {
        next(error);
    }
}


async function markNotificationRead(req, res, next) {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id
            },
            {
                readAt: new Date()
            },
            {
                new: true
            }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        return res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        next(error);
    }
}


async function markAllNotificationsRead(req, res, next) {
    try {
        await Notification.updateMany(
            {
                user: req.user._id,
                readAt: null
            },
            {
                readAt: new Date()
            }
        );

        return res.status(200).json({
            success: true,
            message: "Notifications marked as read."
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
};