/* =========================================================
   HEALSPHERE - IN-APP NOTIFICATIONS
   ========================================================= */


document.addEventListener("DOMContentLoaded", () => {
    loadNotifications();
});


async function loadNotifications() {
    const target = document.querySelector(
        ".dashboard-content, .dashboard-main .container"
    );

    if (!target || !window.HealSphereAPI) {
        return;
    }

    document.querySelector(
        ".notification-section"
    )?.remove();

    try {
        const data = await HealSphereAPI.get("/notifications/my");
        const section = document.createElement("section");
        section.className = "dashboard-section notification-section";
        section.innerHTML = `
            <div class="dashboard-card">
                <div class="card-header notification-header">
                    <div>
                        <span class="section-subtitle">Updates</span>
                        <h3>Notifications${data.unreadCount ? ` (${data.unreadCount} unread)` : ""}</h3>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm" id="markNotificationsRead">
                        Mark all read
                    </button>
                </div>
                <div class="notification-list">
                    ${(data.notifications || []).length
                        ? data.notifications.map(createNotificationHTML).join("")
                        : "<p class=\"empty-state\">No notifications yet.</p>"}
                </div>
            </div>
        `;

        target.prepend(section);

        section.querySelector("#markNotificationsRead")?.addEventListener(
            "click",
            async () => {
                await HealSphereAPI.patch("/notifications/read-all");
                await loadNotifications();
            }
        );
    } catch (error) {
        console.warn("Unable to load notifications:", error.message);
    }
}


function createNotificationHTML(notification) {
    const unreadClass = notification.readAt ? "" : " notification-unread";

    return `
        <article class="notification-item${unreadClass}">
            <div>
                <strong>${HealSphereUtils.escapeHTML(notification.title)}</strong>
                <p>${HealSphereUtils.escapeHTML(notification.message)}</p>
            </div>
            <time>${HealSphereUtils.formatDate(notification.createdAt)}</time>
        </article>
    `;
}
