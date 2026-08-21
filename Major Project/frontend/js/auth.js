/* =========================================================
   HEALSPHERE - AUTHENTICATION
   Major Project - iNeuBytes Internship
   ========================================================= */


/* ---------- Login ---------- */

async function handleLogin(event) {

    event.preventDefault();

    const form =
        event.currentTarget;

    const emailInput =
        form.querySelector(
            "#email"
        ) ||
        form.querySelector(
            "[name='email']"
        );

    const passwordInput =
        form.querySelector(
            "#password"
        ) ||
        form.querySelector(
            "[name='password']"
        );

    const roleInput =
        form.querySelector(
            "#role"
        ) ||
        form.querySelector(
            "[name='role']"
        );


    const email =
        emailInput?.value.trim();

    const password =
        passwordInput?.value;

    const role =
        roleInput?.value || "";


    /* ---------- Validation ---------- */

    if (!email || !password) {

        HealSphereUtils.showToast(
            "Please enter your email and password.",
            "error"
        );

        return;
    }


    if (
        !HealSphereUtils.isValidEmail(
            email
        )
    ) {

        HealSphereUtils.showToast(
            "Please enter a valid email address.",
            "error"
        );

        return;
    }


    const submitButton =
        form.querySelector(
            "button[type='submit']"
        );


    HealSphereUtils.setButtonLoading(
        submitButton,
        true,
        "Signing in..."
    );


    try {

        const credentials = {
            email,
            password
        };


        /*
         * If the login form contains a role,
         * send it to the backend as well.
         */

        if (role) {
            credentials.role =
                role;
        }


        const data =
            await HealSphereAPI.login(
                credentials
            );

   
        /* ---------- Verify Login Response ---------- */

        if (
            !data?.success ||
            !data?.user
        ) {

            throw new Error(
                data?.message ||
                "Invalid email or password."
            );

        }

        /* ---------- Save User ---------- */

        if (data?.user) {

            HealSphereUtils.saveCurrentUser(
                data.user
            );
        }


        HealSphereUtils.showToast(
            "Login successful!",
            "success"
        );


        /* ---------- Redirect ---------- */

        setTimeout(() => {

            const user =
                data?.user ||
                HealSphereUtils.getCurrentUser();

            const userRole =
                user?.role ||
                role;

            HealSphereUtils.redirectByRole(
                userRole
            );

        }, 500);


    } catch (error) {

        HealSphereUtils.showToast(
            error.message ||
            "Unable to login. Please try again.",
            "error"
        );

    } finally {

        HealSphereUtils.setButtonLoading(
            submitButton,
            false
        );
    }
}


/* ---------- Registration ---------- */

async function handleRegistration(event) {

    event.preventDefault();

    const form =
        event.currentTarget;


    const nameInput =
        form.querySelector(
            "#name"
        ) ||
        form.querySelector(
            "#fullName"
        ) ||
        form.querySelector(
            "[name='name']"
        );


    const emailInput =
        form.querySelector(
            "#email"
        ) ||
        form.querySelector(
            "[name='email']"
        );


    const phoneInput =
        form.querySelector(
            "#phone"
        ) ||
        form.querySelector(
            "[name='phone']"
        );


    const passwordInput =
        form.querySelector(
            "#password"
        ) ||
        form.querySelector(
            "[name='password']"
        );


    const confirmPasswordInput =
        form.querySelector(
            "#confirmPassword"
        ) ||
        form.querySelector(
            "[name='confirmPassword']"
        );


    const name =
        nameInput?.value.trim();

    const email =
        emailInput?.value.trim();

    const phone =
        phoneInput?.value.trim();

    const password =
        passwordInput?.value;

    const confirmPassword =
        confirmPasswordInput?.value;

    /* ---------- Required Fields ---------- */

    if (
        !name ||
        !email ||
        !password ||
        !confirmPassword
    ) {

        HealSphereUtils.showToast(
            "Please fill in all required fields.",
            "error"
        );

        return;
    }


    /* ---------- Email ---------- */

    if (
        !HealSphereUtils.isValidEmail(
            email
        )
    ) {

        HealSphereUtils.showToast(
            "Please enter a valid email address.",
            "error"
        );

        return;
    }


    /* ---------- Phone ---------- */

    if (
        phone &&
        !HealSphereUtils.isValidPhone(
            phone
        )
    ) {

        HealSphereUtils.showToast(
            "Please enter a valid phone number.",
            "error"
        );

        return;
    }


    /* ---------- Password ---------- */

    if (
        !HealSphereUtils.isValidPassword(
            password
        )
    ) {

        HealSphereUtils.showToast(
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }


    /* ---------- Confirm Password ---------- */

    if (
        password !== confirmPassword
    ) {

        HealSphereUtils.showToast(
            "Passwords do not match.",
            "error"
        );

        return;
    }


    const submitButton =
        form.querySelector(
            "button[type='submit']"
        );


    HealSphereUtils.setButtonLoading(
        submitButton,
        true,
        "Creating account..."
    );


    try {

        const userData = {

            name,

            email,

            password,

            role: "patient"
        };


        if (phone) {
            userData.phone =
                phone;
        }


        const data =
            await HealSphereAPI.register(
                userData
            );


        HealSphereUtils.showToast(
            data?.message ||
            "Registration successful. Please login.",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                HealSphereUtils.getProjectPath(
                    "login.html"
                );

        }, 800);


    } catch (error) {

        HealSphereUtils.showToast(
            error.message ||
            "Unable to create account. Please try again.",
            "error"
        );

    } finally {

        HealSphereUtils.setButtonLoading(
            submitButton,
            false
        );
    }
}


/* ---------- Protect Page ---------- */

function protectAuthPage() {

    if (
        !HealSphereUtils.isLoggedIn()
    ) {
        return;
    }

    /*
     * If a logged-in user opens login/register,
     * send them to their dashboard.
     */

    const currentPath =
        window.location.pathname;

    if (
        currentPath.includes(
            "login.html"
        ) ||
        currentPath.includes(
            "register.html"
        )
    ) {

        const role =
            HealSphereUtils.getUserRole();

        if (role) {
            HealSphereUtils.redirectByRole(
                role
            );
        }
    }
}


/* ---------- Initialize Authentication ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        const registerForm =
            document.getElementById(
                "registerForm"
            );


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                handleLogin
            );
        }


        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                handleRegistration
            );
        }


        protectAuthPage();

    }
);


/* ---------- Global Auth Object ---------- */

window.HealSphereAuth = {

    login:
        handleLogin,

    register:
        handleRegistration,

    protect:
        protectAuthPage
};