/* =========================================================
   HEALSPHERE - AUTHENTICATION SERVICE
   ========================================================= */

const User =
    require("../models/userModel");

const Patient =
    require("../models/patientModel");

const {
    hashPassword,
    comparePassword
} = require("../utils/password");

const {
    generateToken
} = require("../utils/token");


/* ---------- Register User ---------- */

async function registerUser(userData) {

    const {
        name,
        email,
        phone,
        password
    } = userData;


    /* ---------- Check Existing User ---------- */

    const existingUser =
        await User.findOne({
            email:
                email.toLowerCase()
        });


    if (existingUser) {

        const error =
            new Error(
                "An account with this email already exists."
            );

        error.statusCode = 409;

        throw error;
    }


    /* ---------- Hash Password ---------- */

    const hashedPassword =
        await hashPassword(password);


    /* ---------- Create User ---------- */

    const user =
        await User.create({

            name,

            email:
                email.toLowerCase(),

            phone,

            password:
                hashedPassword,

            role: "patient"

        });


    try {

        /* ---------- Create Patient Profile ---------- */

        await Patient.create({

            user:
                user._id

        });


        /* ---------- Generate Token ---------- */

        const token =
            generateToken(
                user._id
            );


        return {

            user,

            token

        };

    } catch (error) {

        /*
         * If creation of the related Patient or Doctor
         * profile fails, remove the User as well.
         *
         * This prevents orphaned User accounts.
         */

        await User.findByIdAndDelete(
            user._id
        );

        throw error;
    }
}


/* ---------- Create Managed Account ---------- */

async function createManagedAccount(userData) {

    const {
        name,
        email,
        phone,
        password,
        role
    } = userData;


    if (role !== "admin") {

        const error =
            new Error(
                "Only administrator accounts can be created through this endpoint."
            );

        error.statusCode = 400;

        throw error;
    }


    const existingUser =
        await User.findOne({
            email:
                email.toLowerCase()
        });


    if (existingUser) {

        const error =
            new Error(
                "An account with this email already exists."
            );

        error.statusCode = 409;

        throw error;
    }


    return User.create({

        name,

        email:
            email.toLowerCase(),

        phone,

        password:
            await hashPassword(password),

        role

    });
}


/* ---------- Login User ---------- */

async function loginUser(
    email,
    password
) {

    /* ---------- Find User ---------- */

    const user =
        await User.findOne({

            email:
                email.toLowerCase()

        });


    if (!user) {

        throw new Error(
            "Invalid email or password."
        );
    }


    /* ---------- Check Active Status ---------- */

    if (!user.isActive) {

        const error =
            new Error(
                "Your account has been deactivated."
            );

        error.statusCode = 403;

        throw error;
    }


    /* ---------- Compare Password ---------- */

    const passwordMatches =
        await comparePassword(
            password,
            user.password
        );


    if (!passwordMatches) {

        throw new Error(
            "Invalid email or password."
        );
    }


    /* ---------- Generate Token ---------- */

    const token =
        generateToken(
            user._id
        );


    return {

        user,

        token

    };
}


/* ---------- Change Password ---------- */

async function changePassword(
    userId,
    currentPassword,
    newPassword
) {

    const user =
        await User.findById(userId);

    if (!user) {

        const error =
            new Error("User account not found.");

        error.statusCode = 404;

        throw error;
    }


    const passwordMatches =
        await comparePassword(
            currentPassword,
            user.password
        );

    if (!passwordMatches) {

        const error =
            new Error("Current password is incorrect.");

        error.statusCode = 400;

        throw error;
    }


    user.password =
        await hashPassword(newPassword);

    await user.save();
}


module.exports = {

    registerUser,

    createManagedAccount,

    loginUser,

    changePassword

};