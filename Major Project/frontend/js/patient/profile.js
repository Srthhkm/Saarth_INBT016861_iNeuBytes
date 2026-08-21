/* =========================================================
   HEALSPHERE - PATIENT PROFILE
   ========================================================= */


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPatientProfile();

        initializeProfileForm();

    }
);


/* ---------- Load Patient Profile ---------- */

async function loadPatientProfile() {

    try {

        const data =
            await HealSphereAPI.get(
                "/patients/me"
            );


        const patient =
            data?.patient;


        if (!patient) {

            console.error(
                "Patient profile data was not returned."
            );

            return;
        }


        populateProfile(
            patient
        );


    } catch (error) {

        console.error(
            "Unable to load patient profile:",
            error
        );


        HealSphereUtils.showToast(
            "Unable to load your profile.",
            "error"
        );

    }

}


/* ---------- Populate Profile ---------- */

function populateProfile(
    patient
) {

    /*
     * Basic account information is stored
     * inside the populated User document.
     */

    const user =
        patient.user || {};


    const name =
        user.name || "";


    const email =
        user.email || "";


    const phone =
        user.phone || "";


    /* ---------- Basic Information ---------- */

    setValue(
        "#profileName",
        name
    );


    setValue(
        "#profileEmail",
        email
    );


    setValue(
        "#profilePhone",
        phone
    );


    /* ---------- Patient Information ---------- */

    setValue(
        "#profileDob",
        formatDateForInput(
            patient.dateOfBirth
        )
    );


    setValue(
        "#profileGender",
        patient.gender || ""
    );


    setValue(
        "#profileAddress",
        patient.address || ""
    );


    /* ---------- Emergency Contact ---------- */

    const emergencyContact =
        patient.emergencyContact || {};


    setValue(
        "#emergencyName",
        emergencyContact.name || ""
    );


    setValue(
        "#emergencyPhone",
        emergencyContact.phone || ""
    );


    /* ---------- Profile Sidebar ---------- */

    setText(
        "#profileDisplayName",
        name || "Patient"
    );


    setText(
        "#profileDisplayEmail",
        email || "patient@example.com"
    );


    setText(
        "#profileDisplayPhone",
        phone || "+91 XXXXX XXXXX"
    );

}


/* ---------- Initialize Form ---------- */

function initializeProfileForm() {

    const form =
        document.getElementById(
            "profileForm"
        );


    if (!form) {

        console.warn(
            "Profile form not found."
        );

        return;
    }


    form.addEventListener(
        "submit",
        handleProfileSubmit
    );

}


/* ---------- Submit Profile ---------- */

async function handleProfileSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    /* ---------- Read Form Values ---------- */

    const name =
        getValue(
            "#profileName"
        );


    const email =
        getValue(
            "#profileEmail"
        );


    const phone =
        getValue(
            "#profilePhone"
        );


    const dateOfBirth =
        getValue(
            "#profileDob"
        );


    const gender =
        getValue(
            "#profileGender"
        );


    const address =
        getValue(
            "#profileAddress"
        );


    const emergencyName =
        getValue(
            "#emergencyName"
        );


    const emergencyPhone =
        getValue(
            "#emergencyPhone"
        );


    /* ---------- Required Fields ---------- */

    if (
        !name ||
        !email ||
        !phone
    ) {

        HealSphereUtils.showToast(
            "Please complete the required profile fields.",
            "error"
        );

        return;
    }


    /* ---------- Email Validation ---------- */

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


    /* ---------- Phone Validation ---------- */

    if (
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


    /* ---------- Emergency Phone ---------- */

    if (
        emergencyPhone &&
        !HealSphereUtils.isValidPhone(
            emergencyPhone
        )
    ) {

        HealSphereUtils.showToast(
            "Please enter a valid emergency contact number.",
            "error"
        );

        return;
    }


    /* ---------- Submit Button ---------- */

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

        /*
         * Basic account information is updated
         * in User.
         *
         * Patient-specific information is updated
         * in Patient.
         */

        const profileData = {

            name,

            email,

            phone,

            dateOfBirth,

            gender,

            address,

            emergencyContact: {

                name:
                    emergencyName,

                phone:
                    emergencyPhone

            }

        };


        /*
         * Backend route uses PATCH /patients/me.
         */

        const data =
            await HealSphereAPI.patch(
                "/patients/me",
                profileData
            );


        const updatedPatient =
            data?.patient;


        if (updatedPatient) {

            populateProfile(
                updatedPatient
            );


            /*
             * Save the populated User object
             * as the current logged-in user.
             */

            if (
                updatedPatient.user
            ) {

                HealSphereUtils.saveCurrentUser(
                    updatedPatient.user
                );

            }

        }


        HealSphereUtils.showToast(
            data?.message ||
            "Profile updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Unable to update profile:",
            error
        );


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


/* ---------- Set Input Value ---------- */

function setValue(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );


    if (!element) {
        return;
    }


    if (
        value !== undefined &&
        value !== null
    ) {

        element.value =
            value;

    }

}


/* ---------- Set Text Content ---------- */

function setText(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );


    if (!element) {
        return;
    }


    element.textContent =
        value || "";

}


/* ---------- Get Input Value ---------- */

function getValue(
    selector
) {

    const element =
        document.querySelector(
            selector
        );


    return element
        ? element.value.trim()
        : "";

}


/* ---------- Format Date ---------- */

function formatDateForInput(
    date
) {

    if (!date) {
        return "";
    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "";

    }


    return parsedDate
        .toISOString()
        .split("T")[0];

}