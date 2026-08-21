/* =========================================================
   HEALSPHERE - ADMIN REPORTS & ANALYTICS
   Major Project
   ========================================================= */


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeReportActions();
        loadReports();

        window.setInterval(
            () => {

                if (!document.hidden) {
                    loadReports();
                }
            },
            30000
        );
    }
);


let reportAppointments = [];


function initializeReportActions() {
    document.querySelector("#exportReportsCsv")?.addEventListener(
        "click",
        exportReportsCsv
    );

    document.querySelector("#printReports")?.addEventListener(
        "click",
        () => window.print()
    );
}


/* ---------- Load Reports ---------- */

async function loadReports() {

    try {

        const [
            systemReportData,
            appointmentReportData,
            doctorsData,
            patientsData,
            appointmentsData,
            departmentsData
        ] = await Promise.all([

            HealSphereAPI.get(
                "/reports/system"
            ),

            HealSphereAPI.get(
                "/reports/appointments"
            ),

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

        reportAppointments = appointments;


        renderReportSummary(
            doctors,
            patients,
            appointments,
            departments,
            systemReportData?.statistics
        );


        renderAppointmentStatusReport(
            appointmentReportData?.statistics,
            appointments
        );


        renderDepartmentReport(
            departments,
            doctors,
            appointments
        );


    } catch (error) {

        console.error(
            "Unable to load reports:",
            error
        );

    }

}


/* ---------- Summary ---------- */

function renderReportSummary(
    doctors,
    patients,
    appointments,
    departments,
    statistics = {}
) {

    setText(
        "#reportDoctors",
        statistics.totalDoctors ??
        doctors.length
    );


    setText(
        "#reportPatients",
        statistics.totalPatients ??
        patients.length
    );


    setText(
        "#reportAppointments",
        statistics.totalAppointments ??
        appointments.length
    );


    setText(
        "#reportDepartments",
        statistics.totalDepartments ??
        departments.length
    );

}


/* ---------- Appointment Status ---------- */

function renderAppointmentStatusReport(
    statistics = {},
    appointments = []
) {

    const counts = statistics && Object.keys(statistics).length > 0
        ? statistics
        : appointments.reduce(
            (result, appointment) => {

                const status =
                    String(
                        appointment.status ||
                        "pending"
                    ).toLowerCase();

                if (Object.prototype.hasOwnProperty.call(result, status)) {
                    result[status]++;
                }

                return result;
            },
            {
                pending: 0,
                confirmed: 0,
                completed: 0,
                cancelled: 0
            }
        );


    setText(
        "#reportPending",
        counts.pending || 0
    );

    setText(
        "#reportConfirmed",
        counts.confirmed || 0
    );

    setText(
        "#reportCompleted",
        counts.completed || 0
    );

    setText(
        "#reportCancelled",
        counts.cancelled || 0
    );

    const chart = document.querySelector("#reportStatusChart");

    if (chart) {
        const total = Object.values(counts).reduce(
            (sum, value) => sum + Number(value || 0),
            0
        );

        chart.innerHTML = Object.entries(counts).map(
            ([status, value]) => `
                <div class="report-bar-row">
                    <span>${HealSphereUtils.escapeHTML(status)}</span>
                    <div class="report-bar-track">
                        <div class="report-bar" style="width: ${total ? (value / total) * 100 : 0}%"></div>
                    </div>
                    <strong>${value || 0}</strong>
                </div>
            `
        ).join("");
    }

}


function exportReportsCsv() {
    const rows = [
        ["Patient", "Doctor", "Department", "Date", "Time", "Status"],
        ...reportAppointments.map(appointment => [
            getPatientName(appointment),
            getDoctorName(appointment),
            getDepartmentName(appointment),
            appointment.appointmentDate || "",
            appointment.appointmentTime || "",
            appointment.status || ""
        ])
    ];

    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");

    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "healsphere-appointment-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
}


function getPatientName(appointment) {
    return appointment?.patient?.user?.name ||
        appointment?.patient?.name ||
        appointment?.patientName ||
        "Patient";
}


function getDoctorName(appointment) {
    return appointment?.doctor?.user?.name ||
        appointment?.doctor?.name ||
        appointment?.doctorName ||
        "Doctor";
}


/* ---------- Department Report ---------- */

function renderDepartmentReport(
    departments,
    doctors,
    appointments
) {

    const container =
        document.querySelector(
            "#departmentReportBody"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        departments
            .map(
                department => {

                    const name =
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
                                    name
                                )
                        ).length;


                    const appointmentCount =
                        appointmentsForDepartment(
                            department,
                            appointments
                        );


                    return `

                        <tr>

                            <td>
                                ${HealSphereUtils.escapeHTML(
                                    name
                                )}
                            </td>

                            <td>
                                ${doctorCount}
                            </td>

                            <td>
                                ${appointmentCount}
                            </td>

                        </tr>

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


function getDepartmentName(
    department
) {

    return (
        department?.name ||
        department?.departmentName ||
        String(
            department || ""
        )
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


function appointmentsForDepartment(
    department,
    appointments
) {

    const departmentId =
        String(
            department?._id ||
            department?.id ||
            ""
        );


    return appointments.filter(
        appointment =>
            String(
                appointment?.department?._id ||
                appointment?.department?.id ||
                appointment?.department ||
                ""
            ) === departmentId
    ).length;
}