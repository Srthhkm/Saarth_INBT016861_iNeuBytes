// =========================
// DOCTOR MANAGEMENT
// =========================

document.addEventListener("DOMContentLoaded", function () {

    console.log("doctors.js loaded.");


    // =========================
    // INITIAL DOCTOR DATA
    // =========================

    const defaultDoctors = [

        {
            id: 1,
            name: "Dr. Sunaina Sharma",
            department: "Cardiology",
            qualification: "MBBS, MD",
            experience: "15+ Years",
            fee: 800,
            availability: "Mon - Fri"
        },

        {
            id: 2,
            name: "Dr. Shiva Reddy",
            department: "Neurology",
            qualification: "MBBS, DM",
            experience: "12+ Years",
            fee: 900,
            availability: "Mon - Sat"
        },

        {
            id: 3,
            name: "Dr. Komal Bhatia",
            department: "ENT",
            qualification: "MBBS, MS",
            experience: "11+ Years",
            fee: 700,
            availability: "Tue - Sat"
        },

        {
            id: 4,
            name: "Dr. Satish Koul",
            department: "Nephrology",
            qualification: "MBBS, DM",
            experience: "16+ Years",
            fee: 850,
            availability: "Mon - Fri"
        },

        {
            id: 5,
            name: "Dr. Dinesh Rauthan",
            department: "Pediatrics",
            qualification: "MBBS, MD",
            experience: "13+ Years",
            fee: 650,
            availability: "Mon - Sat"
        },

        {
            id: 6,
            name: "Dr. Kamna Bakshi",
            department: "Gynecology",
            qualification: "MBBS, MS",
            experience: "14+ Years",
            fee: 750,
            availability: "Mon - Fri"
        }

    ];


    // =========================
    // LOCAL STORAGE
    // =========================

    let doctors =
        JSON.parse(localStorage.getItem("healSphereDoctors"));


    if (!doctors) {

        doctors = defaultDoctors;

        localStorage.setItem(
            "healSphereDoctors",
            JSON.stringify(doctors)
        );

    }


    // =========================
    // ELEMENTS
    // =========================

    const doctorTableBody =
        document.querySelector("#doctorTableBody");

    const doctorSearch =
        document.querySelector("#doctorSearch");

    const noDoctors =
        document.querySelector("#noDoctors");

    const showDoctorForm =
        document.querySelector("#showDoctorForm");

    const doctorFormContainer =
        document.querySelector("#doctorFormContainer");

    const doctorForm =
        document.querySelector("#doctorForm");

    const cancelDoctorForm =
        document.querySelector("#cancelDoctorForm");

    const doctorFormTitle =
        document.querySelector("#doctorFormTitle");

    const doctorId =
        document.querySelector("#doctorId");

    const doctorName =
        document.querySelector("#doctorName");

    const doctorDepartment =
        document.querySelector("#doctorDepartment");

        // =========================
// LOAD DEPARTMENTS
// =========================

function loadDepartments() {

    const departments =
        JSON.parse(
            localStorage.getItem("healSphereDepartments")
        ) || [];


    doctorDepartment.innerHTML = `
        <option value="">
            Select Department
        </option>
    `;


    departments.forEach(function (department) {

        const option =
            document.createElement("option");

        option.value = department.name;

        option.textContent = department.name;

        doctorDepartment.appendChild(option);

    });

}

    const doctorQualification =
        document.querySelector("#doctorQualification");

    const doctorExperience =
        document.querySelector("#doctorExperience");

    const doctorFee =
        document.querySelector("#doctorFee");

    const doctorAvailability =
        document.querySelector("#doctorAvailability");


    // =========================
    // DISPLAY DOCTORS
    // =========================

    function displayDoctors(searchText = "") {

        doctorTableBody.innerHTML = "";


        const filteredDoctors =
            doctors.filter(function (doctor) {

                const search =
                    searchText.toLowerCase().trim();

                return (
                    doctor.name.toLowerCase().includes(search) ||
                    doctor.department.toLowerCase().includes(search)
                );

            });


        if (filteredDoctors.length === 0) {

            noDoctors.classList.remove("hidden");

            return;

        }


        noDoctors.classList.add("hidden");


        filteredDoctors.forEach(function (doctor) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${doctor.name}</td>

                <td>${doctor.department}</td>

                <td>${doctor.qualification}</td>

                <td>${doctor.experience}</td>

                <td>₹${doctor.fee}</td>

                <td>${doctor.availability}</td>

                <td>

                    <button
                        class="table-btn edit-btn"
                        data-id="${doctor.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="table-btn delete-btn"
                        data-id="${doctor.id}"
                    >
                        Delete
                    </button>

                </td>

            `;


            doctorTableBody.appendChild(row);

        });

    }


    // =========================
    // SHOW ADD FORM
    // =========================

    if (showDoctorForm) {

        showDoctorForm.addEventListener("click", function () {

            doctorForm.reset();

            doctorId.value = "";

            doctorFormTitle.textContent = "Add Doctor";

            doctorFormContainer.classList.remove("hidden");

        });

    }


    // =========================
    // CANCEL FORM
    // =========================

    if (cancelDoctorForm) {

        cancelDoctorForm.addEventListener("click", function () {

            doctorForm.reset();

            doctorId.value = "";

            doctorFormContainer.classList.add("hidden");

        });

    }


    // =========================
    // ADD / EDIT DOCTOR
    // =========================

    doctorForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const name =
            doctorName.value.trim();

        const department =
            doctorDepartment.value;

        const qualification =
            doctorQualification.value.trim();

        const experience =
            doctorExperience.value.trim();

        const fee =
            doctorFee.value;

        const availability =
            doctorAvailability.value.trim();


        // Validation

        if (name.length < 3) {

            alert("Please enter a valid doctor name.");

            return;

        }


        if (!department) {

            alert("Please select a department.");

            return;

        }


        if (!qualification) {

            alert("Please enter qualification.");

            return;

        }


        if (!experience) {

            alert("Please enter experience.");

            return;

        }


        if (!fee || Number(fee) < 0) {

            alert("Please enter a valid consultation fee.");

            return;

        }


        if (!availability) {

            alert("Please enter availability.");

            return;

        }


        // =========================
        // EDIT EXISTING DOCTOR
        // =========================

        if (doctorId.value) {

            const id =
                Number(doctorId.value);


            const doctor =
                doctors.find(function (item) {
                    return item.id === id;
                });


            if (doctor) {

                doctor.name = name;
                doctor.department = department;
                doctor.qualification = qualification;
                doctor.experience = experience;
                doctor.fee = Number(fee);
                doctor.availability = availability;

            }

        }


        // =========================
        // ADD NEW DOCTOR
        // =========================

        else {

            const newDoctor = {

                id: Date.now(),

                name: name,

                department: department,

                qualification: qualification,

                experience: experience,

                fee: Number(fee),

                availability: availability

            };


            doctors.push(newDoctor);

        }


        // =========================
        // SAVE
        // =========================

        localStorage.setItem(
            "healSphereDoctors",
            JSON.stringify(doctors)
        );


        doctorForm.reset();

        doctorId.value = "";

        doctorFormContainer.classList.add("hidden");

        displayDoctors();

    });


    // =========================
    // EDIT / DELETE BUTTONS
    // =========================

    doctorTableBody.addEventListener("click", function (event) {

        const id =
            Number(event.target.dataset.id);


        // EDIT

        if (event.target.classList.contains("edit-btn")) {

            const doctor =
                doctors.find(function (item) {
                    return item.id === id;
                });


            if (!doctor) {
                return;
            }


            doctorId.value = doctor.id;

            doctorName.value = doctor.name;

            doctorDepartment.value =
                doctor.department;

            doctorQualification.value =
                doctor.qualification;

            doctorExperience.value =
                doctor.experience;

            doctorFee.value =
                doctor.fee;

            doctorAvailability.value =
                doctor.availability;


            doctorFormTitle.textContent =
                "Edit Doctor";


            doctorFormContainer.classList.remove("hidden");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        // DELETE

        if (event.target.classList.contains("delete-btn")) {

            const confirmDelete =
                confirm("Are you sure you want to delete this doctor?");


            if (!confirmDelete) {
                return;
            }


            doctors =
                doctors.filter(function (doctor) {
                    return doctor.id !== id;
                });


            localStorage.setItem(
                "healSphereDoctors",
                JSON.stringify(doctors)
            );


            displayDoctors();

        }

    });


    // =========================
    // SEARCH
    // =========================

    if (doctorSearch) {

        doctorSearch.addEventListener("input", function () {

            displayDoctors(this.value);

        });

    }


    // =========================
    // INITIAL DISPLAY
    // =========================

    loadDepartments();

    displayDoctors();


});