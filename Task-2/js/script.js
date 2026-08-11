console.log("TASK 2 JS FILE LOADED");

document.addEventListener("DOMContentLoaded", function () {

    console.log("TASK 2 DOM LOADED");


    // =========================
    // MOBILE MENU
    // =========================

    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");

    menuToggle.addEventListener("click", function () {

        if (navMenu.style.display === "flex") {
            navMenu.style.display = "none";
        } else {
            navMenu.style.display = "flex";
        }

    });


    // =========================
    // DOCTOR SEARCH & FILTER
    // =========================

    const doctorSearch = document.querySelector("#doctorSearch");
    const departmentFilter = document.querySelector("#departmentFilter");

    const doctorCards = document.querySelectorAll(".doctor-card");
    const noDoctors = document.querySelector("#noDoctors");


    function filterDoctors() {

        const searchText = doctorSearch.value.toLowerCase().trim();
        const selectedDepartment = departmentFilter.value;

        let visibleDoctors = 0;


        doctorCards.forEach(function (card) {

            const doctorName =
                card.getAttribute("data-name").toLowerCase();

            const department =
                card.getAttribute("data-department");


            const nameMatches =
                doctorName.includes(searchText);

            const departmentMatches =
                selectedDepartment === "" ||
                department === selectedDepartment;


            if (nameMatches && departmentMatches) {

                card.style.display = "flex";
                visibleDoctors++;

            } else {

                card.style.display = "none";

            }

        });


        if (visibleDoctors === 0) {

            noDoctors.style.display = "block";

        } else {

            noDoctors.style.display = "none";

        }

    }


    doctorSearch.addEventListener("input", filterDoctors);

    departmentFilter.addEventListener("change", filterDoctors);


    // =========================
    // DOCTOR PROFILES
    // =========================

    const doctorButtons =
        document.querySelectorAll(".doctor-btn");

    const profileContainer =
        document.querySelector("#profileContainer");


    const doctorDetails = {

        "Dr. Sunaina Sharma": {
            department: "Cardiology",
            qualification: "MBBS, MD",
            experience: "15+ Years Experience",
            fee: "₹800",
            availability: "Monday - Friday",
            description:
                "Dr. Sunaina Sharma specializes in comprehensive heart care, diagnosis, and treatment of cardiovascular conditions."
        },

        "Dr. Shiva Reddy": {
            department: "Neurology",
            qualification: "MBBS, DM",
            experience: "12+ Years Experience",
            fee: "₹900",
            availability: "Monday - Saturday",
            description:
                "Dr. Shiva Reddy provides expert diagnosis and treatment for brain and nervous system disorders."
        },

        "Dr. Komal Bhatia": {
            department: "ENT",
            qualification: "MBBS, MS",
            experience: "11+ Years Experience",
            fee: "₹700",
            availability: "Tuesday - Saturday",
            description:
                "Dr. Komal Bhatia provides specialized treatment for ear, nose, and throat related conditions."
        },

        "Dr. Satish Koul": {
            department: "Nephrology",
            qualification: "MBBS, DM",
            experience: "16+ Years Experience",
            fee: "₹850",
            availability: "Monday - Friday",
            description:
                "Dr. Satish Koul specializes in kidney care, diagnosis, and treatment of renal conditions."
        },

        "Dr. Dinesh Rauthan": {
            department: "Pediatrics",
            qualification: "MBBS, MD",
            experience: "13+ Years Experience",
            fee: "₹650",
            availability: "Monday - Saturday",
            description:
                "Dr. Dinesh Rauthan provides comprehensive healthcare services for children and adolescents."
        },

        "Dr. Kamna Bakshi": {
            department: "Gynecology",
            qualification: "MBBS, MS",
            experience: "14+ Years Experience",
            fee: "₹750",
            availability: "Monday - Friday",
            description:
                "Dr. Kamna Bakshi provides preventive, diagnostic, and specialized women's healthcare."
        }

    };


    doctorButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const doctorName =
                button.getAttribute("data-doctor");

            const doctor =
                doctorDetails[doctorName];


            profileContainer.innerHTML = `

                <div class="profile-card">

                    <h3>${doctorName}</h3>

                    <p>
                        <strong>Department:</strong>
                        ${doctor.department}
                    </p>

                    <p>
                        <strong>Qualification:</strong>
                        ${doctor.qualification}
                    </p>

                    <p>
                        <strong>Experience:</strong>
                        ${doctor.experience}
                    </p>

                    <p>
                        <strong>Consultation Fee:</strong>
                        ${doctor.fee}
                    </p>

                    <p>
                        <strong>Availability:</strong>
                        ${doctor.availability}
                    </p>

                    <p class="profile-description">
                        ${doctor.description}
                    </p>

                    <button
                        class="profile-book-btn"
                        data-doctor="${doctorName}"
                    >
                        Book Appointment
                    </button>

                </div>

            `;


            // Scroll to profile

            document.querySelector("#doctorProfile").scrollIntoView({
                behavior: "smooth"
            });


            // Add booking event to newly created button

            const profileBookButton =
                document.querySelector(".profile-book-btn");

            profileBookButton.addEventListener(
                "click",
                function () {

                    document.querySelector("#doctorSelect").value =
                        doctorName;

                    document.querySelector("#booking").scrollIntoView({
                        behavior: "smooth"
                    });

                }
            );

        });

    });


    // =========================
    // DATE VALIDATION
    // =========================

    const appointmentDate =
        document.querySelector("#appointmentDate");


    // Prevent selecting a date in the past

    const today = new Date();

    const year = today.getFullYear();

    const month =
        String(today.getMonth() + 1).padStart(2, "0");

    const day =
        String(today.getDate()).padStart(2, "0");

    const todayDate =
        `${year}-${month}-${day}`;

    appointmentDate.min = todayDate;


    // =========================
    // TIME SLOT SELECTION
    // =========================

    const timeSlots =
        document.querySelectorAll(".time-slot");

    const selectedTime =
        document.querySelector("#selectedTime");


    timeSlots.forEach(function (slot) {

        slot.addEventListener("click", function () {

            // Remove selection from all slots

            timeSlots.forEach(function (item) {
                item.classList.remove("selected");
            });


            // Select clicked slot

            slot.classList.add("selected");

            selectedTime.value =
                slot.getAttribute("data-time");

        });

    });


    // =========================
    // APPOINTMENT FORM
    // =========================

    const bookingForm =
        document.querySelector("#bookingForm");


    bookingForm.addEventListener("submit", function (event) {

        event.preventDefault();


        // Get form values

        const patientName =
            document.querySelector("#patientName").value.trim();

        const patientEmail =
            document.querySelector("#patientEmail").value.trim();

        const patientPhone =
            document.querySelector("#patientPhone").value.trim();

        const doctor =
            document.querySelector("#doctorSelect").value;

        const date =
            document.querySelector("#appointmentDate").value;

        const time =
            selectedTime.value;

        const message =
            document.querySelector("#appointmentMessage").value.trim();


        // =========================
        // VALIDATION
        // =========================


        // Patient name

        if (patientName.length < 3) {

            alert("Please enter a valid patient name.");

            return;

        }


        // Phone number

        if (!/^[0-9]{10}$/.test(patientPhone)) {

            alert(
                "Please enter a valid 10-digit phone number."
            );

            return;

        }


        // Email

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {

            alert("Please enter a valid email address.");

            return;

        }


        // Doctor

        if (doctor === "") {

            alert("Please select a doctor.");

            return;

        }


        // Date

        if (date === "") {

            alert("Please select an appointment date.");

            return;

        }


        // Prevent past date

        if (date < todayDate) {

            alert(
                "Please select today or a future date."
            );

            return;

        }


        // Time

        if (time === "") {

            alert("Please select a time slot.");

            return;

        }


        // Message

        if (message.length < 10) {

            alert(
                "Please enter at least 10 characters describing your reason for the visit."
            );

            return;

        }


        // =========================
        // CREATE APPOINTMENT OBJECT
        // =========================

        const appointment = {

            patientName: patientName,

            email: patientEmail,

            phone: patientPhone,

            doctor: doctor,

            date: date,

            time: time,

            message: message

        };


        // =========================
        // SAVE APPOINTMENT
        // =========================

        let appointments =
            JSON.parse(
                localStorage.getItem("healSphereAppointments")
            ) || [];


        appointments.push(appointment);


        localStorage.setItem(
            "healSphereAppointments",
            JSON.stringify(appointments)
        );


        // =========================
        // SHOW SUMMARY
        // =========================

        showAppointmentSummary(appointment);


        // Update history

        displayAppointmentHistory();


        // Success message

        alert(
            "Your appointment has been booked successfully!"
        );


        // Reset form

        bookingForm.reset();


        // Remove selected time

        timeSlots.forEach(function (slot) {

            slot.classList.remove("selected");

        });

        selectedTime.value = "";


        // Scroll to summary

        document
            .querySelector("#appointmentSummary")
            .scrollIntoView({
                behavior: "smooth"
            });

    });


    // =========================
    // APPOINTMENT SUMMARY
    // =========================

    function showAppointmentSummary(appointment) {

        const summaryContainer =
            document.querySelector("#summaryContainer");


        summaryContainer.innerHTML = `

            <div class="summary-card">

                <h3>
                    Appointment Confirmed
                </h3>

                <p>
                    <strong>Patient:</strong>
                    ${appointment.patientName}
                </p>

                <p>
                    <strong>Doctor:</strong>
                    ${appointment.doctor}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${appointment.date}
                </p>

                <p>
                    <strong>Time:</strong>
                    ${appointment.time}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${appointment.phone}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${appointment.email}
                </p>

                <p>
                    <strong>Reason:</strong>
                    ${appointment.message}
                </p>

            </div>

        `;

    }


    // =========================
    // APPOINTMENT HISTORY
    // =========================

    function displayAppointmentHistory() {

        const historyContainer =
            document.querySelector("#historyContainer");


        const appointments =
            JSON.parse(
                localStorage.getItem("healSphereAppointments")
            ) || [];


        // No appointments

        if (appointments.length === 0) {

            historyContainer.innerHTML = `

                <p class="empty-history">
                    No appointments booked yet.
                </p>

            `;

            return;

        }


        // Clear old history

        historyContainer.innerHTML = "";


        // Display appointments

        appointments.forEach(function (appointment, index) {

            const historyCard =
                document.createElement("div");

            historyCard.classList.add("history-card");


            historyCard.innerHTML = `

                <h3>
                    Appointment ${index + 1}
                </h3>

                <p>
                    <strong>Patient:</strong>
                    ${appointment.patientName}
                </p>

                <p>
                    <strong>Doctor:</strong>
                    ${appointment.doctor}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${appointment.date}
                </p>

                <p>
                    <strong>Time:</strong>
                    ${appointment.time}
                </p>

                <p>
                    <strong>Reason:</strong>
                    ${appointment.message}
                </p>

            `;


            historyContainer.appendChild(historyCard);

        });

    }


    // =========================
    // LOAD APPOINTMENT HISTORY
    // =========================

    displayAppointmentHistory();


    // =========================
    // NAVIGATION TO BOOKING
    // =========================

    const homeButton =
        document.querySelector(".home-btn");

    homeButton.addEventListener("click", function () {

        console.log("Returning to HealSphere landing page.");

    });


});