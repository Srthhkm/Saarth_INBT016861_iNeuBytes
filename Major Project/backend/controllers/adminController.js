/* =========================================================
   HEALSPHERE - ADMIN PROFILE CONTROLLER
   ========================================================= */

const User = require("../models/userModel");


async function getAdminProfile(req, res) {
    return res.status(200).json({
        success: true,
        admin: req.user
    });
}


async function updateAdminProfile(req, res, next) {
    try {
        const { name, email, phone } = req.body;

        if (!name || name.trim().length < 2 || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required."
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: req.user._id }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const admin = await User.findByIdAndUpdate(
            req.user._id,
            {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone || ""
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Admin profile updated successfully.",
            admin
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    getAdminProfile,
    updateAdminProfile
};