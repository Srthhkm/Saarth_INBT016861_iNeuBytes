/* =========================================================
   HEALSPHERE - PATIENT DASHBOARD
   Major Project
   ========================================================= */


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPatientDashboard();

    }
);


/* ---------- Main Dashboard Loader ---------- */

async function loadPatientDashboard() {

    const user =
        HealSphereUtils.getCurrentUser();


    /* ---------- Load Name Immediately ---------- */

    updatePatientName(user);


    try {

        /*
         * Load the patient's appointments and
         * patient profile from the backend.
         */

        const [
            appointmentsData,
            patientsData
        ] = await Promise.all([

            HealSphereAPI.get(
                "/appointments/my"
            ),

            HealSphereAPI.get(
                "/patients/me"
            )

        ]);


        /* ---------- Extract Appointments ---------- */

        const appointments =
            extractArray(
                appointmentsData,
                "appointments"
            );


        /* ---------- Update Patient Name ---------- */

        if (
            patientsData &&
            patientsData.patient
        ) {

            updatePatientName(
                patientsData.patient
            );

        }


        /* ---------- Update Statistics ---------- */

        updateAppointmentStats(
            appointments
        );


        /* ---------- Render Upcoming Appointments ---------- */

        renderUpcomingAppointments(
            appointments
        );


    } catch (error) {

        console.error(
            "Unable to load patient dashboard:",
            error
        );


        /*
         * Keep the dashboard usable if the backend
         * request fails.
         */

        updateAppointmentStats(
            []
        );


        renderUpcomingAppointments(
            []
        );

    }

}


/* ---------- Patient Name ---------- */

function updatePatientName(
    user
) {

    if (!user) {
        return;
    }


    /*
     * Patient profile data may contain the User
     * object inside "user".
     */

    const profileUser =
        user.user ||
        user;


    const name =
        profileUser.name ||
        profileUser.fullName ||
        profileUser.patientName;


    if (!name) {
        return;
    }


    /* ---------- Welcome Message ---------- */

    document
        .querySelectorAll(
            "#patientName, " +
            "#dashboardPatientName, " +
            ".patient-name"
        )
        .forEach(
            element => {

                element.textContent =
                    name;

            }
        );


    /*
     * Top-right dashboard user name.
     *
     * The HTML currently has only:
     *
     * <div class="dashboard-user">
     *     <a class="user-profile">
     *         ...
     *         <span>Patient</span>
     *     </a>
     * </div>
     *
     * Therefore we target that span specifically.
     */

    document
        .querySelectorAll(
            ".dashboard-user .user-profile span"
        )
        .forEach(
            element => {

                element.textContent =
                    name;

            }
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


/* ---------- Appointment Statistics ---------- */

function updateAppointmentStats(
    appointments
) {

    /* ---------- Upcoming ---------- */

    const upcoming =
        appointments.filter(
            appointment =>
                isUpcomingAppointment(
                    appointment
                )
        );


    /* ---------- Pending ---------- */

    const pending =
        appointments.filter(
            appointment =>
                String(
                    appointment.status ||
                    ""
                ).toLowerCase() ===
                "pending"
        );


    /* ---------- Completed ---------- */

    const completed =
        appointments.filter(
            appointment =>
                String(
                    appointment.status ||
                    ""
                ).toLowerCase() ===
                "completed"
        );


    /*
     * Update the exact IDs used by
     * patient/dashboard.html.
     */

    setText(
        "#upcomingCount",
        upcoming.length
    );


    setText(
        "#pendingCount",
        pending.length
    );


    setText(
        "#completedCount",
        completed.length
    );


    /*
     * Medical records are not currently being
     * fetched by this dashboard because there is
     * no medical-record API call in the existing
     * implementation.
     *
     * Keep the existing value until that endpoint
     * is connected.
     */

}


/* ---------- Upcoming Appointments ---------- */

function renderUpcomingAppointments(
    appointments
) {

    /*
     * This is the actual container ID used
     * in patient/dashboard.html.
     */

    const container =
        document.querySelector(
            "#upcomingAppointments"
        );


    if (!container) {
        return;
    }


    const upcoming =
        appointments
            .filter(
                appointment =>
                    isUpcomingAppointment(
                        appointment
                    )
            )
            .sort(
                compareAppointments
            )
            .slice(
                0,
                5
            );


    /* ---------- No Appointments ---------- */

    if (
        upcoming.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">

                    <i
                        class="fa-regular fa-calendar"
                    ></i>

                </div>


                <h3>
                    No upcoming appointments
                </h3>


                <p>
                    You don't have any upcoming appointments.
                </p>


                <a
                    href="book-appointment.html"
                    class="btn btn-primary btn-sm"
                >
                    Book Appointment
                </a>

            </div>

        `;

        return;
    }


    /* ---------- Render Appointments ---------- */

    container.innerHTML =
        upcoming
            .map(
                createAppointmentCard
            )
            .join("");

}


/* ---------- Appointment Card ---------- */

function createAppointmentCard(
    appointment
) {

    const doctor =
        appointment.doctorName ||
        getObjectName(
            appointment.doctor
        ) ||
        "Doctor";


    const department =
        appointment.departmentName ||
        getObjectName(
            appointment.department
        ) ||
        appointment.department ||
        "";


    const date =
        HealSphereUtils.formatDate(
            appointment.date
        );


    const time =
        appointment.time ||
        appointment.appointmentTime ||
        "";


    const status =
        appointment.status ||
        "Pending";


    return `

        <article
            class="appointment-card"
        >

            <div
                class="appointment-doctor"
            >

                <div
                    class="appointment-doctor-image"
                >

                    <i
                        class="fa-solid fa-user-doctor"
                    ></i>

                </div>


                <div>

                    <h4>

                        ${HealSphereUtils.escapeHTML(
                            doctor
                        )}

                    </h4>


                    <span>

                        ${HealSphereUtils.escapeHTML(
                            department
                        )}

                    </span>

                </div>

            </div>


            <div
                class="appointment-meta"
            >

                <span
                    class="appointment-date"
                >

                    ${HealSphereUtils.escapeHTML(
                        date
                    )}

                </span>


                <span
                    class="appointment-time"
                >

                    ${HealSphereUtils.escapeHTML(
                        time
                    )}

                </span>


                <span
                    class="status-badge"
                >

                    ${HealSphereUtils.escapeHTML(
                        status
                    )}

                </span>

            </div>

        </article>

    `;

}


/* ---------- Object Name Helper ---------- */

function getObjectName(
    value
) {

    if (
        value &&
        typeof value === "object"
    ) {

        return (
            value.name ||
            value.fullName ||
            value.doctorName ||
            value.departmentName ||
            ""
        );

    }


    return value || "";

}


/* ---------- Date Check ---------- */

function isUpcomingAppointment(
    appointment
) {

    if (!appointment.date) {
        return false;
    }


    const appointmentDate =
        new Date(
            appointment.date
        );


    if (
        Number.isNaN(
            appointmentDate.getTime()
        )
    ) {

        return false;

    }


    const status =
        String(
            appointment.status ||
            ""
        ).toLowerCase();


    /*
     * Completed and cancelled appointments
     * are not considered upcoming.
     */

    if (
        status === "cancelled" ||
        status === "completed"
    ) {

        return false;

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    appointmentDate.setHours(
        0,
        0,
        0,
        0
    );


    return (
        appointmentDate >= today
    );

}


/* ---------- Appointment Sorting ---------- */

function compareAppointments(
    first,
    second
) {

    const firstDate =
        new Date(
            first.date
        ).getTime();


    const secondDate =
        new Date(
            second.date
        ).getTime();


    return (
        firstDate -
        secondDate
    );

}


/* ---------- Set Text ---------- */

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