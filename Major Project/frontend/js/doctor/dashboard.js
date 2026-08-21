/* =========================================================
   HEALSPHERE - DOCTOR DASHBOARD
   Major Project
   ========================================================= */


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDoctorDashboard();

    }
);


/* ---------- Main Dashboard ---------- */

async function loadDoctorDashboard() {

    const cachedUser =
        HealSphereUtils.getCurrentUser();


    updateDoctorName(
        cachedUser
    );


    try {

        const [
            appointmentsData,
            patientsData,
            profileData
        ] = await Promise.all([

            HealSphereAPI.get(
                "/appointments/doctor"
            ),

            HealSphereAPI.get(
                "/patients/doctor"
            ),

            HealSphereAPI.get(
                "/doctors/me"
            )

        ]);


        /* ---------- Extract Data ---------- */

        const appointments =
            extractArray(
                appointmentsData,
                "appointments"
            );


        const patients =
            extractArray(
                patientsData,
                "patients"
            );


        const doctor =
            profileData?.doctor ||
            profileData?.data ||
            profileData;


        /* ---------- Doctor Information ---------- */

        if (doctor) {

            updateDoctorName(
                doctor
            );


            updateDoctorInformation(
                doctor
            );

        }


        /* ---------- Dashboard Statistics ---------- */

        updateDashboardStats(
            appointments,
            patients
        );


        /* ---------- Today's Schedule ---------- */

        renderTodayAppointments(
            appointments
        );


    } catch (error) {

        console.error(
            "Unable to load doctor dashboard:",
            error
        );


        /*
         * Keep the dashboard usable if the backend
         * temporarily fails.
         */

        updateDashboardStats(
            [],
            []
        );


        renderTodayAppointments(
            []
        );

    }

}


/* =========================================================
   DOCTOR INFORMATION
   ========================================================= */


/* ---------- Doctor Name ---------- */

function updateDoctorName(
    doctor
) {

    if (!doctor) {
        return;
    }


    /*
     * Depending on the backend response,
     * the name can either exist directly on
     * the doctor object or inside the populated
     * User document.
     */

    const user =
        doctor.user || {};


    const name =
        doctor.name ||
        doctor.fullName ||
        doctor.doctorName ||
        user.name ||
        "";


    if (!name) {
        return;
    }


    const displayName =
        String(name)
            .trim()
            .toLowerCase()
            .startsWith("dr.")
            ? String(name).trim()
            : `Dr. ${String(name).trim()}`;


    document
        .querySelectorAll(
            "#doctorName, " +
            "#doctorNavName, " +
            "#dashboardDoctorName, " +
            ".doctor-name"
        )
        .forEach(
            element => {

                element.textContent =
                    displayName;

            }
        );

}


/* ---------- Doctor Information Banner ---------- */

function updateDoctorInformation(
    doctor
) {

    const department =
        getDepartmentName(
            doctor.department
        );


    const availability =
        doctor.availability ||
        "";


    const consultationHours =
        extractConsultationHours(
            availability
        );


    setText(
        "#doctorDepartment",
        department ||
        "Not specified"
    );


    setText(
        "#doctorAvailability",
        availability ||
        "Not specified"
    );


    setText(
        "#doctorHours",
        consultationHours ||
        "Not specified"
    );

}


/* ---------- Department Name ---------- */

function getDepartmentName(
    department
) {

    if (!department) {
        return "";
    }


    if (
        typeof department ===
        "string"
    ) {

        return department;

    }


    return (
        department.name ||
        department.departmentName ||
        department.title ||
        ""
    );

}


/* ---------- Consultation Hours ---------- */

function extractConsultationHours(
    availability
) {

    if (!availability) {
        return "";
    }


    const value =
        String(
            availability
        ).trim();


    /*
     * Expected format from the Doctor model:
     *
     * Mon - Sat, 9:00 AM - 5:00 PM
     *
     * The first section represents days.
     * The remaining section represents hours.
     */

    if (
        value.includes(",")
    ) {

        const parts =
            value.split(",");


        if (
            parts.length > 1
        ) {

            return parts
                .slice(1)
                .join(",")
                .trim();

        }

    }


    /*
     * If only a time range was stored,
     * return the complete value.
     */

    if (
        /\d{1,2}:\d{2}/.test(
            value
        )
    ) {

        return value;

    }


    return "";

}


/* =========================================================
   STATISTICS
   ========================================================= */


/* ---------- Statistics ---------- */

function updateDashboardStats(
    appointments,
    patients
) {

    const today =
        appointments.filter(
            appointment =>

                isToday(
                    getAppointmentDate(
                        appointment
                    )
                ) &&

                !isCancelled(
                    appointment
                )
        );


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

                getAppointmentStatus(
                    appointment
                ) === "completed"
        );


    setText(
        "#todayAppointments",
        today.length
    );


    setText(
        "#upcomingAppointments",
        upcoming.length
    );


    setText(
        "#totalPatients",
        patients.length
    );


    setText(
        "#completedConsultations",
        completed.length
    );

}


/* =========================================================
   TODAY'S APPOINTMENTS
   ========================================================= */


/* ---------- Today's Appointments ---------- */

function renderTodayAppointments(
    appointments
) {

    /*
     * IMPORTANT:
     * dashboard.html uses #todaySchedule.
     */

    const container =
        document.querySelector(
            "#todaySchedule"
        );


    if (!container) {
        return;
    }


    const todayAppointments =
        appointments
            .filter(
                appointment =>

                    isToday(
                        getAppointmentDate(
                            appointment
                        )
                    ) &&

                    !isCancelled(
                        appointment
                    )
            )
            .sort(
                compareAppointments
            );


    if (
        todayAppointments.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">

                    <i class="fa-regular fa-calendar"></i>

                </div>


                <h3>
                    No Appointments Today
                </h3>


                <p>
                    You don't have any consultations scheduled for today.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        todayAppointments
            .map(
                createConsultationCard
            )
            .join("");

}


/* ---------- Consultation Card ---------- */

function createConsultationCard(
    appointment
) {

    const patient =
        getPatientName(
            appointment
        );


    const department =
        getDepartmentName(
            appointment.department
        );


    const dateValue =
        getAppointmentDate(
            appointment
        );


    const date =
        dateValue
            ? HealSphereUtils.formatDate(
                dateValue
            )
            : "";


    const time =
        getAppointmentTime(
            appointment
        );


    const status =
        getAppointmentStatusDisplay(
            appointment
        );


    const statusClass =
        String(status)
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );


    return `

        <article class="consultation-card">

            <div class="patient-summary">

                <div class="patient-avatar">

                    ${HealSphereUtils.escapeHTML(
                        getInitials(
                            patient
                        )
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
                            department
                        )}
                    </span>

                </div>

            </div>


            <div class="consultation-time">

                <strong>
                    ${HealSphereUtils.escapeHTML(
                        time
                    )}
                </strong>


                <span>
                    ${HealSphereUtils.escapeHTML(
                        date
                    )}
                </span>

            </div>


            <span
                class="status-badge ${statusClass}"
            >
                ${HealSphereUtils.escapeHTML(
                    status
                )}
            </span>

        </article>

    `;

}


/* =========================================================
   APPOINTMENT DATA HELPERS
   ========================================================= */


/* ---------- Appointment Date ---------- */

function getAppointmentDate(
    appointment
) {

    if (!appointment) {
        return "";
    }


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

    if (!appointment) {
        return "";
    }


    return (
        appointment.appointmentTime ||
        appointment.time ||
        ""
    );

}


/* ---------- Appointment Status ---------- */

function getAppointmentStatus(
    appointment
) {

    return String(
        appointment?.status ||
        "pending"
    )
        .trim()
        .toLowerCase();

}


/* ---------- Display Status ---------- */

function getAppointmentStatusDisplay(
    appointment
) {

    const status =
        getAppointmentStatus(
            appointment
        );


    return status
        .charAt(0)
        .toUpperCase() +
        status.slice(1);

}


/* ---------- Patient Name ---------- */

function getPatientName(
    appointment
) {

    if (!appointment) {
        return "Patient";
    }


    const patient =
        appointment.patient ||
        {};


    if (
        typeof patient ===
        "string"
    ) {

        return patient;

    }


    return (
        appointment.patientName ||
        patient.name ||
        patient.fullName ||
        patient.user?.name ||
        "Patient"
    );

}


/* ---------- Cancelled Check ---------- */

function isCancelled(
    appointment
) {

    return (
        getAppointmentStatus(
            appointment
        ) === "cancelled"
    );

}


/* =========================================================
   DATE / SORTING
   ========================================================= */


/* ---------- Is Today ---------- */

function isToday(
    dateValue
) {

    if (!dateValue) {
        return false;
    }


    const date =
        new Date(
            dateValue
        );


    const today =
        new Date();


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    return (

        date.getFullYear() ===
            today.getFullYear() &&

        date.getMonth() ===
            today.getMonth() &&

        date.getDate() ===
            today.getDate()

    );

}


/* ---------- Is Upcoming ---------- */

function isUpcoming(
    appointment
) {

    const dateValue =
        getAppointmentDate(
            appointment
        );


    if (!dateValue) {
        return false;
    }


    const status =
        getAppointmentStatus(
            appointment
        );


    if (
        status === "cancelled" ||
        status === "completed"
    ) {

        return false;

    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
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


    date.setHours(
        0,
        0,
        0,
        0
    );


    return date >= today;

}


/* ---------- Compare Appointments ---------- */

function compareAppointments(
    first,
    second
) {

    const firstDate =
        new Date(
            getAppointmentDate(
                first
            )
        );


    const secondDate =
        new Date(
            getAppointmentDate(
                second
            )
        );


    const dateDifference =
        firstDate -
        secondDate;


    if (
        dateDifference !== 0
    ) {

        return dateDifference;

    }


    return compareTimes(
        getAppointmentTime(first),
        getAppointmentTime(second)
    );

}


/* ---------- Compare Times ---------- */

function compareTimes(
    firstTime,
    secondTime
) {

    return (
        parseTime(
            firstTime
        ) -
        parseTime(
            secondTime
        )
    );

}


/* ---------- Parse Time ---------- */

function parseTime(
    value
) {

    if (!value) {
        return 0;
    }


    const match =
        String(value)
            .trim()
            .match(
                /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
            );


    if (!match) {
        return 0;
    }


    let hours =
        Number(
            match[1]
        );


    const minutes =
        Number(
            match[2]
        );


    const period =
        match[3]
            .toUpperCase();


    if (
        period === "PM" &&
        hours !== 12
    ) {

        hours += 12;

    }


    if (
        period === "AM" &&
        hours === 12
    ) {

        hours = 0;

    }


    return (
        hours * 60 +
        minutes
    );

}


/* =========================================================
   GENERAL HELPERS
   ========================================================= */


/* ---------- Extract Array ---------- */

function extractArray(
    data,
    property
) {

    if (
        Array.isArray(
            data
        )
    ) {

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


/* ---------- Initials ---------- */

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