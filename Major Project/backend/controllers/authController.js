/* =========================================================
   HEALSPHERE - AUTHENTICATION CONTROLLER
   ========================================================= */

const {
    registerUser,
    loginUser,
    createManagedAccount,
    changePassword
} = require("../services/authService");


/* ---------- Register ---------- */

async function register(req, res, next) {

    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;


        const result = await registerUser({

            name,
            email,
            phone,
            password

        });


        const user = result.user.toObject();

        delete user.password;


        return res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            token: result.token,

            user

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Create Managed Account ---------- */

async function createAccount(req, res, next) {

    try {

        const user =
            await createManagedAccount({

                name:
                    req.body.name,

                email:
                    req.body.email,

                phone:
                    req.body.phone,

                password:
                    req.body.password,

                role:
                    req.body.role

            });


        const safeUser =
            user.toObject();

        delete safeUser.password;


        return res.status(201).json({

            success: true,

            message:
                `${user.role === "admin" ? "Administrator" : "Doctor"} account created successfully.`,

            user:
                safeUser

        });

    } catch (error) {

        next(error);

    }
}


/* ---------- Login ---------- */

async function login(req, res, next) {

    try {

        const {
            email,
            password
        } = req.body;


        const result =
            await loginUser(
                email,
                password
            );


        const user =
            result.user.toObject();

        delete user.password;


        return res.status(200).json({

            success: true,

            message:
                "Login successful.",

            token: result.token,

            user

        });

    } catch (error) {

        error.statusCode = 401;

        next(error);

    }
}


/* ---------- Logout ---------- */

async function logout(req, res) {

    /*
     * JWT authentication is stateless.
     * The frontend removes the stored token.
     */

    return res.status(200).json({

        success: true,

        message:
            "Logout successful."

    });
}


/* ---------- Current User ---------- */

async function getCurrentUser(req, res) {

    return res.status(200).json({

        success: true,

        user: req.user

    });
}


/* ---------- Change Password ---------- */

async function updatePassword(req, res, next) {

    try {

        await changePassword(
            req.user._id,
            req.body.currentPassword,
            req.body.newPassword
        );

        return res.status(200).json({

            success: true,

            message:
                "Password changed successfully."

        });

    } catch (error) {

        next(error);

    }
}


module.exports = {
    register,
    createAccount,
    login,
    logout,
    getCurrentUser,
    updatePassword
};