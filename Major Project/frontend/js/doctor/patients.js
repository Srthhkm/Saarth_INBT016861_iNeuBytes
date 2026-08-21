/* =========================================================
   HEALSPHERE - DOCTOR PATIENTS
   Major Project
   ========================================================= */


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDoctorPatients();

        initializePatientSearch();

        /*
         * Keep patient records synchronized with newly
         * booked appointments.
         */
        setInterval(
            loadDoctorPatients,
            5000
        );

    }
);


/* ---------- Load Patients ---------- */

async function loadDoctorPatients() {

    const container =
        document.querySelector(
            "#patientList, " +
            "#patientsList, " +
            ".doctor-patients-grid"
        );


    if (!container) {
        return;
    }


    try {

        /*
         * IMPORTANT:
         *
         * Patients shown to a doctor are derived from
         * the doctor's actual appointments.
         *
         * This keeps appointments and patients synchronized
         * and avoids maintaining a second data source.
         */
        const data =
            await HealSphereAPI.get(
                "/appointments/doctor"
            );


        const appointments =
            extractAppointments(
                data
            );


        const patients =
            extractUniquePatients(
                appointments
            );


        renderPatients(
            container,
            patients
        );


        updatePatientCount(
            patients.length
        );


    } catch (error) {

        console.error(
            "Unable to load patients:",
            error
        );


        /*
         * Do not destroy an already visible patient list
         * because of a temporary polling/network error.
         */
        if (
            !container.children.length ||
            container.querySelector(
                ".empty-state"
            )
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>
                        Unable to Load Patients
                    </h3>

                    <p>
                        Please try again later.
                    </p>

                </div>

            `;

        }

    }

}


/* ---------- Extract Appointments ---------- */

function extractAppointments(
    data
) {

    if (Array.isArray(data)) {
        return data;
    }


    if (
        data &&
        Array.isArray(
            data.appointments
        )
    ) {

        return data.appointments;

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


/* ---------- Extract Unique Patients ---------- */

function extractUniquePatients(
    appointments
) {

    const patientMap =
        new Map();


    appointments.forEach(
        appointment => {

            const patient =
                appointment?.patient;


            if (!patient) {
                return;
            }


            const patientId =
                patient._id ||
                patient.id;


            if (!patientId) {
                return;
            }


            /*
             * If a patient has multiple appointments,
             * only one patient card should be displayed.
             */
            if (
                !patientMap.has(
                    String(patientId)
                )
            ) {

                patientMap.set(
                    String(patientId),
                    patient
                );

            }

        }
    );


    return Array.from(
        patientMap.values()
    );

}


/* ---------- Render ---------- */

function renderPatients(
    container,
    patients
) {

    if (
        patients.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-users"></i>

                <h3>
                    No Patients Found
                </h3>

                <p>
                    Patients connected to your appointments
                    will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        patients
            .map(
                createPatientHTML
            )
            .join("");


    /*
     * Preserve the search text after a polling refresh.
     */
    const searchInput =
        document.querySelector(
            "#patientSearch, " +
            "#searchPatients, " +
            ".patient-search input"
        );


    if (searchInput) {

        filterPatients(
            searchInput.value
        );

    }

}


/* ---------- Patient Card ---------- */

function createPatientHTML(
    patient
) {

    const id =
        patient._id ||
        patient.id ||
        "";


    const user =
        patient.user || {};


    /*
     * Correct backend structure:
     *
     * Patient
     *   └── user
     *        ├── name
     *        ├── email
     *        └── phone
     */
    const name =
        user.name ||
        user.fullName ||
        patient.name ||
        patient.fullName ||
        "Patient";


    const age =
        patient.age !== undefined &&
        patient.age !== null
            ? patient.age
            : "N/A";


    const gender =
        patient.gender ||
        "N/A";


    const phone =
        user.phone ||
        patient.phone ||
        "N/A";


    const email =
        user.email ||
        patient.email ||
        "N/A";


    return `

        <article
            class="patient-detail-card"
            data-patient-id="${HealSphereUtils.escapeHTML(
                String(id)
            )}"
            data-gender="${HealSphereUtils.escapeHTML(
                gender
            )}"
        >

            <div class="patient-avatar">

                ${HealSphereUtils.escapeHTML(
                    getInitials(name)
                )}

            </div>


            <h2>

                ${HealSphereUtils.escapeHTML(
                    name
                )}

            </h2>


            <p>
                Patient
            </p>


            <div class="patient-info-list">

                <div class="patient-info-row">

                    <span>
                        Age
                    </span>

                    <span>
                        ${HealSphereUtils.escapeHTML(
                            String(age)
                        )}
                    </span>

                </div>


                <div class="patient-info-row">

                    <span>
                        Gender
                    </span>

                    <span>
                        ${HealSphereUtils.escapeHTML(
                            gender
                        )}
                    </span>

                </div>


                <div class="patient-info-row">

                    <span>
                        Phone
                    </span>

                    <span>
                        ${HealSphereUtils.escapeHTML(
                            phone
                        )}
                    </span>

                </div>


                <div class="patient-info-row">

                    <span>
                        Email
                    </span>

                    <span>
                        ${HealSphereUtils.escapeHTML(
                            email
                        )}
                    </span>

                </div>

            </div>


            <button
                type="button"
                class="btn btn-outline btn-sm view-patient-btn"
                data-id="${HealSphereUtils.escapeHTML(
                    String(id)
                )}"
            >
                View Details
            </button>

        </article>

    `;

}


/* ---------- Search ---------- */

function initializePatientSearch() {

    const searchInput =
        document.querySelector(
            "#patientSearch, " +
            "#searchPatients, " +
            ".patient-search input"
        );


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        HealSphereUtils.debounce(
            () => {

                filterPatients(
                    searchInput.value
                );

            },
            250
        )
    );

}


/* ---------- Filter ---------- */

function filterPatients(
    searchTerm
) {

    const cards =
        document.querySelectorAll(
            "[data-patient-id]"
        );


    const term =
        String(
            searchTerm || ""
        )
            .trim()
            .toLowerCase();


    cards.forEach(
        card => {

            const text =
                card.textContent
                    .toLowerCase();


            card.style.display =
                !term ||
                text.includes(term)
                    ? ""
                    : "none";

        }
    );

}


/* ---------- Patient Details ---------- */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".view-patient-btn"
            );


        if (!button) {
            return;
        }


        const patientId =
            button.dataset.id;


        if (!patientId) {
            return;
        }


        loadPatientDetails(
            patientId
        );

    }
);


/* ---------- Load Details ---------- */

async function loadPatientDetails(
    patientId
) {

    try {

        const data =
            await HealSphereAPI.get(
                `/patients/${encodeURIComponent(
                    patientId
                )}`
            );


        const patient =
            data?.patient ||
            data?.data ||
            data;


        if (!patient) {
            return;
        }


        showPatientDetails(
            patient
        );


    } catch (error) {

        console.error(
            "Unable to load patient details:",
            error
        );


        HealSphereUtils.showToast(
            "Unable to load patient details.",
            "error"
        );

    }

}


/* ---------- Details Display ---------- */

function showPatientDetails(
    patient
) {

    const existing =
        document.getElementById(
            "patientDetailsModal"
        );


    if (existing) {
        existing.remove();
    }


    const user =
        patient.user || {};


    const name =
        user.name ||
        user.fullName ||
        patient.name ||
        patient.fullName ||
        "Patient";


    const phone =
        user.phone ||
        patient.phone ||
        "N/A";


    const email =
        user.email ||
        patient.email ||
        "N/A";


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "patientDetailsModal";


    modal.className =
        "modal-overlay";


    modal.innerHTML = `

        <div class="modal-card">

            <button
                type="button"
                class="modal-close"
                aria-label="Close"
            >
                &times;
            </button>


            <div class="patient-avatar">

                ${HealSphereUtils.escapeHTML(
                    getInitials(name)
                )}

            </div>


            <h2>

                ${HealSphereUtils.escapeHTML(
                    name
                )}

            </h2>


            <div class="patient-info-list">

                <div class="patient-info-row">

                    <span>
                        Age
                    </span>

                    <span>
                        ${HealSphereUtils.escapeHTML(
                            String(
                                patient.age ??
                                "N/A"
                            )
                        )}
                    </span>

                </div>


                <div class="patient-info-row">

                    <span>
                        Gender
                    </span>

                    <span>
                        ${HealSphereUtils.escapeHTML(
                            patient.gender ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div class="patient-info-row">

                    <span>
                        Phone
                    </span>

                    <span>
                        ${HealSphereUtils.escapeHTML(
                            phone
                        )}
                    </span>

                </div>


                <div class="patient-info-row">

                    <span>
                        Email
                    </span>

                    <span>
                        ${HealSphereUtils.escapeHTML(
                            email
                        )}
                    </span>

                </div>


                <div class="patient-info-row">

                    <span>
                        Address
                    </span>

                    <span>
                        ${HealSphereUtils.escapeHTML(
                            patient.address ||
                            "N/A"
                        )}
                    </span>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal
        .querySelector(
            ".modal-close"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                modal.remove();

            }

        }
    );

}


/* ---------- Patient Count ---------- */

function updatePatientCount(
    count
) {

    const element =
        document.querySelector(
            "#patientCount"
        );


    if (!element) {
        return;
    }


    element.textContent =
        `${count} ${
            count === 1
                ? "Patient"
                : "Patients"
        }`;

}


/* ---------- Helpers ---------- */

function getInitials(
    name
) {

    return String(
        name || "P"
    )
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            part =>
                part.charAt(0)
        )
        .join("")
        .toUpperCase();

}