/* =========================================================
   HEALSPHERE - TOKEN UTILITY
   ========================================================= */

const jwt = require("jsonwebtoken");


/* ---------- Generate JWT Token ---------- */

function generateToken(userId) {

    return jwt.sign(
        {
            id: userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn:
                process.env.JWT_EXPIRES_IN || "7d"
        }
    );
}


module.exports = {
    generateToken
};