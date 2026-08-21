/* =========================================================
   HEALSPHERE - PASSWORD UTILITY
   ========================================================= */

const bcrypt = require("bcryptjs");


/* ---------- Hash Password ---------- */

async function hashPassword(password) {

    const salt = await bcrypt.genSalt(10);

    return bcrypt.hash(
        password,
        salt
    );
}


/* ---------- Compare Password ---------- */

async function comparePassword(
    password,
    hashedPassword
) {

    return bcrypt.compare(
        password,
        hashedPassword
    );
}


module.exports = {
    hashPassword,
    comparePassword
};