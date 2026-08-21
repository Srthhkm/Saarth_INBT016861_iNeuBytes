/* =========================================================
   HEALSPHERE - PATIENT APPOINTMENTS
   Major Project
   ========================================================= */


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPatientAppointments();

        initializeAppointmentFilters();

        initializeCancellation();

    }
);


/* ---------- Cancel Appointment ---------- */

function initializeCancellation() {

    document.addEventListener("click", event => {

        const button =
            event.target.closest("[data-cancel-appointment]");

        if (!button) {
            return;
        }

        cancelPatientAppointment(
            button.dataset.cancelAppointment,
            button
        );
    });
}


async function cancelPatientAppointment(appointmentId, button) {

    if (!window.confirm("Cancel this appointment?")) {
        return;
    }

    HealSphereUtils.setButtonLoading(button, true, "Cancelling...");

    try {

        const data =
            await HealSphereAPI.patch(
                `/appointments/${encodeURIComponent(appointmentId)}/cancel`,
                {}
            );

        HealSphereUtils.showToast(
            data?.message || "Appointment cancelled successfully.",
            "success"
        );

        await loadPatientAppointments();

    } catch (error) {

        HealSphereUtils.showToast(
            error.message || "Unable to cancel appointment.",
            "error"
        );

        HealSphereUtils.setButtonLoading(button, false);
    }
}


/* =========================================================
   LOAD APPOINTMENTS
   ========================================================= */

async function loadPatientAppointments() {

    const mainContainer =
        document.querySelector(
            "#appointmentList, " +
            "#appointmentsList, " +
            ".appointment-list"
        );


    try {

        const data =
            await HealSphereAPI.get(
                "/appointments/my"
            );


        const appointments =
            extractAppointments(
                data
            );


        /*
         * Store appointments globally so that
         * search and status filtering can reuse
         * the already fetched data.
         */

        window.patientAppointments =
            appointments;


        renderAppointments(
            appointments
        );


        updateAppointmentCounts(
            appointments
        );


    } catch (error) {

        console.error(
            "Unable to load appointments:",
            error
        );


        showAppointmentLoadError(
            mainContainer
        );

    }

}


/* =========================================================
   EXTRACT APPOINTMENTS
   ========================================================= */

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


/* =========================================================
   RENDER APPOINTMENTS
   ========================================================= */

function renderAppointments(
    appointments
) {

    /*
     * Separate upcoming and previous appointments.
     */

    const upcoming =
        appointments
            .filter(
                appointment =>
                    isUpcoming(
                        appointment
                    )
            )
            .sort(
                sortAppointments
            );


    const previous =
        appointments
            .filter(
                appointment =>
                    !isUpcoming(
                        appointment
                    )
            )
            .sort(
                sortAppointmentsDescending
            );


    /*
     * Locate the containers used by the
     * patient appointments page.
     */

    const upcomingContainer =
        findContainer(
            [
                "#upcomingAppointments",
                "#upcomingAppointmentList",
                "#upcomingAppointmentsList",
                ".upcoming-appointments",
                ".upcoming-appointment-list"
            ]
        );


    const previousContainer =
        findContainer(
            [
                "#previousAppointments",
                "#previousAppointmentList",
                "#previousAppointmentsList",
                ".previous-appointments",
                ".previous-appointment-list"
            ]
        );


    /*
     * If the page only has one appointment
     * container, use it as a fallback.
     */

    const fallbackContainer =
        findContainer(
            [
                "#appointmentList",
                "#appointmentsList",
                ".appointment-list"
            ]
        );


    if (
        upcomingContainer ||
        previousContainer
    ) {

        if (upcomingContainer) {

            upcomingContainer.innerHTML =
                createAppointmentSectionHTML(
                    upcoming,
                    "upcoming"
                );

        }


        if (previousContainer) {

            previousContainer.innerHTML =
                createAppointmentSectionHTML(
                    previous,
                    "previous"
                );

        }


        return;

    }


    /*
     * Backward-compatible fallback.
     */

    if (fallbackContainer) {

        const filtered =
            applyCurrentFilters(
                appointments
            );


        if (
            filtered.length === 0
        ) {

            fallbackContainer.innerHTML =
                createEmptyStateHTML();

            return;

        }


        fallbackContainer.innerHTML =
            filtered
                .sort(
                    sortAppointments
                )
                .map(
                    createAppointmentHTML
                )
                .join("");

    }

}


/* =========================================================
   CREATE APPOINTMENT SECTION
   ========================================================= */

function createAppointmentSectionHTML(
    appointments,
    sectionType
) {

    if (
        appointments.length === 0
    ) {

        if (
            sectionType === "upcoming"
        ) {

            return `

                <div class="empty-state">

                    <i class="fa-regular fa-calendar"></i>

                    <h3>
                        No upcoming appointments
                    </h3>

                    <p>
                        Your upcoming appointments will appear here.
                    </p>

                </div>

            `;

        }


        return `

            <div class="empty-state">

                <i class="fa-regular fa-calendar"></i>

                <h3>
                    No previous appointments
                </h3>

                <p>
                    Your previous appointments will appear here.
                </p>

            </div>

        `;

    }


    return appointments
        .map(
            createAppointmentHTML
        )
        .join("");

}


/* =========================================================
   CREATE APPOINTMENT CARD
   ========================================================= */

function createAppointmentHTML(
    appointment
) {

    /*
     * Backend structure:
     *
     * appointment.doctor
     *      └── user
     *           └── name
     *
     * appointment.department
     *      └── name
     *
     * appointment.appointmentDate
     * appointment.appointmentTime
     * appointment.status
     */


    const doctor =
        getDoctorName(
            appointment
        );


    const department =
        getDepartmentName(
            appointment
        );


    const date =
        getAppointmentDate(
            appointment
        );


    const time =
        getAppointmentTime(
            appointment
        );


    const status =
        formatStatus(
            appointment.status
        );


    const statusClass =
        String(
            appointment.status ||
            "pending"
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );


    return `

        <article
            class="appointment-card"
            data-status="${HealSphereUtils.escapeHTML(
                appointment.status ||
                "pending"
            )}"
            data-search="${HealSphereUtils.escapeHTML(
                (
                    doctor +
                    " " +
                    department
                ).toLowerCase()
            )}"
        >

            <div class="appointment-doctor">

                <div class="appointment-doctor-image">

                    <i class="fa-solid fa-user-doctor"></i>

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


            <div class="appointment-meta">

                <span class="appointment-date">

                    <i class="fa-regular fa-calendar"></i>

                    ${HealSphereUtils.escapeHTML(
                        date
                    )}

                </span>


                <span class="appointment-time">

                    <i class="fa-regular fa-clock"></i>

                    ${HealSphereUtils.escapeHTML(
                        time
                    )}

                </span>


                <span
                    class="status-badge ${statusClass}"
                >

                    ${HealSphereUtils.escapeHTML(
                        status
                    )}

                </span>

            </div>

            ${
                ["pending", "confirmed"].includes(
                    String(appointment.status).toLowerCase()
                )
                    ? `
                        <button
                            type="button"
                            class="btn btn-outline btn-sm"
                            data-cancel-appointment="${HealSphereUtils.escapeHTML(
                                appointment._id || appointment.id
                            )}"
                        >
                            <i class="fa-solid fa-xmark"></i>
                            Cancel Appointment
                        </button>
                    `
                    : ""
            }

        </article>

    `;

}


/* =========================================================
   GET DOCTOR NAME
   ========================================================= */

function getDoctorName(
    appointment
) {

    /*
     * Current backend structure:
     *
     * doctor.user.name
     */

    if (
        appointment &&
        appointment.doctor &&
        appointment.doctor.user &&
        appointment.doctor.user.name
    ) {

        return appointment
            .doctor
            .user
            .name;

    }


    /*
     * Additional fallbacks keep the frontend
     * compatible with older appointment data.
     */

    if (
        appointment &&
        appointment.doctor &&
        appointment.doctor.name
    ) {

        return appointment.doctor.name;

    }


    if (
        appointment &&
        appointment.doctorName
    ) {

        return appointment.doctorName;

    }


    return "Doctor";

}


/* =========================================================
   GET DEPARTMENT NAME
   ========================================================= */

function getDepartmentName(
    appointment
) {

    /*
     * Current backend structure:
     *
     * department.name
     */

    if (
        appointment &&
        appointment.department &&
        appointment.department.name
    ) {

        return appointment
            .department
            .name;

    }


    /*
     * Fallback for older frontend data.
     */

    if (
        typeof appointment.department ===
        "string"
    ) {

        return appointment.department;

    }


    if (
        appointment &&
        appointment.departmentName
    ) {

        return appointment.departmentName;

    }


    return "";

}


/* =========================================================
   GET APPOINTMENT DATE
   ========================================================= */

function getAppointmentDate(
    appointment
) {

    /*
     * Current backend field:
     *
     * appointmentDate
     */

    const rawDate =
        appointment &&
        (
            appointment.appointmentDate ||
            appointment.date
        );


    if (!rawDate) {

        return "";

    }


    /*
     * Use the existing HealSphere date
     * formatter when available.
     */

    try {

        if (
            typeof HealSphereUtils !==
            "undefined" &&
            typeof HealSphereUtils.formatDate ===
            "function"
        ) {

            return HealSphereUtils.formatDate(
                rawDate
            );

        }

    } catch (error) {

        console.warn(
            "Unable to format appointment date:",
            error
        );

    }


    /*
     * Fallback formatting.
     */

    const parsedDate =
        new Date(
            rawDate
        );


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return String(
            rawDate
        );

    }


    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   GET APPOINTMENT TIME
   ========================================================= */

function getAppointmentTime(
    appointment
) {

    /*
     * Current backend field:
     *
     * appointmentTime
     */

    return (
        appointment?.appointmentTime ||
        appointment?.time ||
        ""
    );

}


/* =========================================================
   FORMAT STATUS
   ========================================================= */

function formatStatus(
    status
) {

    const normalized =
        String(
            status ||
            "pending"
        )
            .toLowerCase();


    switch (
        normalized
    ) {

        case "confirmed":

            return "Confirmed";


        case "completed":

            return "Completed";


        case "cancelled":

            return "Cancelled";


        case "pending":

        default:

            return "Pending";

    }

}


/* =========================================================
   UPCOMING CHECK
   ========================================================= */

function isUpcoming(
    appointment
) {

    const rawDate =
        appointment &&
        (
            appointment.appointmentDate ||
            appointment.date
        );


    if (!rawDate) {

        return false;

    }


    const appointmentDate =
        new Date(
            rawDate
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
        )
            .toLowerCase();


    /*
     * Completed and cancelled appointments
     * are always considered previous.
     */

    if (
        status === "cancelled" ||
        status === "completed"
    ) {

        return false;

    }


    /*
     * Compare the appointment date with today.
     */

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
        appointmentDate >=
        today
    );

}


/* =========================================================
   SORT UPCOMING
   ========================================================= */

function sortAppointments(
    first,
    second
) {

    const firstDate =
        new Date(
            first.appointmentDate ||
            first.date
        );


    const secondDate =
        new Date(
            second.appointmentDate ||
            second.date
        );


    return (
        firstDate -
        secondDate
    );

}


/* =========================================================
   SORT PREVIOUS
   ========================================================= */

function sortAppointmentsDescending(
    first,
    second
) {

    return (
        sortAppointments(
            second,
            first
        )
    );

}


/* =========================================================
   COUNTS
   ========================================================= */

function updateAppointmentCounts(
    appointments
) {

    const upcoming =
        appointments.filter(
            appointment =>
                isUpcoming(
                    appointment
                )
        );


    const completed =
        appointments.filter(
            appointment =>
                String(
                    appointment.status ||
                    ""
                )
                    .toLowerCase() ===
                "completed"
        );


    const cancelled =
        appointments.filter(
            appointment =>
                String(
                    appointment.status ||
                    ""
                )
                    .toLowerCase() ===
                "cancelled"
        );


    updateElement(
        "#upcomingCount",
        upcoming.length
    );


    updateElement(
        "#completedCount",
        completed.length
    );


    updateElement(
        "#cancelledCount",
        cancelled.length
    );


    updateElement(
        "#totalAppointmentCount",
        appointments.length
    );

}


/* =========================================================
   SEARCH + STATUS FILTER
   ========================================================= */

function initializeAppointmentFilters() {

    const searchInput =
        document.querySelector(
            "#appointmentSearch, " +
            "#searchAppointments, " +
            "input[type='search']"
        );


    const statusFilter =
        document.querySelector(
            "#appointmentStatus, " +
            "#statusFilter, " +
            "select[name='status']"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyAppointmentFilters
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyAppointmentFilters
        );

    }

}


/* =========================================================
   APPLY FILTERS
   ========================================================= */

function applyAppointmentFilters() {

    const appointments =
        window.patientAppointments ||
        [];


    const filtered =
        applyCurrentFilters(
            appointments
        );


    renderAppointments(
        filtered
    );

}


/* =========================================================
   CURRENT FILTER VALUES
   ========================================================= */

function applyCurrentFilters(
    appointments
) {

    const searchInput =
        document.querySelector(
            "#appointmentSearch, " +
            "#searchAppointments, " +
            "input[type='search']"
        );


    const statusFilter =
        document.querySelector(
            "#appointmentStatus, " +
            "#statusFilter, " +
            "select[name='status']"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? String(
                statusFilter.value ||
                "all"
            ).toLowerCase()
            : "all";


    return appointments.filter(
        appointment => {

            const doctor =
                getDoctorName(
                    appointment
                ).toLowerCase();


            const department =
                getDepartmentName(
                    appointment
                ).toLowerCase();


            const matchesSearch =
                !search ||
                doctor.includes(
                    search
                ) ||
                department.includes(
                    search
                );


            const appointmentStatus =
                String(
                    appointment.status ||
                    "pending"
                ).toLowerCase();


            const matchesStatus =
                selectedStatus === "all" ||
                appointmentStatus ===
                selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );

}


/* =========================================================
   FIND CONTAINER
   ========================================================= */

function findContainer(
    selectors
) {

    for (
        const selector of selectors
    ) {

        const element =
            document.querySelector(
                selector
            );


        if (element) {

            return element;

        }

    }


    return null;

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function createEmptyStateHTML() {

    return `

        <div class="empty-state">

            <i class="fa-regular fa-calendar"></i>

            <h3>
                No Appointments Yet
            </h3>

            <p>
                Your booked appointments will appear here.
            </p>

            <a
                href="book-appointment.html"
                class="btn btn-primary"
            >
                Book an Appointment
            </a>

        </div>

    `;

}


/* =========================================================
   LOAD ERROR
   ========================================================= */

function showAppointmentLoadError(
    container
) {

    if (!container) {

        return;

    }


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


/* =========================================================
   GENERIC DOM HELPER
   ========================================================= */

function updateElement(
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