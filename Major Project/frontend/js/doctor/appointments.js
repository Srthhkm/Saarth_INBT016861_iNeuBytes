/* =========================================================
   HEALSPHERE - DOCTOR APPOINTMENTS
   Major Project
   ========================================================= */


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDoctorAppointments();

        initializeAppointmentActions();

        /*
         * Keep the doctor's appointment list synchronized
         * with newly created patient bookings.
         *
         * This uses the backend as the source of truth.
         */
        setInterval(
            loadDoctorAppointments,
            5000
        );

    }
);


/* ---------- Load Appointments ---------- */

async function loadDoctorAppointments() {

    const container =
        document.querySelector(
            "#doctorAppointmentsList, " +
            "#consultationList, " +
            "#appointmentList, " +
            ".consultation-list"
        );


    if (!container) {
        return;
    }


    try {

        const data =
            await HealSphereAPI.get(
                "/appointments/doctor"
            );


        const appointments =
            extractAppointments(
                data
            );


        renderAppointments(
            container,
            appointments
        );


        updateCounts(
            appointments
        );


    } catch (error) {

        console.error(
            "Unable to load doctor appointments:",
            error
        );


        /*
         * Don't replace an already populated list
         * during a temporary polling/network failure.
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
                        Unable to Load Appointments
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


/* ---------- Render ---------- */

function renderAppointments(
    container,
    appointments
) {

    if (
        appointments.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-calendar"></i>

                <h3>
                    No Appointments
                </h3>

                <p>
                    No patient appointments are currently assigned to you.
                </p>

            </div>

        `;

        return;

    }


    const sorted =
        [...appointments]
            .sort(
                compareAppointments
            );


    container.innerHTML =
        sorted
            .map(
                createAppointmentHTML
            )
            .join("");

}


/* ---------- Appointment Card ---------- */

function createAppointmentHTML(
    appointment
) {

    const id =
        appointment._id ||
        appointment.id ||
        "";


    /*
     * Backend structure:
     *
     * appointment.patient.user.name
     *
     * because Patient references User.
     */
    const patient =
        getPatientName(
            appointment
        );


    /*
     * Backend uses appointmentDate.
     */
    const dateValue =
        appointment.appointmentDate ||
        appointment.date ||
        "";


    const date =
        dateValue
            ? HealSphereUtils.formatDate(
                dateValue
            )
            : "N/A";


    /*
     * Backend uses appointmentTime.
     */
    const time =
        appointment.appointmentTime ||
        appointment.time ||
        "";


    const reason =
        appointment.reason ||
        appointment.message ||
        "General Consultation";


    const status =
        normalizeStatus(
            appointment.status
        );


    const statusClass =
        status
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );


    return `

        <article
            class="consultation-card"
            data-appointment-id="${HealSphereUtils.escapeHTML(
                String(id)
            )}"
        >

            <div class="patient-summary">

                <div class="patient-avatar">

                    ${HealSphereUtils.escapeHTML(
                        getInitials(patient)
                    )}

                </div>


                <div>

                    <h4>
                        ${HealSphereUtils.escapeHTML(
                            patient
                        )}
                    </h4>

                    <span>
                        ${HealSphereUtils.escapeHTML(
                            reason
                        )}
                    </span>

                </div>

            </div>


            <div class="consultation-time">

                <strong>
                    ${HealSphereUtils.escapeHTML(
                        time || "N/A"
                    )}
                </strong>

                <span>
                    ${HealSphereUtils.escapeHTML(
                        date
                    )}
                </span>

            </div>


            <div class="appointment-actions">

                <span
                    class="status-badge ${statusClass}"
                >

                    ${HealSphereUtils.escapeHTML(
                        status
                    )}

                </span>


                ${
                    status.toLowerCase() !==
                    "completed" &&
                    status.toLowerCase() !==
                    "cancelled"
                        ? `

                            <button
                                type="button"
                                class="btn btn-primary btn-sm consultation-btn"
                                data-id="${HealSphereUtils.escapeHTML(
                                    String(id)
                                )}"
                            >
                                Consultation
                            </button>

                          `
                        : ""
                }

            </div>

        </article>

    `;

}


/* ---------- Patient Name ---------- */

function getPatientName(
    appointment
) {

    const patient =
        appointment?.patient;


    if (!patient) {
        return "Patient";
    }


    /*
     * Correct backend structure.
     */
    if (
        patient.user &&
        typeof patient.user === "object"
    ) {

        return (
            patient.user.name ||
            patient.user.fullName ||
            "Patient"
        );

    }


    /*
     * Fallbacks for older response shapes.
     */
    return (
        patient.name ||
        patient.fullName ||
        appointment.patientName ||
        (
            typeof patient === "string"
                ? patient
                : "Patient"
        )
    );

}


/* ---------- Normalize Status ---------- */

function normalizeStatus(
    status
) {

    const value =
        String(
            status || "pending"
        )
            .trim()
            .toLowerCase();


    return value
        .charAt(0)
        .toUpperCase() +
        value.slice(1);

}


/* ---------- Consultation Actions ---------- */

function initializeAppointmentActions() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".consultation-btn"
                );


            if (!button) {
                return;
            }


            const appointmentId =
                button.dataset.id;


            if (!appointmentId) {
                return;
            }


            openConsultation(
                appointmentId
            );

        }
    );

}


/* ---------- Open Consultation ---------- */

function openConsultation(
    appointmentId
) {

    const currentUrl =
        new URL(
            window.location.href
        );


    currentUrl.searchParams.set(
        "appointment",
        appointmentId
    );


    const consultationForm =
        document.querySelector(
            "#consultationForm, " +
            ".consultation-form"
        );


    if (consultationForm) {

        consultationForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        loadAppointmentForConsultation(
            appointmentId
        );


        return;

    }


    window.location.href =
        `patients.html?appointment=${encodeURIComponent(
            appointmentId
        )}`;

}


/* ---------- Load Consultation Patient ---------- */

async function loadAppointmentForConsultation(
    appointmentId
) {

    try {

        /*
         * The current appointment routes do not expose
         * GET /appointments/:id, so obtain the appointment
         * from the doctor's existing appointment list.
         */
        const data =
            await HealSphereAPI.get(
                "/appointments/doctor"
            );


        const appointments =
            extractAppointments(
                data
            );


        const appointment =
            appointments.find(
                item =>
                    String(
                        item._id ||
                        item.id
                    ) ===
                    String(
                        appointmentId
                    )
            );


        if (!appointment) {

            HealSphereUtils.showToast(
                "Appointment details could not be found.",
                "error"
            );

            return;

        }


        populateConsultationForm(
            appointment
        );


    } catch (error) {

        console.error(
            "Unable to load appointment:",
            error
        );


        HealSphereUtils.showToast(
            "Unable to load appointment details.",
            "error"
        );

    }

}


/* ---------- Populate Consultation ---------- */

function populateConsultationForm(
    appointment
) {

    const patient =
        getPatientName(
            appointment
        );


    const patientNameInput =
        document.querySelector(
            "#patientName"
        );


    if (patientNameInput) {

        patientNameInput.value =
            patient;

    }


    const appointmentIdInput =
        document.querySelector(
            "#appointmentId"
        );


    if (appointmentIdInput) {

        appointmentIdInput.value =
            appointment._id ||
            appointment.id ||
            "";

    }


    const form =
        document.querySelector(
            "#consultationForm"
        );


    if (!form) {
        return;
    }


    form.onsubmit =
        event =>
            submitConsultation(
                event,
                appointment
            );

}


/* ---------- Submit Consultation ---------- */

async function submitConsultation(
    event,
    appointment
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const diagnosis =
        getFormValue(
            form,
            "#diagnosis, [name='diagnosis']"
        );


    const prescription =
        getFormValue(
            form,
            "#prescription, [name='prescription']"
        );


    const notes =
        getFormValue(
            form,
            "#notes, #consultationNotes, " +
            "[name='notes'], textarea"
        );


    if (
        !diagnosis &&
        !prescription &&
        !notes
    ) {

        HealSphereUtils.showToast(
            "Please enter consultation details.",
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
        "Saving..."
    );


    try {

        const appointmentId =
            appointment._id ||
            appointment.id;


        const consultationData = {

            patient: appointment.patient?._id || appointment.patient?.id,
            appointment: appointmentId,

            diagnosis,

            prescription,

            notes

        };


        const data =
            await HealSphereAPI.post(
                "/medical-records",
                consultationData
            );


        HealSphereUtils.showToast(
            data?.message ||
            "Consultation saved successfully.",
            "success"
        );


        /*
         * Backend appointment status values are lowercase.
         */
        try {

            await HealSphereAPI.patch(
                `/appointments/${encodeURIComponent(
                    appointmentId
                )}/status`,
                {
                    status: "completed"
                }
            );


        } catch (statusError) {

            console.warn(
                "Appointment status was not updated:",
                statusError
            );

        }


        form.reset();


        /*
         * Reload the appointment list so the completed
         * appointment immediately reflects the new status.
         */
        await loadDoctorAppointments();


    } catch (error) {

        HealSphereUtils.showToast(
            error.message ||
            "Unable to save consultation.",
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

function getFormValue(
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


/* ---------- Sort ---------- */

function compareAppointments(
    first,
    second
) {

    const firstDate =
        new Date(
            first.appointmentDate ||
            first.date ||
            0
        );


    const secondDate =
        new Date(
            second.appointmentDate ||
            second.date ||
            0
        );


    if (
        firstDate.getTime() !==
        secondDate.getTime()
    ) {

        return (
            firstDate -
            secondDate
        );

    }


    return String(
        first.appointmentTime ||
        first.time ||
        ""
    ).localeCompare(
        String(
            second.appointmentTime ||
            second.time ||
            ""
        )
    );

}


/* ---------- Counts ---------- */

function updateCounts(
    appointments
) {

    const pending =
        appointments.filter(
            appointment =>
                String(
                    appointment.status || ""
                ).toLowerCase() ===
                "pending"
        );


    const confirmed =
        appointments.filter(
            appointment =>
                String(
                    appointment.status || ""
                ).toLowerCase() ===
                "confirmed"
        );


    const completed =
        appointments.filter(
            appointment =>
                String(
                    appointment.status || ""
                ).toLowerCase() ===
                "completed"
        );


    setText(
        "#pendingAppointments",
        pending.length
    );


    setText(
        "#confirmedAppointments",
        confirmed.length
    );


    setText(
        "#completedAppointments",
        completed.length
    );


    setText(
        "#totalAppointments",
        appointments.length
    );

}


function setText(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );


    if (element) {

        element.textContent =
            value;

    }

}