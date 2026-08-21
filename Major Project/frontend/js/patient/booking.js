/* =========================================================
   HEALSPHERE - PATIENT APPOINTMENT BOOKING
   Major Project
   ========================================================= */


let doctors = [];

let departments = [];

let selectedDoctor = null;


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeBooking();

    }
);


/* ---------- Initialize ---------- */

async function initializeBooking() {

    const form =
        document.getElementById(
            "appointmentForm"
        );


    if (!form) {
        return;
    }


    setMinimumDate();

    attachBookingEvents();

    await loadDepartments();

}


/* ---------- Event Listeners ---------- */

function attachBookingEvents() {

    const departmentSelect =
        document.getElementById(
            "department"
        );


    const doctorSelect =
        document.getElementById(
            "doctor"
        );


    const form =
        document.getElementById(
            "appointmentForm"
        );


    /* ---------- Department Change ---------- */

    if (departmentSelect) {

        departmentSelect.addEventListener(
            "change",
            async () => {

                selectedDoctor =
                    null;


                const departmentId =
                    departmentSelect.value;


                await loadDoctorsByDepartment(
                    departmentId
                );

            }
        );

    }


    /* ---------- Doctor Change ---------- */

    if (doctorSelect) {

        doctorSelect.addEventListener(
            "change",
            () => {

                selectedDoctor =
                    doctors.find(
                        doctor =>
                            getDoctorId(
                                doctor
                            ) ===
                            doctorSelect.value
                    ) || null;

            }
        );

    }


    /* ---------- Form Submit ---------- */

    if (form) {

        form.addEventListener(
            "submit",
            handleAppointmentSubmit
        );

    }

}


/* ---------- Load Departments ---------- */

async function loadDepartments() {

    const departmentSelect =
        document.getElementById(
            "department"
        );


    if (!departmentSelect) {
        return;
    }


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
         * Only active departments should be
         * available for appointment booking.
         */

        departments =
            departments.filter(
                department =>
                    department?.isActive !== false
            );


        renderDepartments(
            departmentSelect
        );


    } catch (error) {

        console.error(
            "Unable to load departments:",
            error
        );


        HealSphereUtils.showToast(
            "Unable to load departments.",
            "error"
        );

    }

}


/* ---------- Render Departments ---------- */

function renderDepartments(
    select
) {

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
             * Display department name,
             * but use MongoDB ObjectId
             * as the actual select value.
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


/* ---------- Load Doctors By Department ---------- */

async function loadDoctorsByDepartment(
    departmentId
) {

    const doctorSelect =
        document.getElementById(
            "doctor"
        );


    if (!doctorSelect) {
        return;
    }


    doctors = [];

    selectedDoctor = null;


    /*
     * No department selected.
     */

    if (!departmentId) {

        renderDoctorOptions(
            []
        );

        return;

    }


    /*
     * Temporary loading state.
     */

    doctorSelect.innerHTML = `

        <option value="">
            Loading doctors...
        </option>

    `;


    try {

        const data =
            await HealSphereAPI.get(
                `/doctors/department/${encodeURIComponent(
                    departmentId
                )}`
            );


        doctors =
            extractArray(
                data,
                "doctors"
            );


        /*
         * Only available doctors should
         * be offered to patients.
         */

        doctors =
            doctors.filter(
                doctor =>
                    doctor?.isAvailable !== false
            );


        renderDoctorOptions(
            doctors
        );


    } catch (error) {

        console.error(
            "Unable to load doctors for department:",
            error
        );


        doctors = [];


        renderDoctorOptions(
            []
        );


        HealSphereUtils.showToast(
            error.message ||
            "Unable to load doctors for this department.",
            "error"
        );

    }

}


/* ---------- Render Doctors ---------- */

function renderDoctorOptions(
    doctorList
) {

    const doctorSelect =
        document.getElementById(
            "doctor"
        );


    if (!doctorSelect) {
        return;
    }


    doctorSelect.innerHTML = `

        <option value="">
            Select Doctor
        </option>

    `;


    doctorList.forEach(
        doctor => {

            const id =
                getDoctorId(
                    doctor
                );


            const name =
                getDoctorName(
                    doctor
                );


            if (!id || !name) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            /*
             * Doctor ObjectId is used as
             * the option value.
             */

            option.value =
                id;


            option.textContent =
                name;


            doctorSelect.appendChild(
                option
            );

        }
    );


    /*
     * No active doctors available.
     */

    if (
        doctorList.length === 0
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            "No doctors available";


        option.disabled =
            true;


        doctorSelect.appendChild(
            option
        );

    }

}


/* ---------- Submit Appointment ---------- */

async function handleAppointmentSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const patientName =
        document.getElementById(
            "patientName"
        )?.value.trim();


    const email =
        document.getElementById(
            "patientEmail"
        )?.value.trim();


    const phone =
        document.getElementById(
            "patientPhone"
        )?.value.trim();


    /*
     * MongoDB Department ObjectId.
     */

    const departmentId =
        document.getElementById(
            "department"
        )?.value;


    /*
     * MongoDB Doctor ObjectId.
     */

    const doctorId =
        document.getElementById(
            "doctor"
        )?.value;


    const date =
        document.getElementById(
            "appointmentDate"
        )?.value;


    const time =
        document.getElementById(
            "appointmentTime"
        )?.value;


    const reasonField =
        document.querySelector(
            "#reason, #message, textarea[name='reason'], textarea[name='message']"
        );


    const reason =
        reasonField?.value.trim() ||
        "";


    /* ---------- Required Validation ---------- */

    if (
        !patientName ||
        !email ||
        !phone ||
        !departmentId ||
        !doctorId ||
        !date ||
        !time ||
        !reason
    ) {

        HealSphereUtils.showToast(
            "Please complete all appointment fields.",
            "error"
        );

        return;

    }


    /* ---------- Email Validation ---------- */

    if (
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


    /* ---------- Phone Validation ---------- */

    if (
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


    /* =====================================================
       VERIFY SELECTED DOCTOR
       ===================================================== */

    const doctor =
        doctors.find(
            item =>
                getDoctorId(
                    item
                ) ===
                String(
                    doctorId
                )
        );


    if (!doctor) {

        HealSphereUtils.showToast(
            "Please select a valid doctor.",
            "error"
        );

        return;

    }


    /* =====================================================
       VERIFY DOCTOR + DEPARTMENT MATCH
       ===================================================== */

    const doctorDepartmentId =
        getDoctorDepartmentId(
            doctor
        );


    if (
        doctorDepartmentId &&
        String(
            doctorDepartmentId
        ) !==
        String(
            departmentId
        )
    ) {

        HealSphereUtils.showToast(
            "The selected doctor does not belong to the selected department.",
            "error"
        );


        document.getElementById(
            "doctor"
        ).value = "";


        selectedDoctor =
            null;


        return;

    }


    /* ---------- Date Validation ---------- */

    if (
        isPastDate(
            date
        )
    ) {

        HealSphereUtils.showToast(
            "Please select today or a future date.",
            "error"
        );

        return;

    }


    /* ---------- Submit Button ---------- */

    const submitButton =
        form.querySelector(
            "button[type='submit']"
        );


    HealSphereUtils.setButtonLoading(
        submitButton,
        true,
        "Booking..."
    );


    try {

        /*
         * Find the department object so we
         * can retain its name for fallback
         * confirmation display.
         */

        const department =
            departments.find(
                item =>
                    String(
                        getDepartmentId(
                            item
                        )
                    ) ===
                    String(
                        departmentId
                    )
            );


        const departmentName =
            getDepartmentName(
                department
            );


        /*
         * Send the IDs required by the backend.
         *
         * patient is determined from the
         * authenticated user on the backend.
         */

        const appointmentData = {

            patientName,

            email,

            phone,

            department:
                departmentId,

            doctorId,

            date,

            time,

            reason

        };


        const data =
            await HealSphereAPI.post(
                "/appointments",
                appointmentData
            );


        /*
         * Backend returns the actual populated
         * Appointment document.
         *
         * Pass that directly to the summary.
         *
         * If for some reason the backend doesn't
         * return it, use a frontend fallback object.
         */

        showAppointmentSummary(

            data?.appointment ||

            {

                doctor: doctor,

                department:
                    departmentName,

                appointmentDate:
                    date,

                appointmentTime:
                    time

            }

        );


        HealSphereUtils.showToast(
            data?.message ||
            "Appointment booked successfully!",
            "success"
        );


        form.reset();


        selectedDoctor =
            null;


        doctors = [];


        /*
         * Reset doctor dropdown after booking.
         */

        renderDoctorOptions(
            []
        );


    } catch (error) {

        console.error(
            "Unable to book appointment:",
            error
        );


        HealSphereUtils.showToast(
            error.message ||
            "Unable to book the appointment.",
            "error"
        );

    } finally {

        HealSphereUtils.setButtonLoading(
            submitButton,
            false
        );

    }

}


/* ---------- Appointment Summary ---------- */

function showAppointmentSummary(
    appointment
) {

    const summary =
        document.getElementById(
            "appointmentSummary"
        );


    const container =
        document.getElementById(
            "summaryContainer"
        );


    if (
        !summary ||
        !container
    ) {

        return;

    }


    /* =====================================================
       DOCTOR NAME
       ===================================================== */

    /*
     * Backend returns:
     *
     * appointment.doctor
     *     -> populated Doctor object
     *
     * Doctor.user
     *     -> populated User object
     *
     * Therefore getDoctorName() handles:
     *
     * doctor.name
     * doctor.fullName
     * doctor.doctorName
     * doctor.user.name
     */

    const doctorName =
        getDoctorName(
            appointment.doctor
        ) ||
        appointment.doctorName ||
        (
            typeof appointment.doctor ===
            "string"
                ? appointment.doctor
                : ""
        ) ||
        "Doctor";


    /* =====================================================
       DEPARTMENT NAME
       ===================================================== */

    /*
     * Backend returns:
     *
     * appointment.department
     *     -> populated Department object
     */

    const departmentName =
        getDepartmentName(
            appointment.department
        ) ||
        appointment.departmentName ||
        (
            typeof appointment.department ===
            "string"
                ? appointment.department
                : ""
        ) ||
        "";


    /* =====================================================
       DATE
       ===================================================== */

    const rawDate =
        appointment.appointmentDate ||
        appointment.date ||
        "";


    const formattedDate =
        rawDate
            ? HealSphereUtils.formatDate(
                rawDate
            )
            : "";


    /* =====================================================
       TIME
       ===================================================== */

    const appointmentTime =
        appointment.appointmentTime ||
        appointment.time ||
        "";


    /* ---------- Display Summary ---------- */

    summary.style.display =
        "block";


    container.innerHTML = `

        <div class="summary-card">

            <h3>
                Appointment Confirmed
            </h3>


            <p>

                <strong>
                    Doctor:
                </strong>

                ${HealSphereUtils.escapeHTML(
                    doctorName
                )}

            </p>


            <p>

                <strong>
                    Department:
                </strong>

                ${HealSphereUtils.escapeHTML(
                    departmentName
                )}

            </p>


            <p>

                <strong>
                    Date:
                </strong>

                ${HealSphereUtils.escapeHTML(
                    formattedDate
                )}

            </p>


            <p>

                <strong>
                    Time:
                </strong>

                ${HealSphereUtils.escapeHTML(
                    appointmentTime
                )}

            </p>

        </div>

    `;


    summary.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


/* ---------- Minimum Date ---------- */

function setMinimumDate() {

    const dateInput =
        document.getElementById(
            "appointmentDate"
        );


    if (!dateInput) {
        return;
    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    dateInput.min =
        `${year}-${month}-${day}`;

}


/* ---------- Past Date ---------- */

function isPastDate(
    dateString
) {

    const selected =
        new Date(
            dateString
        );


    const today =
        new Date();


    selected.setHours(
        0,
        0,
        0,
        0
    );


    today.setHours(
        0,
        0,
        0,
        0
    );


    return (
        selected <
        today
    );

}


/* ---------- Generic Array Helper ---------- */

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


/* ---------- Doctor ID ---------- */

function getDoctorId(
    doctor
) {

    return String(

        doctor?.id ||

        doctor?._id ||

        doctor?.doctorId ||

        ""

    );

}


/* ---------- Doctor Name ---------- */

function getDoctorName(
    doctor
) {

    if (!doctor) {
        return "";
    }


    /*
     * Direct doctor name.
     */

    if (
        typeof doctor ===
        "string"
    ) {

        return doctor;

    }


    /*
     * Normal Doctor object.
     */

    return (

        doctor?.name ||

        doctor?.fullName ||

        doctor?.doctorName ||

        /*
         * Populated User object.
         */

        doctor?.user?.name ||

        ""

    );

}


/* ---------- Doctor Department ID ---------- */

function getDoctorDepartmentId(
    doctor
) {

    if (
        !doctor?.department
    ) {

        return "";

    }


    /*
     * Populated Department object.
     */

    if (
        typeof doctor.department ===
        "object"
    ) {

        return (

            doctor.department?._id ||

            doctor.department?.id ||

            ""

        );

    }


    /*
     * Department may already be
     * returned as an ObjectId string.
     */

    return String(
        doctor.department
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

    if (!department) {
        return "";
    }


    /*
     * If department is already a string,
     * use it directly.
     */

    if (
        typeof department ===
        "string"
    ) {

        return department;

    }


    return (

        department.name ||

        department.departmentName ||

        ""

    );

}