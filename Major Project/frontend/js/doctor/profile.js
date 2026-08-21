/* =========================================================
   HEALSPHERE - DOCTOR PROFILE
   Major Project
   ========================================================= */


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDoctorProfile();

        initializeProfileForm();

    }
);


/* ---------- Load Doctor Profile ---------- */

async function loadDoctorProfile() {

    try {

        /*
         * Load doctor profile and departments together.
         *
         * Doctor profile tells us which department
         * the doctor currently belongs to.
         *
         * Departments endpoint gives us the current
         * database list.
         */

        const [
            doctorData,
            departmentData
        ] = await Promise.all([

            HealSphereAPI.get(
                "/doctors/me"
            ),

            HealSphereAPI.get(
                "/departments"
            )

        ]);


        const doctor =
            doctorData?.doctor;


        if (!doctor) {

            console.error(
                "Doctor profile data was not returned."
            );

            return;
        }


        /*
         * Populate department dropdown BEFORE
         * populating the doctor profile so the
         * doctor's current department can be selected.
         */

        populateDepartmentDropdown(
            departmentData,
            doctor.department
        );


        populateProfile(
            doctor
        );


    } catch (error) {

        console.error(
            "Unable to load doctor profile:",
            error
        );


        HealSphereUtils.showToast(
            "Unable to load your profile.",
            "error"
        );

    }

}


/* =========================================================
   DEPARTMENT DROPDOWN
   ========================================================= */


/* ---------- Populate Departments ---------- */

function populateDepartmentDropdown(
    departmentData,
    currentDepartment
) {

    const select =
        document.getElementById(
            "doctorDepartment"
        );


    if (!select) {

        console.warn(
            "Doctor department dropdown not found."
        );

        return;
    }


    /*
     * Backend response format:
     *
     * {
     *     success: true,
     *     count: ...,
     *     departments: [...]
     * }
     */

    const departments =
        Array.isArray(
            departmentData?.departments
        )
            ? departmentData.departments
            : [];


    /*
     * Determine current doctor's department ID.
     */

    const currentDepartmentId =
        currentDepartment?._id ||
        currentDepartment ||
        "";


    /*
     * Remove all hard-coded options.
     */

    select.innerHTML = "";


    /* ---------- Default Option ---------- */

    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value = "";


    defaultOption.textContent =
        "Select Department";


    select.appendChild(
        defaultOption
    );


    /* ---------- No Departments ---------- */

    if (
        departments.length === 0
    ) {

        const emptyOption =
            document.createElement(
                "option"
            );


        emptyOption.value = "";


        emptyOption.textContent =
            "No departments available";


        emptyOption.disabled = true;


        select.appendChild(
            emptyOption
        );


        return;
    }


    /* ---------- Add Departments ---------- */

    departments.forEach(
        department => {

            if (
                !department?._id ||
                !department?.name
            ) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            /*
             * IMPORTANT:
             *
             * Value must be the Department
             * MongoDB ObjectId.
             */

            option.value =
                department._id;


            option.textContent =
                department.name;


            /*
             * Automatically select the
             * doctor's existing department.
             */

            if (
                String(
                    department._id
                ) ===
                String(
                    currentDepartmentId
                )
            ) {

                option.selected =
                    true;

            }


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   PROFILE DISPLAY
   ========================================================= */


/* ---------- Populate Profile ---------- */

function populateProfile(
    doctor
) {

    /*
     * Account information is stored inside
     * the populated User document.
     */

    const user =
        doctor.user || {};


    const name =
        user.name || "";


    const email =
        user.email || "";


    const phone =
        user.phone || "";


    /*
     * Department is stored as a referenced
     * Department document.
     */

    const department =
        doctor.department?.name ||
        "";


    const qualification =
        doctor.qualification || "";


    const experience =
        doctor.experience !== undefined &&
        doctor.experience !== null
            ? doctor.experience
            : "";


    const availability =
        doctor.availability || "";


    const bio =
        doctor.bio || "";


    const specialization =
        doctor.specialization || "";


    /* ---------- Form Fields ---------- */

    setValue(
        "#doctorName",
        name
    );


    setValue(
        "#doctorEmail",
        email
    );


    setValue(
        "#doctorPhone",
        phone
    );


    setValue(
        "#doctorQualification",
        qualification
    );


    /*
     * Department select uses the Department ObjectId,
     * not the department name.
     */

    setValue(
        "#doctorDepartment",
        doctor.department?._id || ""
    );


    setValue(
        "#doctorExperience",
        experience
    );


    setValue(
        "#doctorAvailability",
        availability
    );


    setValue(
        "#doctorHours",
        ""
    );


    setValue(
        "#doctorBio",
        bio
    );


    /* ---------- Profile Sidebar ---------- */

    setText(
        "#doctorNavName",
        formatDoctorName(
            name
        )
    );


    setText(
        "#doctorDisplayName",
        formatDoctorName(
            name
        )
    );


    setText(
        "#doctorDisplaySpeciality",
        specialization ||
        department ||
        "Doctor"
    );


    setText(
        "#doctorDisplayQualification",
        qualification ||
        "Qualification"
    );


    setText(
        "#doctorDisplayEmail",
        email ||
        "Email"
    );


    setText(
        "#doctorDisplayPhone",
        phone ||
        "Phone"
    );


    setText(
        "#doctorDisplayDepartment",
        department ||
        "Department"
    );

}


/* =========================================================
   FORM
   ========================================================= */


/* ---------- Initialize Form ---------- */

function initializeProfileForm() {

    const form =
        document.getElementById(
            "doctorProfileForm"
        );


    if (!form) {

        console.warn(
            "Doctor profile form not found."
        );

        return;
    }


    form.addEventListener(
        "submit",
        handleProfileSubmit
    );


    /*
     * Reset should reload the actual profile
     * and departments from the backend.
     */

    form.addEventListener(
        "reset",
        () => {

            setTimeout(
                () => {

                    loadDoctorProfile();

                },
                0
            );

        }
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
            form,
            "#doctorName"
        );


    const email =
        getValue(
            form,
            "#doctorEmail"
        );


    const phone =
        getValue(
            form,
            "#doctorPhone"
        );


    const qualification =
        getValue(
            form,
            "#doctorQualification"
        );


    const department =
        getValue(
            form,
            "#doctorDepartment"
        );


    const experience =
        getValue(
            form,
            "#doctorExperience"
        );


    const availability =
        getValue(
            form,
            "#doctorAvailability"
        );


    const hours =
        getValue(
            form,
            "#doctorHours"
        );


    const bio =
        getValue(
            form,
            "#doctorBio"
        );


    /* ---------- Required Fields ---------- */

    if (
        !name ||
        !email ||
        !phone ||
        !qualification ||
        !department ||
        !experience
    ) {

        HealSphereUtils.showToast(
            "Please complete all required profile fields.",
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


    /* ---------- Experience Validation ---------- */

    const experienceNumber =
        Number(
            experience
        );


    if (
        Number.isNaN(
            experienceNumber
        ) ||
        experienceNumber < 0
    ) {

        HealSphereUtils.showToast(
            "Please enter a valid experience value.",
            "error"
        );

        return;
    }


    /* ---------- Availability ---------- */

    let finalAvailability =
        availability;


    if (
        hours
    ) {

        if (
            finalAvailability
        ) {

            finalAvailability =
                `${finalAvailability}, ${hours}`;

        } else {

            finalAvailability =
                hours;

        }

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
         * Department is already the MongoDB
         * Department ObjectId because the dropdown
         * options use department._id as their value.
         */

        const profileData = {

            name,

            email,

            phone,

            department,

            qualification,

            experience:
                experienceNumber,

            availability:
                finalAvailability,

            bio

        };


        /* ---------- Get Current Doctor ---------- */

        const currentData =
            await HealSphereAPI.get(
                "/doctors/me"
            );


        const currentDoctor =
            currentData?.doctor;


        if (
            !currentDoctor?._id
        ) {

            throw new Error(
                "Doctor profile ID could not be determined."
            );

        }


        /* ---------- Update Doctor ---------- */

        const data =
            await HealSphereAPI.patch(
                `/doctors/${currentDoctor._id}`,
                profileData
            );


        const updatedDoctor =
            data?.doctor;


        if (!updatedDoctor) {

            throw new Error(
                "Updated doctor profile was not returned."
            );

        }


        /*
         * Save updated User information so the
         * doctor's name remains consistent throughout
         * the dashboard.
         */

        if (
            updatedDoctor.user
        ) {

            HealSphereUtils.saveCurrentUser(
                updatedDoctor.user
            );

        }


        /*
         * Re-populate departments using the current
         * database state and automatically select the
         * newly saved department.
         */

        try {

            const departmentData =
                await HealSphereAPI.get(
                    "/departments"
                );


            populateDepartmentDropdown(
                departmentData,
                updatedDoctor.department
            );

        } catch (departmentError) {

            console.error(
                "Unable to refresh departments:",
                departmentError
            );

        }


        /*
         * Refresh the entire profile from the
         * returned backend data.
         */

        populateProfile(
            updatedDoctor
        );


        HealSphereUtils.showToast(
            data?.message ||
            "Profile updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Unable to update doctor profile:",
            error
        );


        HealSphereUtils.showToast(
            error.message ||
            "Unable to update your profile.",
            "error"
        );

    } finally {

        HealSphereUtils.setButtonLoading(
            submitButton,
            false
        );

    }

}


/* =========================================================
   HELPERS
   ========================================================= */


/* ---------- Format Doctor Name ---------- */

function formatDoctorName(
    name
) {

    if (!name) {
        return "Doctor";
    }


    const trimmedName =
        name.trim();


    if (
        trimmedName
            .toLowerCase()
            .startsWith("dr.")
    ) {

        return trimmedName;

    }


    return `Dr. ${trimmedName}`;

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
    form,
    selector
) {

    const element =
        form.querySelector(
            selector
        );


    return element
        ? element.value.trim()
        : "";

}