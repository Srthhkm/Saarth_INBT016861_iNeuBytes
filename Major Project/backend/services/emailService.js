/* =========================================================
   HEALSPHERE - EMAIL SERVICE
   ========================================================= */

const nodemailer = require("nodemailer");


/* ---------- Create Transporter ---------- */

function createTransporter() {

    return nodemailer.createTransport({

        service:
            process.env.EMAIL_SERVICE || "gmail",

        auth: {

            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_PASSWORD

        }

    });
}


/* ---------- Send Email ---------- */

async function sendEmail({
    to,
    subject,
    text,
    html
}) {

    if (
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASSWORD
    ) {

        console.warn(
            "Email credentials are not configured."
        );

        return null;
    }


    const transporter =
        createTransporter();


    const mailOptions = {

        from:
            process.env.EMAIL_FROM ||
            process.env.EMAIL_USER,

        to,

        subject,

        text,

        ...(html && { html })

    };


    return transporter.sendMail(
        mailOptions
    );
}


module.exports = {
    sendEmail
};