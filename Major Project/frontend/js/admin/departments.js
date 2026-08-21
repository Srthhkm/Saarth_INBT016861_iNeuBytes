/* =========================================================
   HEALSPHERE - ADMIN DEPARTMENT MANAGEMENT
   Major Project
   ========================================================= */


let departments = [];


/* ---------- DOM Ready ---------- */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadDepartments();

        initializeDepartmentForm();

        initializeDepartmentSearch();

        window.setInterval(
            () => {

                if (!document.hidden) {
                    loadDepartments();
                }
            },
            30000
        );

    }
);


/* ---------- Load ---------- */

async function loadDepartments() {

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


        renderDepartments();


    } catch (error) {

        console.error(
            "Unable to load departments:",
            error
        );

    }

}


/* ---------- Render ---------- */

function renderDepartments(
    searchText = ""
) {

    const tableBody =
        document.querySelector(
            "#departmentTableBody"
        );


    const emptyMessage =
        document.querySelector(
            "#noDepartments"
        );


    if (!tableBody) {
        return;
    }


    const search =
        String(
            searchText || ""
        )
            .trim()
            .toLowerCase();


    const filtered =
        departments.filter(
            department => {

                const name =
                    getDepartmentName(
                        department
                    )
                        .toLowerCase();


                return (
                    !search ||
                    name.includes(search)
                );

            }
        );


    tableBody.innerHTML = "";


    if (
        filtered.length === 0
    ) {

        if (emptyMessage) {
            emptyMessage.classList.remove(
                "hidden"
            );
        }

        return;
    }


    if (emptyMessage) {
        emptyMessage.classList.add(
            "hidden"
        );
    }


    filtered.forEach(
        department => {

            const row =
                document.createElement(
                    "tr"
                );


            const id =
                getDepartmentId(
                    department
                );


            row.innerHTML = `

                <td>
                    ${HealSphereUtils.escapeHTML(
                        getDepartmentName(
                            department
                        )
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        department.head ||
                        ""
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        department.location ||
                        ""
                    )}
                </td>

                <td>
                    ${HealSphereUtils.escapeHTML(
                        department.description ||
                        ""
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="table-btn edit-department-btn"
                        data-id="${HealSphereUtils.escapeHTML(
                            id
                        )}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="table-btn delete-department-btn"
                        data-id="${HealSphereUtils.escapeHTML(
                            id
                        )}"
                    >
                        Delete
                    </button>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


/* ---------- Form ---------- */

function initializeDepartmentForm() {

    const form =
        document.querySelector(
            "#departmentForm"
        );


    const showButton =
        document.querySelector(
            "#showDepartmentForm"
        );


    const cancelButton =
        document.querySelector(
            "#cancelDepartmentForm"
        );


    if (showButton) {

        showButton.addEventListener(
            "click",
            () => {

                resetDepartmentForm();

                showDepartmentForm();

            }
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                resetDepartmentForm();

                hideDepartmentForm();

            }
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            handleDepartmentSubmit
        );

    }


    document.addEventListener(
        "click",
        handleDepartmentAction
    );

}


/* ---------- Submit ---------- */

async function handleDepartmentSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const id =
        form.querySelector(
            "#departmentId"
        )?.value.trim();


    const name =
        form.querySelector(
            "#departmentName"
        )?.value.trim();


    const description =
        form.querySelector(
            "#departmentDescription"
        )?.value.trim();

    const head =
        form.querySelector(
            "#departmentHead"
        )?.value.trim();

    const location =
        form.querySelector(
            "#departmentLocation"
        )?.value.trim();


    if (
        !name ||
        name.length < 2
    ) {

        HealSphereUtils.showToast(
            "Please enter a valid department name.",
            "error"
        );

        return;
    }


    const departmentData = {

        name,

        head,

        location,

        description

    };


    const submitButton =
        form.querySelector(
            "button[type='submit']"
        );


    HealSphereUtils.setButtonLoading(
        submitButton,
        true,
        id
            ? "Updating..."
            : "Adding..."
    );


    try {

        if (id) {

            await HealSphereAPI.patch(
                `/departments/${encodeURIComponent(
                    id
                )}`,
                departmentData
            );


            HealSphereUtils.showToast(
                "Department updated successfully.",
                "success"
            );

        } else {

            await HealSphereAPI.post(
                "/departments",
                departmentData
            );


            HealSphereUtils.showToast(
                "Department added successfully.",
                "success"
            );

        }


        resetDepartmentForm();

        hideDepartmentForm();

        await loadDepartments();


    } catch (error) {

        HealSphereUtils.showToast(
            error.message ||
            "Unable to save department.",
            "error"
        );

    } finally {

        HealSphereUtils.setButtonLoading(
            submitButton,
            false
        );

    }

}


/* ---------- Actions ---------- */

async function handleDepartmentAction(
    event
) {

    const editButton =
        event.target.closest(
            ".edit-department-btn"
        );


    const deleteButton =
        event.target.closest(
            ".delete-department-btn"
        );


    if (editButton) {

        editDepartment(
            editButton.dataset.id
        );

    }


    if (deleteButton) {

        await deleteDepartment(
            deleteButton.dataset.id
        );

    }

}


/* ---------- Edit ---------- */

function editDepartment(
    id
) {

    const department =
        departments.find(
            item =>
                String(
                    getDepartmentId(item)
                ) ===
                String(id)
        );


    if (!department) {
        return;
    }


    setValue(
        "#departmentId",
        getDepartmentId(
            department
        )
    );


    setValue(
        "#departmentName",
        getDepartmentName(
            department
        )
    );


    setValue(
        "#departmentDescription",
        department.description ||
        ""
    );


    setValue(
        "#departmentHead",
        department.head ||
        ""
    );


    setValue(
        "#departmentLocation",
        department.location ||
        ""
    );


    const title =
        document.querySelector(
            "#departmentFormTitle"
        );


    if (title) {
        title.textContent =
            "Edit Department";
    }


    showDepartmentForm();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ---------- Delete ---------- */

async function deleteDepartment(
    id
) {

    if (
        !confirm(
            "Are you sure you want to delete this department?"
        )
    ) {
        return;
    }


    try {

        await HealSphereAPI.delete(
            `/departments/${encodeURIComponent(
                id
            )}`
        );


        HealSphereUtils.showToast(
            "Department deleted successfully.",
            "success"
        );


        await loadDepartments();


    } catch (error) {

        HealSphereUtils.showToast(
            error.message ||
            "Unable to delete department.",
            "error"
        );

    }

}


/* ---------- Search ---------- */

function initializeDepartmentSearch() {

    const search =
        document.querySelector(
            "#departmentSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        () => {

            renderDepartments(
                search.value
            );

        }
    );

}


/* ---------- UI ---------- */

function showDepartmentForm() {

    const container =
        document.querySelector(
            "#departmentFormContainer"
        );


    if (container) {
        container.classList.remove(
            "hidden"
        );
    }

}


function hideDepartmentForm() {

    const container =
        document.querySelector(
            "#departmentFormContainer"
        );


    if (container) {
        container.classList.add(
            "hidden"
        );
    }

}


function resetDepartmentForm() {

    const form =
        document.querySelector(
            "#departmentForm"
        );


    if (form) {
        form.reset();
    }


    setValue(
        "#departmentId",
        ""
    );


    const title =
        document.querySelector(
            "#departmentFormTitle"
        );


    if (title) {
        title.textContent =
            "Add Department";
    }

}


/* ---------- Helpers ---------- */

function getDepartmentId(
    department
) {

    return (
        department?.id ||
        department?._id ||
        ""
    );

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


function setValue(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );


    if (element) {
        element.value =
            value ?? "";
    }

}


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