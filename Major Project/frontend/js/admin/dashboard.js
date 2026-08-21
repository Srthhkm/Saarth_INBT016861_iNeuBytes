/* =========================================================
   HEALSPHERE - ADMIN DASHBOARD
   Major Project
   ========================================================= */


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadAdminDashboard();

        window.setInterval(
            () => {

                if (!document.hidden) {
                    loadAdminDashboard();
                }
            },
            30000
        );
    }
);


/* ---------- Dashboard ---------- */

async function loadAdminDashboard() {

    try {

        const [
            doctorsData,
            patientsData,
            appointmentsData,
            departmentsData
        ] = await Promise.all([

            HealSphereAPI.get(
                "/doctors"
            ),

            HealSphereAPI.get(
                "/patients"
            ),

            HealSphereAPI.get(
                "/appointments"
            ),

            HealSphereAPI.get(
                "/departments"
            )

        ]);


        const doctors =
            extractArray(
                doctorsData,
                "doctors"
            );


        const patients =
            extractArray(
                patientsData,
                "patients"
            );


        const appointments =
            extractArray(
                appointmentsData,
                "appointments"
            );


        const departments =
            extractArray(
                departmentsData,
                "departments"
            );


        updateStatistics(
            doctors,
            patients,
            appointments,
            departments
        );


        renderRecentAppointments(
            appointments
        );


        renderDepartmentStatistics(
            departments,
            doctors
        );


    } catch (error) {

        console.error(
            "Unable to load admin dashboard:",
            error
        );


        /*
         * Keep the dashboard functional even if
         * the API is temporarily unavailable.
         */

        updateStatistics(
            [],
            [],
            [],
            []
        );

    }

}


/* ---------- Statistics ---------- */

function updateStatistics(
    doctors,
    patients,
    appointments,
    departments
) {

    setText(
        "#totalDoctors",
        doctors.length
    );


    setText(
        "#totalPatients",
        patients.length
    );


    setText(
        "#totalAppointments",
        appointments.length
    );


    setText(
        "#totalDepartments",
        departments.length
    );


    const pending =
        countByStatus(
            appointments,
            "pending"
        );


    const confirmed =
        countByStatus(
            appointments,
            "confirmed"
        );


    const completed =
        countByStatus(
            appointments,
            "completed"
        );


    const cancelled =
        countByStatus(
            appointments,
            "cancelled"
        );


    setText(
        "#pendingAppointments",
        pending
    );


    setText(
        "#confirmedAppointments",
        confirmed
    );


    setText(
        "#completedAppointments",
        completed
    );


    setText(
        "#cancelledAppointments",
        cancelled
    );

}


/* ---------- Recent Appointments ---------- */

function renderRecentAppointments(
    appointments
) {

    const container =
        document.querySelector(
            "#recentAppointments, " +
            "#appointmentList"
        );


    if (!container) {
        return;
    }


    const recent =
        [...appointments]
            .sort(
                compareAppointments
            )
            .slice(0, 5);


    if (
        recent.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    No Appointments
                </h3>

                <p>
                    No appointments are available.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        recent
            .map(
                appointment =>
                    `

                    <div class="appointment-summary-row">

                        <div>

                            <strong>
                                ${HealSphereUtils.escapeHTML(
                                    appointment.patientName ||
                                    appointment.patient?.name ||
                                    "Patient"
                                )}
                            </strong>

                            <span>
                                ${HealSphereUtils.escapeHTML(
                                    appointment.doctorName ||
                                    appointment.doctor ||
                                    "Doctor"
                                )}
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${HealSphereUtils.escapeHTML(
                                    appointment.time || ""
                                )}
                            </strong>

                            <span>
                                ${HealSphereUtils.escapeHTML(
                                    HealSphereUtils.formatDate(
                                        appointment.date
                                    )
                                )}
                            </span>

                        </div>


                        <span class="status-badge">

                            ${HealSphereUtils.escapeHTML(
                                appointment.status ||
                                "Pending"
                            )}

                        </span>

                    </div>

                    `
            )
            .join("");

}


/* ---------- Department Statistics ---------- */

function renderDepartmentStatistics(
    departments,
    doctors
) {

    const container =
        document.querySelector(
            "#departmentStatistics"
        );


    if (!container) {
        return;
    }


    if (
        departments.length === 0
    ) {

        container.innerHTML =
            "<p>No departments available.</p>";

        return;
    }


    container.innerHTML =
        departments
            .map(
                department => {

                    const departmentName =
                        getDepartmentName(
                            department
                        );


                    const doctorCount =
                        doctors.filter(
                            doctor =>
                                normalize(
                                    getDoctorDepartment(
                                        doctor
                                    )
                                ) ===
                                normalize(
                                    departmentName
                                )
                        ).length;


                    return `

                        <div class="department-stat-row">

                            <span>
                                ${HealSphereUtils.escapeHTML(
                                    departmentName
                                )}
                            </span>

                            <strong>
                                ${doctorCount}
                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

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


function countByStatus(
    appointments,
    status
) {

    return appointments.filter(
        appointment =>
            String(
                appointment.status || ""
            ).toLowerCase() ===
            status.toLowerCase()
    ).length;

}


function compareAppointments(
    first,
    second
) {

    return (
        new Date(first.date) -
        new Date(second.date)
    );

}


function getDepartmentName(
    department
) {

    return (
        department?.name ||
        department?.departmentName ||
        String(department || "")
    );

}


function getDoctorDepartment(
    doctor
) {

    return (
        doctor?.department?.name ||
        doctor?.department ||
        ""
    );

}


function normalize(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();

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