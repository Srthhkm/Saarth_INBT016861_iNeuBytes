/* =========================================================
   HEALSPHERE - ADMIN PATIENT MANAGEMENT
   Major Project
   ========================================================= */


let patients = [];


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadPatients();

        initializePatientForm();

        initializePatientSearch();

        window.setInterval(
            () => {

                if (!document.hidden) {
                    loadPatients();
                }
            },
            30000
        );

    }
);


/* ---------- Load Patients ---------- */

async function loadPatients() {

    try {

        const data =
            await HealSphereAPI.get(
                "/patients"
            );


        patients =
            extractArray(
                data,
                "patients"
            );


        renderPatients();


    } catch (error) {

        console.error(
            "Unable to load patients:",
            error
        );

    }

}


/* ---------- Render ---------- */

function renderPatients(
    searchText = ""
) {

    const tableBody =
        document.querySelector(
            "#patientTableBody"
        );


    const emptyMessage =
        document.querySelector(
            "#noPatients"
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
        patients.filter(
            patient => {

                const name =
                    getPatientName(
                        patient
                    )
                        .toLowerCase();


                const email =
                    String(
                        getPatientEmail(
                            patient
                        )
                    )
                        .toLowerCase();


                const phone =
                    String(
                        getPatientPhone(
                            patient
                        )
                    )
                        .toLowerCase();


                return (
                    !search ||
                    name.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search)
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
        patient => {

            const row =
                document.createElement(
                    "tr"
                );


            const id =
                getPatientId(
                    patient
                );


            row.innerHTML = `

                <td>
                    ${HealSphereUtils.escapeHTML(
                        getPatientName(
                            patient
                        )
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        getPatientEmail(
                            patient
                        )
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        getPatientPhone(
                            patient
                        )
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        getPatientAge(
                            patient
                        ) ?? "N/A"
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        patient.gender ||
                        "N/A"
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="table-btn edit-patient-btn"
                        data-id="${HealSphereUtils.escapeHTML(
                            id
                        )}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="table-btn delete-patient-btn"
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


/* ---------- Form ---------- */

function initializePatientForm() {

    const form =
        document.querySelector(
            "#patientForm"
        );


    const showButton =
        document.querySelector(
            "#showPatientForm"
        );


    const cancelButton =
        document.querySelector(
            "#cancelPatientForm"
        );


    if (showButton) {

        showButton.addEventListener(
            "click",
            () => {

                resetPatientForm();

                showPatientForm();

            }
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                resetPatientForm();

                hidePatientForm();

            }
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            handlePatientSubmit
        );

    }


    document.addEventListener(
        "click",
        handlePatientAction
    );

}


/* ---------- Submit ---------- */

async function handlePatientSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const id =
        form.querySelector(
            "#patientId"
        )?.value.trim();


    const name =
        form.querySelector(
            "#patientName"
        )?.value.trim();


    const email =
        form.querySelector(
            "#patientEmail"
        )?.value.trim();


    const phone =
        form.querySelector(
            "#patientPhone"
        )?.value.trim();

    const password =
        form.querySelector(
            "#patientPassword"
        )?.value;


    const age =
        form.querySelector(
            "#patientAge"
        )?.value;


    const gender =
        form.querySelector(
            "#patientGender"
        )?.value;


    const address =
        form.querySelector(
            "#patientAddress"
        )?.value.trim();


    if (
        !name ||
        name.length < 3
    ) {

        HealSphereUtils.showToast(
            "Please enter a valid patient name.",
            "error"
        );

        return;
    }


    if (
        email &&
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


    if (
        !id &&
        (!password || password.length < 6)
    ) {

        HealSphereUtils.showToast(
            "Please enter a password with at least 6 characters for the new patient.",
            "error"
        );

        return;
    }


    const patientData = {

        name,

        email,

        phone,

        age: age
            ? Number(age)
            : null,

        gender,

        address

    };


    if (!id) {
        patientData.password = password;
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
                `/patients/${encodeURIComponent(
                    id
                )}`,
                patientData
            );


            HealSphereUtils.showToast(
                "Patient updated successfully.",
                "success"
            );

        } else {

            await HealSphereAPI.post(
                "/patients",
                patientData
            );


            HealSphereUtils.showToast(
                "Patient added successfully.",
                "success"
            );

        }


        resetPatientForm();

        hidePatientForm();

        await loadPatients();


    } catch (error) {

        HealSphereUtils.showToast(
            error.message ||
            "Unable to save patient.",
            "error"
        );

    } finally {

        HealSphereUtils.setButtonLoading(
            submitButton,
            false
        );

    }

}


/* ---------- Actions ---------- */

async function handlePatientAction(
    event
) {

    const editButton =
        event.target.closest(
            ".edit-patient-btn"
        );


    const deleteButton =
        event.target.closest(
            ".delete-patient-btn"
        );


    if (editButton) {

        editPatient(
            editButton.dataset.id
        );

    }


    if (deleteButton) {

        await deletePatient(
            deleteButton.dataset.id
        );

    }

}


/* ---------- Edit ---------- */

function editPatient(
    id
) {

    const patient =
        patients.find(
            item =>
                String(
                    getPatientId(item)
                ) ===
                String(id)
        );


    if (!patient) {
        return;
    }


    setValue(
        "#patientId",
        getPatientId(patient)
    );


    setValue(
        "#patientName",
        getPatientName(patient)
    );


    setValue(
        "#patientEmail",
        getPatientEmail(patient)
    );


    setValue(
        "#patientPhone",
        getPatientPhone(patient)
    );


    setValue(
        "#patientPassword",
        ""
    );


    setValue(
        "#patientAge",
        getPatientAge(patient) ?? ""
    );


    setValue(
        "#patientGender",
        patient.gender ||
        ""
    );


    setValue(
        "#patientAddress",
        patient.address ||
        ""
    );


    const title =
        document.querySelector(
            "#patientFormTitle"
        );


    if (title) {
        title.textContent =
            "Edit Patient";
    }


    showPatientForm();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ---------- Delete ---------- */

async function deletePatient(
    id
) {

    if (
        !confirm(
            "Are you sure you want to delete this patient?"
        )
    ) {
        return;
    }


    try {

        await HealSphereAPI.delete(
            `/patients/${encodeURIComponent(
                id
            )}`
        );


        HealSphereUtils.showToast(
            "Patient deleted successfully.",
            "success"
        );


        await loadPatients();


    } catch (error) {

        HealSphereUtils.showToast(
            error.message ||
            "Unable to delete patient.",
            "error"
        );

    }

}


/* ---------- Search ---------- */

function initializePatientSearch() {

    const search =
        document.querySelector(
            "#patientSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        () => {

            renderPatients(
                search.value
            );

        }
    );

}


/* ---------- UI ---------- */

function showPatientForm() {

    const container =
        document.querySelector(
            "#patientFormContainer"
        );


    if (container) {
        container.classList.remove(
            "hidden"
        );
    }

}


function hidePatientForm() {

    const container =
        document.querySelector(
            "#patientFormContainer"
        );


    if (container) {
        container.classList.add(
            "hidden"
        );
    }

}


function resetPatientForm() {

    const form =
        document.querySelector(
            "#patientForm"
        );


    if (form) {
        form.reset();
    }


    setValue(
        "#patientId",
        ""
    );


    const title =
        document.querySelector(
            "#patientFormTitle"
        );


    if (title) {
        title.textContent =
            "Add Patient";
    }

}


/* ---------- Helpers ---------- */

function getPatientId(
    patient
) {

    return (
        patient?.id ||
        patient?._id ||
        ""
    );

}


function getPatientName(
    patient
) {

    return (
        patient?.name ||
        patient?.fullName ||
        patient?.user?.name ||
        ""
    );

}


function getPatientEmail(
    patient
) {

    return (
        patient?.email ||
        patient?.user?.email ||
        ""
    );

}


function getPatientPhone(
    patient
) {

    return (
        patient?.phone ||
        patient?.user?.phone ||
        ""
    );

}


function getPatientAge(
    patient
) {

    return (
        patient?.age ??
        patient?.user?.age ??
        null
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
        Array.isArray(data.data)
    ) {
        return data.data;
    }


    return [];
}