// =========================
// APPOINTMENT MANAGEMENT
// =========================

document.addEventListener("DOMContentLoaded", function () {

    console.log("appointments.js loaded.");


    // =========================
    // LOCAL STORAGE
    // =========================

    let appointments =
        JSON.parse(
            localStorage.getItem("healSphereAppointments")
        ) || [];

    // =========================
// SAMPLE APPOINTMENTS
// =========================

const sampleAppointments = [

    {
        id: "APT001",
        patientName: "Rahul Sharma",
        email: "rahul.sharma@gmail.com",
        phone: "9876543210",
        doctor: "Dr. Satish Koul",
        date: "2026-08-20",
        time: "10:00 AM",
        status: "Confirmed",
        message: "Follow-up consultation for kidney health."
    },

    {
        id: "APT002",
        patientName: "Sneha Verma",
        email: "sneha.verma@gmail.com",
        phone: "9123456780",
        doctor: "Dr. Kamna Bakshi",
        date: "2026-08-22",
        time: "11:30 AM",
        status: "Pending",
        message: "Routine health check-up and consultation."
    },

    {
        id: "APT003",
        patientName: "Arjun Kapoor",
        email: "arjun.kapoor@gmail.com",
        phone: "9988776655",
        doctor: "Dr. Dinesh Rauthan",
        date: "2026-08-10",
        time: "03:00 PM",
        status: "Completed",
        message: "General consultation and preventive health check."
    }

];

sampleAppointments.forEach(function (sample) {

    const exists = appointments.some(function (appointment) {
        return appointment.id === sample.id;
    });

    if (!exists) {
        appointments.push(sample);
    }

});

localStorage.setItem(
    "healSphereAppointments",
    JSON.stringify(appointments)
);

    // Add default status to old Task 2 appointments

    appointments.forEach(function (appointment) {

        if (!appointment.status) {
            appointment.status = "Pending";
        }

    });


    localStorage.setItem(
        "healSphereAppointments",
        JSON.stringify(appointments)
    );


    // =========================
    // ELEMENTS
    // =========================

    const appointmentTableBody =
        document.querySelector("#appointmentTableBody");

    const appointmentSearch =
        document.querySelector("#appointmentSearch");

    const statusFilter =
        document.querySelector("#statusFilter");

    const noAppointments =
        document.querySelector("#noAppointments");

    const appointmentDetails =
        document.querySelector("#appointmentDetails");

    const appointmentDetailsContent =
        document.querySelector("#appointmentDetailsContent");

    const closeAppointmentDetails =
        document.querySelector("#closeAppointmentDetails");


    // =========================
    // DISPLAY APPOINTMENTS
    // =========================

    function displayAppointments() {

        appointmentTableBody.innerHTML = "";


        const search =
            appointmentSearch.value.toLowerCase().trim();

        const selectedStatus =
            statusFilter.value;


        const filteredAppointments =
            appointments.filter(function (appointment) {

                const patientName =
                    (appointment.patientName || "")
                    .toLowerCase();

                const doctorName =
                    (appointment.doctor || "")
                    .toLowerCase();


                const matchesSearch =
                    patientName.includes(search) ||
                    doctorName.includes(search);


                const matchesStatus =
                    !selectedStatus ||
                    appointment.status === selectedStatus;


                return matchesSearch && matchesStatus;

            });


        if (filteredAppointments.length === 0) {

            noAppointments.classList.remove("hidden");

            return;

        }


        noAppointments.classList.add("hidden");


        filteredAppointments.forEach(function (appointment) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${appointment.patientName || "N/A"}
                </td>

                <td>
                    ${appointment.doctor || "N/A"}
                </td>

                <td>
                    ${appointment.date || "N/A"}
                </td>

                <td>
                    ${appointment.time || "N/A"}
                </td>

                <td>
                    ${appointment.phone || "N/A"}
                </td>

                <td>

                    <span class="status-badge ${appointment.status.toLowerCase()}">
                        ${appointment.status}
                    </span>

                </td>

                <td>

                    <button
                        class="table-btn view-btn"
                        data-id="${appointment.id}"
                    >
                        View
                    </button>


                    <button
                        class="table-btn status-btn"
                        data-id="${appointment.id}"
                    >
                        Update
                    </button>


                    <button
                        class="table-btn delete-btn"
                        data-id="${appointment.id}"
                    >
                        Delete
                    </button>

                </td>

            `;


            appointmentTableBody.appendChild(row);

        });

    }


    // =========================
    // VIEW APPOINTMENT
    // =========================

    function showAppointmentDetails(id) {

        const appointment =
            appointments.find(function (item) {

                return String(item.id) === String(id);

            });


        if (!appointment) {
            return;
        }


        appointmentDetailsContent.innerHTML = `

            <div class="detail-item">
                <strong>Patient Name</strong>
                <span>${appointment.patientName || "N/A"}</span>
            </div>

            <div class="detail-item">
                <strong>Email</strong>
                <span>${appointment.email || "N/A"}</span>
            </div>

            <div class="detail-item">
                <strong>Phone</strong>
                <span>${appointment.phone || "N/A"}</span>
            </div>

            <div class="detail-item">
                <strong>Doctor</strong>
                <span>${appointment.doctor || "N/A"}</span>
            </div>

            <div class="detail-item">
                <strong>Date</strong>
                <span>${appointment.date || "N/A"}</span>
            </div>

            <div class="detail-item">
                <strong>Time</strong>
                <span>${appointment.time || "N/A"}</span>
            </div>

            <div class="detail-item">
                <strong>Status</strong>
                <span>${appointment.status}</span>
            </div>

            <div class="detail-item">
                <strong>Message</strong>
                <span>${appointment.message || "N/A"}</span>
            </div>

        `;


        appointmentDetails.classList.remove("hidden");

    }


    // =========================
    // UPDATE STATUS
    // =========================

    function updateAppointmentStatus(id) {

        const appointment =
            appointments.find(function (item) {

                return String(item.id) === String(id);

            });


        if (!appointment) {
            return;
        }


        const newStatus =
            prompt(
                "Enter status: Pending, Confirmed, Completed or Cancelled",
                appointment.status
            );


        if (!newStatus) {
            return;
        }


        const validStatuses = [

            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled"

        ];


        if (!validStatuses.includes(newStatus)) {

            alert(
                "Invalid status. Please use Pending, Confirmed, Completed or Cancelled."
            );

            return;

        }


        appointment.status = newStatus;


        localStorage.setItem(
            "healSphereAppointments",
            JSON.stringify(appointments)
        );


        displayAppointments();

    }


    // =========================
    // DELETE APPOINTMENT
    // =========================

    function deleteAppointment(id) {

        const confirmDelete =
            confirm(
                "Are you sure you want to delete this appointment?"
            );


        if (!confirmDelete) {
            return;
        }


        appointments =
            appointments.filter(function (appointment) {

                return String(appointment.id) !== String(id);

            });


        localStorage.setItem(
            "healSphereAppointments",
            JSON.stringify(appointments)
        );


        displayAppointments();

    }


    // =========================
    // BUTTON EVENTS
    // =========================

    appointmentTableBody.addEventListener(
        "click",
        function (event) {

            const id =
                event.target.dataset.id;


            if (!id) {
                return;
            }


            if (
                event.target.classList.contains("view-btn")
            ) {

                showAppointmentDetails(id);

            }


            else if (
                event.target.classList.contains("status-btn")
            ) {

                updateAppointmentStatus(id);

            }


            else if (
                event.target.classList.contains("delete-btn")
            ) {

                deleteAppointment(id);

            }

        }
    );


    // =========================
    // SEARCH
    // =========================

    appointmentSearch.addEventListener(
        "input",
        displayAppointments
    );


    // =========================
    // FILTER
    // =========================

    statusFilter.addEventListener(
        "change",
        displayAppointments
    );


    // =========================
    // CLOSE DETAILS
    // =========================

    if (closeAppointmentDetails) {

        closeAppointmentDetails.addEventListener(
            "click",
            function () {

                appointmentDetails.classList.add("hidden");

            }
        );

    }


    // =========================
    // INITIAL DISPLAY
    // =========================

    displayAppointments();

});