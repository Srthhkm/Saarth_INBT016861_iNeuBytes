// =========================
// PATIENT MANAGEMENT
// =========================

document.addEventListener("DOMContentLoaded", function () {

    console.log("patients.js loaded.");


    // =========================
    // LOCAL STORAGE
    // =========================

    let patients =
        JSON.parse(localStorage.getItem("healSpherePatients")) || [];


    // =========================
    // ELEMENTS
    // =========================

    const patientTableBody =
        document.querySelector("#patientTableBody");

    const patientSearch =
        document.querySelector("#patientSearch");

    const noPatients =
        document.querySelector("#noPatients");

    const showPatientForm =
        document.querySelector("#showPatientForm");

    const patientFormContainer =
        document.querySelector("#patientFormContainer");

    const patientForm =
        document.querySelector("#patientForm");

    const cancelPatientForm =
        document.querySelector("#cancelPatientForm");

    const patientFormTitle =
        document.querySelector("#patientFormTitle");

    const patientId =
        document.querySelector("#patientId");

    const patientName =
        document.querySelector("#patientName");

    const patientEmail =
        document.querySelector("#patientEmail");

    const patientPhone =
        document.querySelector("#patientPhone");

    const patientAge =
        document.querySelector("#patientAge");

    const patientGender =
        document.querySelector("#patientGender");

    const patientDepartment =
        document.querySelector("#patientDepartment");


    // =========================
    // DISPLAY PATIENTS
    // =========================

    function displayPatients(searchText = "") {

        patientTableBody.innerHTML = "";


        const search =
            searchText.toLowerCase().trim();


        const filteredPatients =
            patients.filter(function (patient) {

                return (

                    patient.name.toLowerCase().includes(search) ||

                    patient.email.toLowerCase().includes(search) ||

                    patient.phone.toLowerCase().includes(search)

                );

            });


        if (filteredPatients.length === 0) {

            noPatients.classList.remove("hidden");

            return;

        }


        noPatients.classList.add("hidden");


        filteredPatients.forEach(function (patient) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${patient.name}</td>

                <td>${patient.email}</td>

                <td>${patient.phone}</td>

                <td>${patient.age}</td>

                <td>${patient.gender}</td>

                <td>${patient.department}</td>

                <td>

                    <button
                        class="table-btn edit-btn"
                        data-id="${patient.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="table-btn delete-btn"
                        data-id="${patient.id}"
                    >
                        Delete
                    </button>

                </td>

            `;


            patientTableBody.appendChild(row);

        });

    }


    // =========================
    // SHOW FORM
    // =========================

    showPatientForm.addEventListener("click", function () {

        patientForm.reset();

        patientId.value = "";

        patientFormTitle.textContent =
            "Add Patient";

        patientFormContainer.classList.remove("hidden");

    });


    // =========================
    // CANCEL
    // =========================

    cancelPatientForm.addEventListener("click", function () {

        patientForm.reset();

        patientId.value = "";

        patientFormContainer.classList.add("hidden");

    });


    // =========================
    // ADD / EDIT PATIENT
    // =========================

    patientForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const name =
            patientName.value.trim();

        const email =
            patientEmail.value.trim();

        const phone =
            patientPhone.value.trim();

        const age =
            Number(patientAge.value);

        const gender =
            patientGender.value;

        const department =
            patientDepartment.value;


        // =========================
        // VALIDATION
        // =========================

        if (name.length < 3) {

            alert("Please enter a valid patient name.");

            return;

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(email)) {

            alert("Please enter a valid email address.");

            return;

        }


        const phonePattern =
            /^[0-9]{10}$/;


        if (!phonePattern.test(phone)) {

            alert("Please enter a valid 10-digit phone number.");

            return;

        }


        if (!age || age <= 0) {

            alert("Please enter a valid age.");

            return;

        }


        if (!gender) {

            alert("Please select gender.");

            return;

        }


        if (!department) {

            alert("Please select a department.");

            return;

        }


        // =========================
        // EDIT
        // =========================

        if (patientId.value) {

            const id =
                Number(patientId.value);


            const patient =
                patients.find(function (item) {
                    return item.id === id;
                });


            if (patient) {

                patient.name = name;
                patient.email = email;
                patient.phone = phone;
                patient.age = age;
                patient.gender = gender;
                patient.department = department;

            }

        }


        // =========================
        // ADD
        // =========================

        else {

            const newPatient = {

                id: Date.now(),

                name: name,

                email: email,

                phone: phone,

                age: age,

                gender: gender,

                department: department

            };


            patients.push(newPatient);

        }


        // =========================
        // SAVE
        // =========================

        localStorage.setItem(
            "healSpherePatients",
            JSON.stringify(patients)
        );


        patientForm.reset();

        patientId.value = "";

        patientFormContainer.classList.add("hidden");

        displayPatients();

    });


    // =========================
    // EDIT / DELETE
    // =========================

    patientTableBody.addEventListener("click", function (event) {

        const id =
            Number(event.target.dataset.id);


        // EDIT

        if (event.target.classList.contains("edit-btn")) {

            const patient =
                patients.find(function (item) {
                    return item.id === id;
                });


            if (!patient) {
                return;
            }


            patientId.value = patient.id;

            patientName.value = patient.name;

            patientEmail.value = patient.email;

            patientPhone.value = patient.phone;

            patientAge.value = patient.age;

            patientGender.value = patient.gender;

            patientDepartment.value =
                patient.department;


            patientFormTitle.textContent =
                "Edit Patient";


            patientFormContainer.classList.remove("hidden");


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        // DELETE

        if (event.target.classList.contains("delete-btn")) {

            const confirmDelete =
                confirm("Are you sure you want to delete this patient?");


            if (!confirmDelete) {
                return;
            }


            patients =
                patients.filter(function (patient) {
                    return patient.id !== id;
                });


            localStorage.setItem(
                "healSpherePatients",
                JSON.stringify(patients)
            );


            displayPatients();

        }

    });


    // =========================
    // SEARCH
    // =========================

    patientSearch.addEventListener("input", function () {

        displayPatients(this.value);

    });


    // =========================
    // INITIAL DISPLAY
    // =========================

    displayPatients();

});