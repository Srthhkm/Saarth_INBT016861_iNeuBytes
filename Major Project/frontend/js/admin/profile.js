/* =========================================================
   HEALSPHERE - ADMIN PROFILE
   Major Project
   ========================================================= */


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAdminProfile();

        initializeAdminProfileForm();

        initializeManagedAccountForm();

    }
);


/* ---------- Managed Account Form ---------- */

function initializeManagedAccountForm() {

    const form =
        document.querySelector(
            "#managedAccountForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        handleManagedAccountSubmit
    );
}


async function handleManagedAccountSubmit(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const name =
        form.querySelector(
            "#managedAccountName"
        ).value.trim();

    const email =
        form.querySelector(
            "#managedAccountEmail"
        ).value.trim();

    const phone =
        form.querySelector(
            "#managedAccountPhone"
        ).value.trim();

    const password =
        form.querySelector(
            "#managedAccountPassword"
        ).value;

    if (name.length < 2) {

        HealSphereUtils.showToast(
            "Please enter a valid name.",
            "error"
        );

        return;
    }


    if (!HealSphereUtils.isValidEmail(email)) {

        HealSphereUtils.showToast(
            "Please enter a valid email address.",
            "error"
        );

        return;
    }


    if (password.length < 6) {

        HealSphereUtils.showToast(
            "Password must contain at least 6 characters.",
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
        "Creating..."
    );


    try {

        const data =
            await HealSphereAPI.post(
                "/auth/accounts",
                {
                    name,
                    email,
                    phone,
                    password,
                    role: "admin"
                }
            );


        HealSphereUtils.showToast(
            data?.message ||
            "Account created successfully.",
            "success"
        );


        form.reset();

    } catch (error) {

        HealSphereUtils.showToast(
            error.message ||
            "Unable to create account.",
            "error"
        );

    } finally {

        HealSphereUtils.setButtonLoading(
            submitButton,
            false
        );
    }
}


/* ---------- Load Profile ---------- */

async function loadAdminProfile() {

    try {

        const data =
            await HealSphereAPI.get(
                "/admin/me"
            );


        const admin =
            data?.admin ||
            data?.data ||
            data;


        if (!admin) {
            return;
        }


        populateAdminProfile(
            admin
        );


    } catch (error) {

        console.error(
            "Unable to load admin profile:",
            error
        );


        const currentUser =
            HealSphereUtils.getCurrentUser();


        if (currentUser) {

            populateAdminProfile(
                currentUser
            );

        }

    }

}


/* ---------- Populate ---------- */

function populateAdminProfile(
    admin
) {

    const name =
        admin.name ||
        admin.fullName ||
        admin.username ||
        "Admin";


    const email =
        admin.email ||
        "";


    const phone =
        admin.phone ||
        "";


    setValue(
        "#adminName",
        name
    );


    setValue(
        "#name",
        name
    );


    setValue(
        "#adminEmail",
        email
    );


    setValue(
        "#email",
        email
    );


    setValue(
        "#adminPhone",
        phone
    );


    setValue(
        "#phone",
        phone
    );


    document
        .querySelectorAll(
            "#profileAdminName, " +
            ".admin-profile-name, " +
            "#adminDisplayName"
        )
        .forEach(
            element => {

                element.textContent =
                    name;

            }
        );


    document
        .querySelectorAll(
            "#profileAdminEmail, " +
            ".admin-profile-email"
        )
        .forEach(
            element => {

                element.textContent =
                    email;

            }
        );

}


/* ---------- Form ---------- */

function initializeAdminProfileForm() {

    const form =
        document.querySelector(
            "#adminProfileForm, " +
            "#profileForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        handleAdminProfileSubmit
    );

}


/* ---------- Submit ---------- */

async function handleAdminProfileSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const name =
        getValue(
            form,
            "#adminName, #name"
        );


    const email =
        getValue(
            form,
            "#adminEmail, #email"
        );


    const phone =
        getValue(
            form,
            "#adminPhone, #phone"
        );


    if (
        !name ||
        name.length < 2
    ) {

        HealSphereUtils.showToast(
            "Please enter a valid name.",
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


    const profileData = {

        name,

        email,

        phone

    };


    const submitButton =
        form.querySelector(
            "button[type='submit']"
        );


    HealSphereUtils.setButtonLoading(
        submitButton,
        true,
        "Saving..."
    );


    try {

        const data =
            await HealSphereAPI.put(
                "/admin/me",
                profileData
            );


        const updatedAdmin =
            data?.admin ||
            profileData;


        if (
            typeof HealSphereUtils
                .saveCurrentUser ===
            "function"
        ) {

            HealSphereUtils.saveCurrentUser(
                updatedAdmin
            );

        }


        populateAdminProfile(
            updatedAdmin
        );


        HealSphereUtils.showToast(
            data?.message ||
            "Profile updated successfully.",
            "success"
        );


    } catch (error) {

        HealSphereUtils.showToast(
            error.message ||
            "Unable to update profile.",
            "error"
        );

    } finally {

        HealSphereUtils.setButtonLoading(
            submitButton,
            false
        );

    }

}


/* ---------- Helpers ---------- */

function getValue(
    form,
    selector
) {

    return (
        form.querySelector(
            selector
        )?.value.trim() ||
        ""
    );

}


function setValue(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );


    if (element) {
        element.value =
            value ?? "";
    }

}