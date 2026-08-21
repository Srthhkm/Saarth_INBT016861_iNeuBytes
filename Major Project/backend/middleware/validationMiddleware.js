/* =========================================================
   HEALSPHERE - VALIDATION MIDDLEWARE
   ========================================================= */


/* ---------- Required Fields Validation ---------- */

function validateRequiredFields(fields) {

    return function (req, res, next) {

        const missingFields = [];


        fields.forEach((field) => {

            const value = req.body[field];

            if (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            ) {
                missingFields.push(field);
            }

        });


        if (missingFields.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Required fields are missing.",
                fields: missingFields
            });
        }


        next();
    };
}


/* ---------- Email Validation ---------- */

function validateEmail(email) {

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
}


/* ---------- Phone Validation ---------- */

function validatePhone(phone) {

    const phoneRegex =
        /^[0-9]{10}$/;

    return phoneRegex.test(String(phone));
}


/* ---------- Password Validation ---------- */

function validatePassword(password) {

    return (
        typeof password === "string" &&
        password.length >= 6
    );
}


module.exports = {
    validateRequiredFields,
    validateEmail,
    validatePhone,
    validatePassword
};