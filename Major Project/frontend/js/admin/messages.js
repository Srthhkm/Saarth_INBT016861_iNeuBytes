/* =========================================================
   HEALSPHERE - ADMIN MESSAGE MANAGEMENT
   ========================================================= */


document.addEventListener("DOMContentLoaded", () => {

    loadAdminMessages();

    document
        .getElementById("refreshMessagesBtn")
        ?.addEventListener("click", loadAdminMessages);
});


async function loadAdminMessages() {

    const container =
        document.getElementById("adminMessagesList");

    if (!container) {
        return;
    }

    try {

        const data =
            await HealSphereAPI.get("/contact");

        const messages =
            Array.isArray(data?.messages)
                ? data.messages
                : [];

        if (!messages.length) {
            container.innerHTML = "<p>No contact messages yet.</p>";
            return;
        }

        container.innerHTML = messages
            .map(renderMessage)
            .join("");

        container
            .querySelectorAll("[data-message-status]")
            .forEach(select => {
                select.addEventListener("change", () =>
                    updateMessageStatus(
                        select.dataset.messageStatus,
                        select.value
                    )
                );
            });

        container
            .querySelectorAll("[data-message-reply]")
            .forEach(form => {
                form.addEventListener("submit", event => {
                    event.preventDefault();
                    replyToMessage(form);
                });
            });

    } catch (error) {

        container.innerHTML =
            `<p>Unable to load messages: ${HealSphereUtils.escapeHTML(
                error.message
            )}</p>`;
    }
}


function renderMessage(message) {

    const id = message._id || message.id;
    const date = message.createdAt
        ? new Date(message.createdAt).toLocaleString()
        : "";

    return `
        <article class="dashboard-card" data-message-id="${
            HealSphereUtils.escapeHTML(id)
        }">
            <div class="card-header">
                <div>
                    <h3>${HealSphereUtils.escapeHTML(
                        message.subject || "General enquiry"
                    )}</h3>
                    <p>${HealSphereUtils.escapeHTML(
                        message.name
                    )} &lt;${HealSphereUtils.escapeHTML(
                        message.email
                    )}&gt;</p>
                </div>
                <small>${HealSphereUtils.escapeHTML(date)}</small>
            </div>

            <div class="card-body">
                <p>${HealSphereUtils.escapeHTML(message.message)}</p>

                <label>
                    Status
                    <select
                        class="form-control"
                        data-message-status="${HealSphereUtils.escapeHTML(id)}"
                    >
                        ${["new", "read", "replied"]
                            .map(status => `
                                <option value="${status}" ${
                                    message.status === status ? "selected" : ""
                                }>${status}</option>
                            `)
                            .join("")}
                    </select>
                </label>

                <form data-message-reply="${HealSphereUtils.escapeHTML(id)}">
                    <label>
                        Reply by email
                        <textarea
                            class="form-control"
                            name="reply"
                            rows="3"
                            required
                        ></textarea>
                    </label>
                    <button type="submit" class="btn btn-primary">
                        <i class="fa-solid fa-paper-plane"></i>
                        Send Reply
                    </button>
                </form>
            </div>
        </article>
    `;
}


async function updateMessageStatus(id, status) {

    try {

        await HealSphereAPI.patch(
            `/contact/${encodeURIComponent(id)}`,
            { status }
        );

        HealSphereUtils.showToast("Message status updated.", "success");

    } catch (error) {
        HealSphereUtils.showToast(error.message, "error");
    }
}


async function replyToMessage(form) {

    const id = form.dataset.messageReply;
    const reply = form.elements.reply.value.trim();
    const button = form.querySelector("button[type='submit']");

    HealSphereUtils.setButtonLoading(button, true, "Sending...");

    try {

        const data =
            await HealSphereAPI.post(
                `/contact/${encodeURIComponent(id)}/reply`,
                { reply }
            );

        HealSphereUtils.showToast(
            data?.message || "Reply sent successfully.",
            "success"
        );

        form.reset();
        await loadAdminMessages();

    } catch (error) {

        HealSphereUtils.showToast(
            error.message || "Unable to send reply.",
            "error"
        );

        HealSphereUtils.setButtonLoading(button, false);
    }
}
