/* =========================================================
   HEALSPHERE - PATIENT MEDICAL RECORDS
   Major Project
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadMedicalRecords();
        loadMedicalDocuments();
        setupMedicalDocumentForm();

    }
);


/* ---------- Load Records ---------- */

async function loadMedicalRecords() {

    const container =
        document.querySelector(
            "#medicalRecordsList, " +
            "#recordList, " +
            "#recordsList, " +
            ".record-list"
        );


    if (!container) {
        return;
    }


    try {

        const data =
            await HealSphereAPI.get(
                "/medical-records/my"
            );


        const records =
            extractRecords(
                data
            );


        renderRecords(
            container,
            records
        );


    } catch (error) {

        console.error(
            "Unable to load medical records:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    Unable to Load Records
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;
    }

}


/* ---------- Extract Records ---------- */

function extractRecords(
    data
) {

    if (Array.isArray(data)) {
        return data;
    }


    if (
        data &&
        Array.isArray(
            data.records
        )
    ) {
        return data.records;
    }


    if (
        data &&
        Array.isArray(data.data)
    ) {
        return data.data;
    }


    return [];
}


/* ---------- Render Records ---------- */

function renderRecords(
    container,
    records
) {

    if (
        records.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-file-medical"></i>

                <h3>
                    No Medical Records
                </h3>

                <p>
                    Your medical records will appear here.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        records
            .map(
                createRecordHTML
            )
            .join("");

}


/* ---------- Record HTML ---------- */

function createRecordHTML(
    record
) {

    const title =
        record.title ||
        record.recordType ||
        record.type ||
        "Medical Record";


    const doctor =
        record.doctorName ||
        record.doctor ||
        "";


    const date =
        HealSphereUtils.formatDate(
            record.date ||
            record.createdAt
        );


    const description =
        record.description ||
        record.notes ||
        "";


    const fileUrl =
        record.fileUrl ||
        record.documentUrl ||
        record.url ||
        "";


    return `

        <article class="record-card">

            <div class="record-icon">

                <i class="fa-solid fa-file-medical"></i>

            </div>


            <div class="record-info">

                <h4>
                    ${HealSphereUtils.escapeHTML(
                        title
                    )}
                </h4>


                ${
                    doctor
                        ? `
                            <span>
                                ${HealSphereUtils.escapeHTML(
                                    doctor
                                )}
                            </span>
                          `
                        : ""
                }


                ${
                    date
                        ? `
                            <span>
                                ${HealSphereUtils.escapeHTML(
                                    date
                                )}
                            </span>
                          `
                        : ""
                }


                ${
                    description
                        ? `
                            <p>
                                ${HealSphereUtils.escapeHTML(
                                    description
                                )}
                            </p>
                          `
                        : ""
                }

            </div>


            ${
                fileUrl
                    ? `
                        <a
                            href="${HealSphereUtils.escapeHTML(
                                fileUrl
                            )}"
                            class="btn btn-outline btn-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <i class="fa-solid fa-download"></i>
                            View
                        </a>
                      `
                    : ""
            }

        </article>

    `;
}


/* ---------- Patient Document Store ---------- */

const medicalDocumentApiUrl = "http://localhost:5000";


async function loadMedicalDocuments() {

    const container = document.querySelector(
        "#medicalDocumentsList"
    );

    if (!container) {
        return;
    }

    try {
        const data = await HealSphereAPI.get(
            "/medical-records/documents/my"
        );

        renderMedicalDocuments(
            container,
            data?.documents || []
        );
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Unable to Load Documents</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}


function setupMedicalDocumentForm() {

    const form = document.querySelector(
        "#medicalDocumentForm"
    );

    if (!form) {
        return;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const fileInput = document.querySelector(
            "#medicalDocument"
        );
        const file = fileInput.files[0];
        const message = document.querySelector(
            "#documentFormMessage"
        );
        const button = document.querySelector(
            "#uploadDocumentBtn"
        );

        if (!file) {
            message.textContent = "Please select a file.";
            return;
        }

        const formData = new FormData();
        formData.append(
            "title",
            document.querySelector("#documentTitle").value.trim()
        );
        formData.append(
            "category",
            document.querySelector("#documentCategory").value
        );
        formData.append("document", file);

        button.disabled = true;
        message.textContent = "Uploading...";

        try {
            await HealSphereAPI.upload(
                "/medical-records/documents",
                formData
            );

            form.reset();
            message.textContent = "Document uploaded successfully.";
            await loadMedicalDocuments();
        } catch (error) {
            message.textContent = error.message;
        } finally {
            button.disabled = false;
        }
    });
}


function renderMedicalDocuments(container, documents) {

    if (!documents.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <h3>No stored documents</h3>
                <p>Upload a prescription, report or other health file above.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = documents.map(document => `
        <article class="medical-document-card">
            <div class="medical-record-icon">
                <i class="fa-solid fa-file-medical"></i>
            </div>
            <div class="medical-record-content">
                <div class="medical-record-header">
                    <div>
                        <span class="record-type">
                            ${HealSphereUtils.escapeHTML(document.category)}
                        </span>
                        <h3>
                            ${HealSphereUtils.escapeHTML(document.title)}
                        </h3>
                    </div>
                    <span class="record-date">
                        ${HealSphereUtils.formatDate(document.createdAt)}
                    </span>
                </div>
                <p>
                    ${HealSphereUtils.escapeHTML(document.originalName)}
                    · ${formatFileSize(document.fileSize)}
                </p>
                <div class="medical-document-actions">
                    <button type="button" class="btn btn-outline btn-sm document-download-btn" data-document-id="${document._id}" data-document-name="${HealSphereUtils.escapeHTML(document.originalName)}">
                        <i class="fa-solid fa-download"></i>
                        Download
                    </button>
                    <button type="button" class="btn btn-outline btn-sm document-delete-btn" data-document-id="${document._id}">
                        <i class="fa-solid fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        </article>
    `).join("");

    container.querySelectorAll(".document-download-btn").forEach(button => {
        button.addEventListener("click", () => downloadMedicalDocument(
            button.dataset.documentId,
            button.dataset.documentName
        ));
    });

    container.querySelectorAll(".document-delete-btn").forEach(button => {
        button.addEventListener("click", () => deleteMedicalDocument(
            button.dataset.documentId
        ));
    });
}


async function downloadMedicalDocument(documentId, documentName) {

    const response = await fetch(
        `${medicalDocumentApiUrl}/api/medical-records/documents/${documentId}/download`,
        {
            headers: {
                Authorization: `Bearer ${HealSphereAPI.getToken()}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Unable to download this document.");
    }

    const blobUrl = URL.createObjectURL(
        await response.blob()
    );
    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = documentName;
    link.click();
    URL.revokeObjectURL(blobUrl);
}


async function deleteMedicalDocument(documentId) {

    if (!window.confirm("Delete this medical document?")) {
        return;
    }

    try {
        await HealSphereAPI.delete(
            `/medical-records/documents/${documentId}`
        );
        await loadMedicalDocuments();
    } catch (error) {
        window.alert(error.message);
    }
}


function formatFileSize(bytes) {

    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}