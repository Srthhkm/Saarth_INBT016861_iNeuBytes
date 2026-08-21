/* =========================================================
   HEALSPHERE - ADMIN DOCTOR MANAGEMENT
   Major Project
   ========================================================= */


let doctors = [];

let departments = [];


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadDepartments();

        await loadDoctors();

        initializeDoctorForm();

        initializeDoctorSearch();

    }
);


/* ---------- Load Doctors ---------- */

async function loadDoctors() {

    try {

        const data =
            await HealSphereAPI.get(
                "/doctors"
            );


       doctors =
    extractArray(
        data,
        "doctors"
    ).filter(
        doctor =>
            doctor?.isAvailable !== false
    );


        renderDoctors();


    } catch (error) {

        console.error(
            "Unable to load doctors:",
            error
        );

    }

}


/* ---------- Load Departments ---------- */

async function loadDepartments() {

    try {

        const data =
            await HealSphereAPI.get(
                "/departments"
            );


        departments =
            extractArray(
                data,
                "departments"
            );


        /*
         * Only active departments should be available
         * for new doctor assignments.
         */

        departments =
            departments.filter(
                department =>
                    department?.isActive !== false
            );


        renderDepartmentOptions();


    } catch (error) {

        console.error(
            "Unable to load departments:",
            error
        );

    }

}


/* ---------- Department Dropdown ---------- */

function renderDepartmentOptions() {

    const select =
        document.querySelector(
            "#doctorDepartment"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            Select Department
        </option>

    `;


    departments.forEach(
        department => {

            const name =
                getDepartmentName(
                    department
                );


            const id =
                getDepartmentId(
                    department
                );


            if (!name || !id) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            /*
             * The visible text is the department name.
             *
             * The actual value sent to the backend
             * is the MongoDB Department ObjectId.
             */

            option.value =
                id;


            option.textContent =
                name;


            select.appendChild(
                option
            );

        }
    );

}


/* ---------- Render Doctors ---------- */

function renderDoctors(
    searchText = ""
) {

    const tableBody =
        document.querySelector(
            "#doctorTableBody"
        );


    const emptyMessage =
        document.querySelector(
            "#noDoctors"
        );


    if (!tableBody) {
        return;
    }


    const search =
        String(
            searchText || ""
        )
            .trim()
            .toLowerCase();


    const filtered =
        doctors.filter(
            doctor => {

                const name =
                    getDoctorName(
                        doctor
                    )
                        .toLowerCase();


                const department =
                    getDoctorDepartment(
                        doctor
                    )
                        .toLowerCase();


                return (
                    !search ||
                    name.includes(search) ||
                    department.includes(search)
                );

            }
        );


    tableBody.innerHTML = "";


    if (
        filtered.length === 0
    ) {

        if (emptyMessage) {

            emptyMessage.classList.remove(
                "hidden"
            );

        }

        return;

    }


    if (emptyMessage) {

        emptyMessage.classList.add(
            "hidden"
        );

    }


    filtered.forEach(
        doctor => {

            const row =
                document.createElement(
                    "tr"
                );


            const id =
                getDoctorId(
                    doctor
                );


            row.innerHTML = `

                <td>
                    ${HealSphereUtils.escapeHTML(
                        getDoctorName(doctor)
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        getDoctorDepartment(doctor)
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        doctor.qualification ||
                        ""
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        String(
                            doctor.experience ??
                            ""
                        )
                    )}
                </td>

                <td>
                    ₹${HealSphereUtils.escapeHTML(
                        String(
                            doctor.consultationFee ??
                            doctor.fee ??
                            0
                        )
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        doctor.availability ||
                        ""
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="table-btn edit-doctor-btn"
                        data-id="${HealSphereUtils.escapeHTML(
                            id
                        )}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="table-btn delete-doctor-btn"
                        data-id="${HealSphereUtils.escapeHTML(
                            id
                        )}"
                    >
                        Delete
                    </button>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


/* ---------- Form Initialization ---------- */

function initializeDoctorForm() {

    const form =
        document.querySelector(
            "#doctorForm"
        );


    const showButton =
        document.querySelector(
            "#showDoctorForm"
        );


    const cancelButton =
        document.querySelector(
            "#cancelDoctorForm"
        );


    if (showButton) {

        showButton.addEventListener(
            "click",
            () => {

                resetDoctorForm();

                showDoctorForm();

            }
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                resetDoctorForm();

                hideDoctorForm();

            }
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            handleDoctorSubmit
        );

    }


    document.addEventListener(
        "click",
        handleDoctorTableAction
    );

}


/* ---------- Submit Doctor ---------- */

async function handleDoctorSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const id =
        getValue(
            form,
            "#doctorId"
        );


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


    const password =
        getValue(
            form,
            "#doctorPassword"
        );


    const phone =
        getValue(
            form,
            "#doctorPhone"
        );


    const department =
        getValue(
            form,
            "#doctorDepartment"
        );


    const qualification =
        getValue(
            form,
            "#doctorQualification"
        );


    const experience =
        getValue(
            form,
            "#doctorExperience"
        );


    const fee =
        getValue(
            form,
            "#doctorFee"
        );


    const availability =
        getValue(
            form,
            "#doctorAvailability"
        );


    /* ---------- Validation ---------- */

    if (name.length < 3) {

        HealSphereUtils.showToast(
            "Please enter a valid doctor name.",
            "error"
        );

        return;

    }


    if (!id && !email) {

        HealSphereUtils.showToast(
            "Please enter the doctor's email.",
            "error"
        );

        return;

    }


    if (
        !id &&
        password.length < 6
    ) {

        HealSphereUtils.showToast(
            "Password must contain at least 6 characters.",
            "error"
        );

        return;

    }


    if (!department) {

        HealSphereUtils.showToast(
            "Please select a department.",
            "error"
        );

        return;

    }


    if (!qualification) {

        HealSphereUtils.showToast(
            "Please enter qualification.",
            "error"
        );

        return;

    }


    if (
        experience === "" ||
        Number(experience) < 0
    ) {

        HealSphereUtils.showToast(
            "Please enter valid experience in years.",
            "error"
        );

        return;

    }


    if (
        fee === "" ||
        Number(fee) < 0
    ) {

        HealSphereUtils.showToast(
            "Please enter a valid consultation fee.",
            "error"
        );

        return;

    }


    if (!availability) {

        HealSphereUtils.showToast(
            "Please enter availability.",
            "error"
        );

        return;

    }


    /* ---------- Build Request ---------- */

    const doctorData = {

        name,

        department,

        qualification,

        experience:
            Number(experience),

        consultationFee:
            Number(fee),

        availability

    };


    /*
     * These fields are required when creating
     * a new doctor account.
     *
     * They are intentionally not sent during
     * an ordinary doctor profile update.
     */

    if (!id) {

        doctorData.email =
            email;

        doctorData.password =
            password;

        doctorData.phone =
            phone;

    } else if (phone) {

        /*
         * Phone can still be updated for an
         * existing doctor.
         */

        doctorData.phone =
            phone;

    }


    const submitButton =
        form.querySelector(
            "button[type='submit']"
        );


    HealSphereUtils.setButtonLoading(
        submitButton,
        true,
        id
            ? "Updating..."
            : "Adding..."
    );


    try {

        if (id) {

            await HealSphereAPI.patch(
                `/doctors/${encodeURIComponent(
                    id
                )}`,
                doctorData
            );


            HealSphereUtils.showToast(
                "Doctor updated successfully.",
                "success"
            );

        } else {

            await HealSphereAPI.post(
                "/doctors",
                doctorData
            );


            HealSphereUtils.showToast(
                "Doctor added successfully.",
                "success"
            );

        }


        resetDoctorForm();

        hideDoctorForm();

        await loadDoctors();


    } catch (error) {

        HealSphereUtils.showToast(
            error.message ||
            "Unable to save doctor.",
            "error"
        );

    } finally {

        HealSphereUtils.setButtonLoading(
            submitButton,
            false
        );

    }

}


/* ---------- Table Actions ---------- */

async function handleDoctorTableAction(
    event
) {

    const editButton =
        event.target.closest(
            ".edit-doctor-btn"
        );


    const deleteButton =
        event.target.closest(
            ".delete-doctor-btn"
        );


    if (editButton) {

        editDoctor(
            editButton.dataset.id
        );

    }


    if (deleteButton) {

        await deleteDoctor(
            deleteButton.dataset.id
        );

    }

}


/* ---------- Edit Doctor ---------- */

function editDoctor(
    id
) {

    const doctor =
        doctors.find(
            item =>
                String(
                    getDoctorId(item)
                ) ===
                String(id)
        );


    if (!doctor) {
        return;
    }


    setValue(
        "#doctorId",
        getDoctorId(doctor)
    );


    setValue(
        "#doctorName",
        getDoctorName(doctor)
    );


    /*
     * Use the actual Department ObjectId
     * because option values contain ObjectIds.
     */

    setValue(
        "#doctorDepartment",
        getDoctorDepartmentId(doctor)
    );


    setValue(
        "#doctorQualification",
        doctor.qualification ||
        ""
    );


    setValue(
        "#doctorExperience",
        doctor.experience ??
        ""
    );


    setValue(
        "#doctorFee",
        doctor.consultationFee ??
        doctor.fee ??
        ""
    );


    setValue(
        "#doctorAvailability",
        doctor.availability ||
        ""
    );


    setValue(
        "#doctorEmail",
        doctor.user?.email ||
        ""
    );


    setValue(
        "#doctorPhone",
        doctor.user?.phone ||
        ""
    );


    /*
     * Password is not changed while editing.
     */

    setValue(
        "#doctorPassword",
        ""
    );


    const emailInput =
        document.querySelector(
            "#doctorEmail"
        );


    if (emailInput) {

        emailInput.disabled =
            true;

    }


    const passwordInput =
        document.querySelector(
            "#doctorPassword"
        );


    if (passwordInput) {

        passwordInput.disabled =
            true;

    }


    const passwordGroup =
        document.querySelector(
            "#doctorPasswordGroup"
        );


    if (passwordGroup) {

        passwordGroup.classList.add(
            "hidden"
        );

    }


    const title =
        document.querySelector(
            "#doctorFormTitle"
        );


    if (title) {

        title.textContent =
            "Edit Doctor";

    }


    showDoctorForm();


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* ---------- Delete / Deactivate Doctor ---------- */

async function deleteDoctor(
    id
) {

    if (
        !confirm(
            "Are you sure you want to deactivate this doctor?"
        )
    ) {

        return;

    }


    try {

        await HealSphereAPI.delete(
            `/doctors/${encodeURIComponent(
                id
            )}`
        );


        HealSphereUtils.showToast(
            "Doctor deactivated successfully.",
            "success"
        );


        await loadDoctors();


    } catch (error) {

        HealSphereUtils.showToast(
            error.message ||
            "Unable to deactivate doctor.",
            "error"
        );

    }

}


/* ---------- Search ---------- */

function initializeDoctorSearch() {

    const search =
        document.querySelector(
            "#doctorSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        () => {

            renderDoctors(
                search.value
            );

        }
    );

}


/* ---------- Show Form ---------- */

function showDoctorForm() {

    const container =
        document.querySelector(
            "#doctorFormContainer"
        );


    if (container) {

        container.classList.remove(
            "hidden"
        );

    }

}


/* ---------- Hide Form ---------- */

function hideDoctorForm() {

    const container =
        document.querySelector(
            "#doctorFormContainer"
        );


    if (container) {

        container.classList.add(
            "hidden"
        );

    }

}


/* ---------- Reset Form ---------- */

function resetDoctorForm() {

    const form =
        document.querySelector(
            "#doctorForm"
        );


    if (form) {

        form.reset();

    }


    setValue(
        "#doctorId",
        ""
    );


    const emailInput =
        document.querySelector(
            "#doctorEmail"
        );


    if (emailInput) {

        emailInput.disabled =
            false;

    }


    const passwordInput =
        document.querySelector(
            "#doctorPassword"
        );


    if (passwordInput) {

        passwordInput.disabled =
            false;

    }


    const passwordGroup =
        document.querySelector(
            "#doctorPasswordGroup"
        );


    if (passwordGroup) {

        passwordGroup.classList.remove(
            "hidden"
        );

    }


    const title =
        document.querySelector(
            "#doctorFormTitle"
        );


    if (title) {

        title.textContent =
            "Add Doctor";

    }

}


/* ---------- Get Value ---------- */

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


/* ---------- Set Value ---------- */

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


/* ---------- Doctor ID ---------- */

function getDoctorId(
    doctor
) {

    return (
        doctor?.id ||
        doctor?._id ||
        ""
    );

}


/* ---------- Doctor Name ---------- */

function getDoctorName(
    doctor
) {

    return (
        doctor?.name ||
        doctor?.fullName ||
        doctor?.doctorName ||
        doctor?.user?.name ||
        ""
    );

}


/* ---------- Doctor Department Name ---------- */

function getDoctorDepartment(
    doctor
) {

    return (
        doctor?.department?.name ||
        doctor?.department ||
        ""
    );

}


/* ---------- Doctor Department ID ---------- */

function getDoctorDepartmentId(
    doctor
) {

    return (
        doctor?.department?._id ||
        doctor?.department?.id ||
        ""
    );

}


/* ---------- Department ID ---------- */

function getDepartmentId(
    department
) {

    return (
        department?._id ||
        department?.id ||
        ""
    );

}


/* ---------- Department Name ---------- */

function getDepartmentName(
    department
) {

    return (
        department?.name ||
        department?.departmentName ||
        ""
    );

}


/* ---------- Extract Array ---------- */

function extractArray(
    data,
    property
) {

    if (Array.isArray(data)) {

        return data;

    }


    if (
        data &&
        Array.isArray(
            data[property]
        )
    ) {

        return data[property];

    }


    if (
        data &&
        Array.isArray(
            data.data
        )
    ) {

        return data.data;

    }


    return [];

}