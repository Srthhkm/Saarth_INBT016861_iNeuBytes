/* =========================================================
   HEALSPHERE - UTILITY FUNCTIONS
   Major Project - iNeuBytes Internship
   ========================================================= */


/* ---------- Project Path Helper ---------- */

function getProjectPath(path) {

    const currentPath =
        window.location.pathname.replace(/\\/g, "/");

    /*
     * Find the frontend folder.
     *
     * Example:
     * /Major%20Project/frontend/pages/patient/dashboard.html
     */

    const frontendIndex =
        currentPath.indexOf("/frontend/");

    /*
     * If frontend cannot be detected,
     * return the path unchanged.
     */

    if (frontendIndex === -1) {
        return path;
    }


    /*
     * Get the part after /frontend/
     */

    const relativeCurrentPath =
        currentPath.substring(
            frontendIndex + "/frontend/".length
        );


    /*
     * Current directory inside frontend.
     *
     * Examples:
     *
     * pages/register.html
     *        -> pages/
     *
     * pages/admin/dashboard.html
     *        -> pages/admin/
     *
     * pages/patient/dashboard.html
     *        -> pages/patient/
     */

    const currentParts =
        relativeCurrentPath.split("/");

    currentParts.pop();


    /*
     * ---------- Target starts from frontend ----------
     *
     * Example:
     *
     * getProjectPath("pages/patient/dashboard.html")
     *
     * From:
     * frontend/pages/admin/dashboard.html
     *
     * Result:
     * ../../pages/patient/dashboard.html
     */

    if (path.startsWith("pages/")) {

        let prefix = "";

        for (
            let i = 0;
            i < currentParts.length;
            i++
        ) {
            prefix += "../";
        }

        return prefix + path;
    }


    /*
     * ---------- Target is relative ----------
     *
     * Example:
     *
     * From:
     * frontend/pages/register.html
     *
     * getProjectPath("login.html")
     *
     * Result:
     * login.html
     *
     * From:
     * frontend/pages/admin/dashboard.html
     *
     * getProjectPath("login.html")
     *
     * Result:
     * ../login.html
     */

    let prefix = "";

    for (
        let i = 0;
        i < currentParts.length - 1;
        i++
    ) {
        prefix += "../";
    }

    return prefix + path;
}

/* ---------- Local Storage Helpers ---------- */

function saveToStorage(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}


function getFromStorage(key, defaultValue = null) {

    const value =
        localStorage.getItem(key);

    if (!value) {
        return defaultValue;
    }

    try {

        return JSON.parse(value);

    } catch (error) {

        console.error(
            `Unable to parse local storage key: ${key}`,
            error
        );

        return defaultValue;
    }
}


function removeFromStorage(key) {

    localStorage.removeItem(key);
}


/* ---------- Current User ---------- */

function getCurrentUserFromStorage() {

    return getFromStorage(
        "healSphereUser",
        null
    );
}


function saveCurrentUser(user) {

    saveToStorage(
        "healSphereUser",
        user
    );
}


function clearCurrentUser() {

    removeFromStorage(
        "healSphereUser"
    );
}


/* ---------- Authentication Check ---------- */

function isLoggedIn() {

    return Boolean(
        localStorage.getItem("healSphereToken")
    );
}


/* ---------- Role Helper ---------- */

function getUserRole() {

    const user =
        getCurrentUserFromStorage();

    return user?.role || null;
}


/* ---------- Role Redirect ---------- */

function redirectByRole(role) {

    switch (role) {

        case "patient":
            window.location.href =
                getProjectPath(
                    "pages/patient/dashboard.html"
                );
            break;

        case "doctor":
            window.location.href =
                getProjectPath(
                    "pages/doctor/dashboard.html"
                );
            break;

        case "admin":
        case "administrator":
            window.location.href =
                getProjectPath(
                    "pages/admin/dashboard.html"
                );
            break;

        default:
            window.location.href =
                getProjectPath(
                    "pages/login.html"
                );
    }
}


/* ---------- Logout ---------- */

async function handleLogout() {

    try {

        if (
            window.HealSphereAPI &&
            typeof window.HealSphereAPI.logout === "function"
        ) {
            await window.HealSphereAPI.logout();
        }

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

        localStorage.removeItem(
            "healSphereToken"
        );

        localStorage.removeItem(
            "healSphereUser"
        );

        window.location.href =
            getProjectPath(
                "pages/login.html"
            );
    }
}


/* ---------- Toast Notification ---------- */

function showToast(
    message,
    type = "info"
) {

    let container =
        document.getElementById(
            "toastContainer"
        );

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "toastContainer";

        container.style.position =
            "fixed";

        container.style.top =
            "20px";

        container.style.right =
            "20px";

        container.style.zIndex =
            "9999";

        container.style.display =
            "flex";

        container.style.flexDirection =
            "column";

        container.style.gap =
            "10px";

        document.body.appendChild(
            container
        );
    }


    const toast =
        document.createElement("div");

    toast.textContent =
        message;

    toast.style.padding =
        "12px 18px";

    toast.style.borderRadius =
        "8px";

    toast.style.color =
        "#ffffff";

    toast.style.fontSize =
        "14px";

    toast.style.fontWeight =
        "600";

    toast.style.boxShadow =
        "0 5px 20px rgba(0,0,0,0.15)";

    if (type === "success") {
        toast.style.background =
            "#198754";
    }

    else if (type === "error") {
        toast.style.background =
            "#dc3545";
    }

    else if (type === "warning") {
        toast.style.background =
            "#f59e0b";
    }

    else {
        toast.style.background =
            "#1769aa";
    }


    container.appendChild(
        toast
    );


    setTimeout(() => {

        toast.style.opacity =
            "0";

        toast.style.transition =
            "opacity 0.3s ease";

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);
}


/* ---------- Form Validation ---------- */

function validateRequiredFields(form) {

    let isValid = true;

    const fields =
        form.querySelectorAll(
            "[required]"
        );

    fields.forEach(field => {

        field.classList.remove(
            "input-error"
        );

        if (!field.value.trim()) {

            isValid = false;

            field.classList.add(
                "input-error"
            );
        }
    });

    return isValid;
}


/* ---------- Email Validation ---------- */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


/* ---------- Phone Validation ---------- */

function isValidPhone(phone) {

    return /^[0-9+\-\s()]{10,15}$/
        .test(phone);
}


/* ---------- Password Validation ---------- */

function isValidPassword(password) {

    return password.length >= 6;
}


/* ---------- HTML Escape ---------- */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ---------- Date Formatting ---------- */

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* ---------- Time Formatting ---------- */

function formatTime(timeValue) {

    if (!timeValue) {
        return "";
    }

    const parts =
        timeValue.split(":");

    if (parts.length < 2) {
        return timeValue;
    }

    const hours =
        Number(parts[0]);

    const minutes =
        parts[1];

    const period =
        hours >= 12
            ? "PM"
            : "AM";

    const displayHour =
        hours % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
}


/* ---------- Debounce ---------- */

function debounce(
    callback,
    delay = 300
) {

    let timeout;

    return function (...args) {

        clearTimeout(timeout);

        timeout =
            setTimeout(() => {

                callback.apply(
                    this,
                    args
                );

            }, delay);
    };
}


/* ---------- Confirm Action ---------- */

function confirmAction(
    message =
        "Are you sure you want to continue?"
) {

    return window.confirm(
        message
    );
}


/* ---------- Loading State ---------- */

function setButtonLoading(
    button,
    loading,
    loadingText = "Please wait..."
) {

    if (!button) {
        return;
    }

    if (loading) {

        button.dataset.originalText =
            button.innerHTML;

        button.disabled =
            true;

        button.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i> ${loadingText}`;

    } else {

        button.disabled =
            false;

        if (
            button.dataset.originalText
        ) {

            button.innerHTML =
                button.dataset.originalText;
        }
    }
}


/* ---------- Global Logout Buttons ---------- */

function initializeLogoutButtons() {

    const logoutButtons =
        document.querySelectorAll(
            "#logoutBtn, .logout-btn"
        );

    logoutButtons.forEach(button => {

        button.addEventListener(
            "click",
            handleLogout
        );
    });
}


/* ---------- Global Initialization ---------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeLogoutButtons();

        initializePasswordChange();

    }
);


/* ---------- Password Change ---------- */

function initializePasswordChange() {

    const button =
        document.getElementById("changePasswordBtn");

    if (!button) {
        return;
    }

    button.addEventListener("click", async () => {

        const currentPassword =
            window.prompt("Enter your current password:");

        if (currentPassword === null) {
            return;
        }

        const newPassword =
            window.prompt("Enter your new password:");

        if (newPassword === null) {
            return;
        }

        const confirmation =
            window.prompt("Confirm your new password:");

        if (newPassword !== confirmation) {
            showToast("New passwords do not match.", "error");
            return;
        }

        if (!isValidPassword(newPassword)) {
            showToast("Password must contain at least 6 characters.", "error");
            return;
        }

        setButtonLoading(button, true, "Updating...");

        try {

            const data =
                await HealSphereAPI.patch(
                    "/auth/password",
                    {
                        currentPassword,
                        newPassword
                    }
                );

            showToast(
                data?.message || "Password changed successfully.",
                "success"
            );

        } catch (error) {

            showToast(
                error.message || "Unable to change password.",
                "error"
            );

        } finally {
            setButtonLoading(button, false);
        }
    });
}


/* ---------- Global Utilities ---------- */

window.HealSphereUtils = {

    getProjectPath,

    saveToStorage,
    getFromStorage,
    removeFromStorage,

    getCurrentUser:
        getCurrentUserFromStorage,

    saveCurrentUser,
    clearCurrentUser,

    isLoggedIn,
    getUserRole,
    redirectByRole,

    logout:
        handleLogout,

    showToast,

    validateRequiredFields,
    isValidEmail,
    isValidPhone,
    isValidPassword,

    escapeHTML,

    formatDate,
    formatTime,

    debounce,
    confirmAction,

    setButtonLoading
};