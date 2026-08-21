/* =========================================================
   HEALSPHERE - ADMIN APPOINTMENT MANAGEMENT
   Major Project
   ========================================================= */


let appointments = [];


/* ---------- Statuses ---------- */

const APPOINTMENT_STATUSES = [
    "Pending",
    "Confirmed",
    "Completed",
    "Cancelled"
];


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadAppointments();

        initializeAppointmentSearch();

        initializeAppointmentFilter();

        initializeAppointmentActions();

    }
);


/* ---------- Load ---------- */

async function loadAppointments() {

    try {

        const data =
            await HealSphereAPI.get(
                "/appointments"
            );


        appointments =
            extractArray(
                data,
                "appointments"
            );


        renderAppointments();


    } catch (error) {

        console.error(
            "Unable to load appointments:",
            error
        );

    }

}


/* ---------- Render ---------- */

function renderAppointments(
    searchText = "",
    statusFilter = ""
) {

    const tableBody =
        document.querySelector(
            "#appointmentTableBody"
        );


    const emptyMessage =
        document.querySelector(
            "#noAppointments"
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
        appointments.filter(
            appointment => {

                const patient =
                    getPatientName(
                        appointment
                    )
                        .toLowerCase();


                const doctor =
                    getDoctorName(
                        appointment
                    )
                        .toLowerCase();


                const department =
                    getDepartmentName(
                        appointment
                    )
                        .toLowerCase();


                const status =
                    String(
                        appointment.status ||
                        "pending"
                    );


                const matchesSearch =
                    !search ||
                    patient.includes(search) ||
                    doctor.includes(search) ||
                    department.includes(search);


                const matchesStatus =
                    !statusFilter ||
                    status.toLowerCase() ===
                    statusFilter.toLowerCase();


                return (
                    matchesSearch &&
                    matchesStatus
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
        appointment => {

            const row =
                document.createElement(
                    "tr"
                );


            const id =
                appointment.id ||
                appointment._id ||
                "";


            const status =
                appointment.status ||
                "pending";


            const patient =
                getPatientName(
                    appointment
                );


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


            row.innerHTML = `

                <td>
                    ${HealSphereUtils.escapeHTML(
                        patient
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        doctor
                    )}
                </td>


                <td>
                    ${HealSphereUtils.escapeHTML(
                        department
                    )}
                </td>


                <td>
                    ${HealSphereUtils.escapeHTML(
                        HealSphereUtils.formatDate(
                            date
                        )
                    )}
                </td>


                <td>
                    ${HealSphereUtils.escapeHTML(
                        time
                    )}
                </td>


                <td>

                    <select
                        class="appointment-status-select"
                        data-id="${HealSphereUtils.escapeHTML(
                            id
                        )}"
                    >

                        ${APPOINTMENT_STATUSES
                            .map(
                                option => `

                                    <option
                                        value="${option}"
                                        ${
                                            option.toLowerCase() ===
                                            String(
                                                status
                                            ).toLowerCase()
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${option}
                                    </option>

                                `
                            )
                            .join("")}

                    </select>

                </td>


                <td>
                    <button
                        type="button"
                        class="btn btn-outline btn-sm reschedule-appointment-btn"
                        data-id="${HealSphereUtils.escapeHTML(id)}"
                    >
                        <i class="fa-solid fa-calendar-days"></i>
                        Reschedule
                    </button>
                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   APPOINTMENT DATA HELPERS
   ========================================================= */


/* ---------- Patient Name ---------- */

function getPatientName(
    appointment
) {

    /*
     * Backend structure:
     *
     * appointment.patient
     *      └── user
     *           └── name
     *
     * Patient is populated with its User document
     * in appointmentController.
     */

    return (
        appointment.patientName ||
        appointment.patient?.user?.name ||
        appointment.patient?.name ||
        "Patient"
    );

}


/* ---------- Doctor Name ---------- */

function getDoctorName(
    appointment
) {

    /*
     * Backend structure:
     *
     * appointment.doctor
     *      └── user
     *           └── name
     */

    return (
        appointment.doctorName ||
        appointment.doctor?.user?.name ||
        appointment.doctor?.name ||
        "Doctor"
    );

}


/* ---------- Department Name ---------- */

function getDepartmentName(
    appointment
) {

    /*
     * Backend populates:
     *
     * appointment.department
     *      └── name
     */

    return (
        appointment.departmentName ||
        appointment.department?.name ||
        (
            typeof appointment.department ===
            "string"
                ? appointment.department
                : ""
        )
    );

}


/* ---------- Appointment Date ---------- */

function getAppointmentDate(
    appointment
) {

    /*
     * Backend field:
     *
     * appointmentDate
     *
     * Older frontend code used:
     * appointment.date
     *
     * Support both so the page remains
     * compatible with existing data.
     */

    return (
        appointment.appointmentDate ||
        appointment.date ||
        ""
    );

}


/* ---------- Appointment Time ---------- */

function getAppointmentTime(
    appointment
) {

    /*
     * Backend field:
     *
     * appointmentTime
     */

    return (
        appointment.appointmentTime ||
        appointment.time ||
        ""
    );

}


/* ---------- Search ---------- */

function initializeAppointmentSearch() {

    const search =
        document.querySelector(
            "#appointmentSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        applyAppointmentFilters
    );

}


/* ---------- Filter ---------- */

function initializeAppointmentFilter() {

    const filter =
        document.querySelector(
            "#appointmentStatusFilter, " +
            "#statusFilter"
        );


    if (!filter) {
        return;
    }


    filter.addEventListener(
        "change",
        applyAppointmentFilters
    );

}


/* ---------- Apply Filters ---------- */

function applyAppointmentFilters() {

    const search =
        document.querySelector(
            "#appointmentSearch"
        );


    const filter =
        document.querySelector(
            "#appointmentStatusFilter, " +
            "#statusFilter"
        );


    renderAppointments(
        search?.value || "",
        filter?.value || ""
    );

}


/* ---------- Status Update ---------- */

function initializeAppointmentActions() {

    document.addEventListener(
        "click",
        event => {
            const button = event.target.closest(
                ".reschedule-appointment-btn"
            );

            if (button) {
                rescheduleAppointment(button.dataset.id);
            }
        }
    );

    document.addEventListener(
        "change",
        async event => {

            const select =
                event.target.closest(
                    ".appointment-status-select"
                );


            if (!select) {
                return;
            }


            await updateAppointmentStatus(
                select.dataset.id,
                select.value
            );

        }
    );

}


/* ---------- Update Status ---------- */

async function updateAppointmentStatus(
    id,
    status
) {

    if (!id || !status) {
        return;
    }


    try {

        /*
         * Backend expects lowercase status values:
         *
         * pending
         * confirmed
         * completed
         * cancelled
         */

        const backendStatus =
            String(
                status
            ).toLowerCase();


        await HealSphereAPI.patch(
            `/appointments/${encodeURIComponent(
                id
            )}/status`,
            {
                status:
                    backendStatus
            }
        );


        const appointment =
            appointments.find(
                item =>
                    String(
                        item.id ||
                        item._id
                    ) ===
                    String(id)
            );


        if (appointment) {

            appointment.status =
                backendStatus;

        }


        HealSphereUtils.showToast(
            "Appointment status updated successfully.",
            "success"
        );


        applyAppointmentFilters();


    } catch (error) {

        console.error(
            "Unable to update appointment status:",
            error
        );


        HealSphereUtils.showToast(
            error.message ||
            "Unable to update appointment status.",
            "error"
        );


        await loadAppointments();

    }

}


/* ---------- Helpers ---------- */

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


async function rescheduleAppointment(id) {
    const date = window.prompt("Enter the new date (YYYY-MM-DD):");
    const time = date && window.prompt("Enter the new time:");

    if (!date || !time) {
        return;
    }

    try {
        await HealSphereAPI.patch(
            `/appointments/${encodeURIComponent(id)}/reschedule`,
            { date, time }
        );
        HealSphereUtils.showToast(
            "Appointment rescheduled successfully.",
            "success"
        );
        await loadAppointments();
    } catch (error) {
        HealSphereUtils.showToast(error.message, "error");
    }
}