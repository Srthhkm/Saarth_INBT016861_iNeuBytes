/* =========================================================
   HEALSPHERE - CONTACT CONTROLLER
   ========================================================= */

const ContactMessage =
    require("../models/contactMessageModel");

const {
    sendEmail
} = require("../services/emailService");


/* ---------- Submit Contact Message ---------- */

async function createContactMessage(
    req,
    res,
    next
) {

    try {

        const contactMessage =
            await ContactMessage.create({

                name:
                    req.body.name,

                email:
                    req.body.email,

                phone:
                    req.body.phone,

                subject:
                    req.body.subject,

                message:
                    req.body.message

            });


        return res.status(201).json({

            success: true,

            message:
                "Your message has been submitted successfully.",

            contactMessage

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Admin: List Messages ---------- */

async function getContactMessages(req, res, next) {

    try {

        const messages =
            await ContactMessage.find()
                .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            messages
        });

    } catch (error) {
        next(error);
    }
}


/* ---------- Admin: Update Message ---------- */

async function updateContactMessage(req, res, next) {

    try {

        const contactMessage =
            await ContactMessage.findByIdAndUpdate(
                req.params.id,
                { status: req.body.status },
                { new: true, runValidators: true }
            );

        if (!contactMessage) {
            return res.status(404).json({
                success: false,
                message: "Message not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Message status updated.",
            contactMessage
        });

    } catch (error) {
        next(error);
    }
}


/* ---------- Admin: Reply To Message ---------- */

async function replyToContactMessage(req, res, next) {

    try {

        const reply = String(req.body.reply || "").trim();

        if (!reply) {
            return res.status(400).json({
                success: false,
                message: "Reply message is required."
            });
        }

        const contactMessage =
            await ContactMessage.findById(req.params.id);

        if (!contactMessage) {
            return res.status(404).json({
                success: false,
                message: "Message not found."
            });
        }

        const emailResult =
            await sendEmail({
                to: contactMessage.email,
                subject: `Re: ${contactMessage.subject || "Your HealSphere enquiry"}`,
                text: reply
            });

        if (!emailResult) {

            const error =
                new Error(
                    "Email service is not configured. Add EMAIL_USER and EMAIL_PASSWORD to the backend environment."
                );

            error.statusCode = 503;

            throw error;
        }

        contactMessage.status = "replied";
        await contactMessage.save();

        return res.status(200).json({
            success: true,
            message: "Reply sent successfully.",
            contactMessage
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {

    createContactMessage,
    getContactMessages,
    updateContactMessage,
    replyToContactMessage

};