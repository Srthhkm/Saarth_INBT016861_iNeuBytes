// =========================
// DEPARTMENT MANAGEMENT
// =========================

document.addEventListener("DOMContentLoaded", function () {

    console.log("departments.js loaded.");


    // =========================
    // INITIAL DEPARTMENT DATA
    // =========================

    const defaultDepartments = [

        {
            id: 1,
            name: "Cardiology",
            description: "Heart and cardiovascular care.",
            head: "Dr. Sunaina Sharma"
        },

        {
            id: 2,
            name: "Neurology",
            description: "Brain and nervous system care.",
            head: "Dr. Shiva Reddy"
        },

        {
            id: 3,
            name: "ENT",
            description: "Ear, nose and throat care.",
            head: "Dr. Komal Bhatia"
        },

        {
            id: 4,
            name: "Nephrology",
            description: "Kidney and renal care.",
            head: "Dr. Satish Koul"
        },

        {
            id: 5,
            name: "Pediatrics",
            description: "Healthcare for children.",
            head: "Dr. Dinesh Rauthan"
        },

        {
            id: 6,
            name: "Gynecology",
            description: "Women's reproductive healthcare.",
            head: "Dr. Kamna Bakshi"
        }

    ];


    // =========================
    // LOCAL STORAGE
    // =========================

    let departments =
        JSON.parse(
            localStorage.getItem("healSphereDepartments")
        );


    if (!departments) {

        departments = defaultDepartments;

        localStorage.setItem(
            "healSphereDepartments",
            JSON.stringify(departments)
        );

    }


    // =========================
    // ELEMENTS
    // =========================

    const departmentTableBody =
        document.querySelector("#departmentTableBody");

    const departmentSearch =
        document.querySelector("#departmentSearch");

    const noDepartments =
        document.querySelector("#noDepartments");

    const showDepartmentForm =
        document.querySelector("#showDepartmentForm");

    const departmentFormContainer =
        document.querySelector("#departmentFormContainer");

    const departmentForm =
        document.querySelector("#departmentForm");

    const cancelDepartmentForm =
        document.querySelector("#cancelDepartmentForm");

    const departmentFormTitle =
        document.querySelector("#departmentFormTitle");

    const departmentId =
        document.querySelector("#departmentId");

    const departmentName =
        document.querySelector("#departmentName");

    const departmentDescription =
        document.querySelector("#departmentDescription");

    const departmentHead =
        document.querySelector("#departmentHead");


    // =========================
    // GET DOCTORS
    // =========================

    function getDoctors() {

        return (
            JSON.parse(
                localStorage.getItem("healSphereDoctors")
            ) || []
        );

    }


    // =========================
    // DISPLAY DEPARTMENTS
    // =========================

    function displayDepartments(searchText = "") {

        departmentTableBody.innerHTML = "";


        const search =
            searchText.toLowerCase().trim();


        const filteredDepartments =
            departments.filter(function (department) {

                return (

                    department.name
                        .toLowerCase()
                        .includes(search)

                );

            });


        if (filteredDepartments.length === 0) {

            noDepartments.classList.remove("hidden");

            return;

        }


        noDepartments.classList.add("hidden");


        const doctors =
            getDoctors();


        filteredDepartments.forEach(function (department) {

            const doctorCount =
                doctors.filter(function (doctor) {

                    return doctor.department === department.name;

                }).length;


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${department.name}
                </td>

                <td>
                    ${department.description}
                </td>

                <td>
                    ${department.head}
                </td>

                <td>
                    ${doctorCount}
                </td>

                <td>

                    <button
                        class="table-btn edit-btn"
                        data-id="${department.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="table-btn delete-btn"
                        data-id="${department.id}"
                    >
                        Delete
                    </button>

                </td>

            `;


            departmentTableBody.appendChild(row);

        });

    }


    // =========================
    // SHOW FORM
    // =========================

    showDepartmentForm.addEventListener(
        "click",
        function () {

            departmentForm.reset();

            departmentId.value = "";

            departmentFormTitle.textContent =
                "Add Department";

            departmentFormContainer.classList.remove(
                "hidden"
            );

        }
    );


    // =========================
    // CANCEL FORM
    // =========================

    cancelDepartmentForm.addEventListener(
        "click",
        function () {

            departmentForm.reset();

            departmentId.value = "";

            departmentFormContainer.classList.add(
                "hidden"
            );

        }
    );


    // =========================
    // ADD / EDIT
    // =========================

    departmentForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                departmentName.value.trim();

            const description =
                departmentDescription.value.trim();

            const head =
                departmentHead.value.trim();


            // =========================
            // VALIDATION
            // =========================

            if (name.length < 2) {

                alert(
                    "Please enter a valid department name."
                );

                return;

            }


            if (description.length < 5) {

                alert(
                    "Please enter a department description."
                );

                return;

            }


            if (head.length < 3) {

                alert(
                    "Please enter the department head."
                );

                return;

            }


            // =========================
            // EDIT
            // =========================

            if (departmentId.value) {

                const id =
                    Number(departmentId.value);


                const department =
                    departments.find(function (item) {

                        return item.id === id;

                    });


                if (department) {

                    department.name = name;

                    department.description =
                        description;

                    department.head = head;

                }

            }


            // =========================
            // ADD
            // =========================

            else {

                const newDepartment = {

                    id: Date.now(),

                    name: name,

                    description: description,

                    head: head

                };


                departments.push(newDepartment);

            }


            // =========================
            // SAVE
            // =========================

            localStorage.setItem(
                "healSphereDepartments",
                JSON.stringify(departments)
            );


            departmentForm.reset();

            departmentId.value = "";

            departmentFormContainer.classList.add(
                "hidden"
            );


            displayDepartments();

        }
    );


    // =========================
    // EDIT / DELETE
    // =========================

    departmentTableBody.addEventListener(
        "click",
        function (event) {

            const id =
                Number(event.target.dataset.id);


            // EDIT

            if (
                event.target.classList.contains(
                    "edit-btn"
                )
            ) {

                const department =
                    departments.find(function (item) {

                        return item.id === id;

                    });


                if (!department) {
                    return;
                }


                departmentId.value =
                    department.id;

                departmentName.value =
                    department.name;

                departmentDescription.value =
                    department.description;

                departmentHead.value =
                    department.head;


                departmentFormTitle.textContent =
                    "Edit Department";


                departmentFormContainer.classList.remove(
                    "hidden"
                );


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }


            // DELETE

            if (
                event.target.classList.contains(
                    "delete-btn"
                )
            ) {

                const confirmDelete =
                    confirm(
                        "Are you sure you want to delete this department?"
                    );


                if (!confirmDelete) {
                    return;
                }


                departments =
                    departments.filter(
                        function (department) {

                            return department.id !== id;

                        }
                    );


                localStorage.setItem(
                    "healSphereDepartments",
                    JSON.stringify(departments)
                );


                displayDepartments();

            }

        }
    );


    // =========================
    // SEARCH
    // =========================

    departmentSearch.addEventListener(
        "input",
        function () {

            displayDepartments(this.value);

        }
    );


    // =========================
    // INITIAL DISPLAY
    // =========================

    displayDepartments();

});