// =========================
// HEALSPHERE ADMIN DASHBOARD
// =========================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Task 3 app.js loaded.");

    // =========================
    // MOBILE SIDEBAR
    // =========================

    const menuToggle = document.querySelector("#menuToggle");
    const sidebar = document.querySelector("#sidebar");

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", function () {
            sidebar.classList.toggle("show");
        });

    }


    // =========================
    // DASHBOARD STATISTICS
    // =========================

    const totalDoctors = document.querySelector("#totalDoctors");
    const totalPatients = document.querySelector("#totalPatients");
    const totalAppointments = document.querySelector("#totalAppointments");
    const totalDepartments = document.querySelector("#totalDepartments");

    const pendingAppointments =
        document.querySelector("#pendingAppointments");

    const confirmedAppointments =
        document.querySelector("#confirmedAppointments");

    const completedAppointments =
        document.querySelector("#completedAppointments");

    const cancelledAppointments =
        document.querySelector("#cancelledAppointments");


    // =========================
    // GET DATA FROM LOCAL STORAGE
    // =========================

    const doctors =
        JSON.parse(localStorage.getItem("healSphereDoctors")) || [];

    const patients =
        JSON.parse(localStorage.getItem("healSpherePatients")) || [];

    const appointments =
        JSON.parse(localStorage.getItem("healSphereAppointments")) || [];

    const departments =
        JSON.parse(localStorage.getItem("healSphereDepartments")) || [];


    // =========================
    // DISPLAY TOTALS
    // =========================

    if (totalDoctors) {
        totalDoctors.textContent = doctors.length;
    }

    if (totalPatients) {
        totalPatients.textContent = patients.length;
    }

    if (totalAppointments) {
        totalAppointments.textContent = appointments.length;
    }

    if (totalDepartments) {
        totalDepartments.textContent = departments.length;
    }


    // =========================
    // APPOINTMENT STATUS COUNTS
    // =========================

    let pending = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;


    appointments.forEach(function (appointment) {

        const status = appointment.status || "Pending";

        if (status === "Pending") {
            pending++;
        }

        else if (status === "Confirmed") {
            confirmed++;
        }

        else if (status === "Completed") {
            completed++;
        }

        else if (status === "Cancelled") {
            cancelled++;
        }

    });


    if (pendingAppointments) {
        pendingAppointments.textContent = pending;
    }

    if (confirmedAppointments) {
        confirmedAppointments.textContent = confirmed;
    }

    if (completedAppointments) {
        completedAppointments.textContent = completed;
    }

    if (cancelledAppointments) {
        cancelledAppointments.textContent = cancelled;
    }


    // =========================
    // DEPARTMENT STATISTICS
    // =========================

    const departmentStats =
        document.querySelector("#departmentStats");


    if (departmentStats) {

        departmentStats.innerHTML = "";


        departments.forEach(function (department) {

            const doctorCount =
                doctors.filter(function (doctor) {
                    return doctor.department === department.name;
                }).length;


            const item = document.createElement("div");

            item.classList.add("department-stat-item");


            item.innerHTML = `
                <div>
                    <strong>${department.name}</strong>
                    <small>${department.description}</small>
                </div>

                <span>
                    ${doctorCount} Doctor${doctorCount !== 1 ? "s" : ""}
                </span>
            `;


            departmentStats.appendChild(item);

        });

    }

});