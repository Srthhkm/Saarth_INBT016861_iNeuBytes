/* =========================================================
   HEALSPHERE - API SERVICE
   Major Project - iNeuBytes Internship
   ========================================================= */


/* ---------- API Configuration ---------- */

// Change this ONE value if the backend runs on another port.
const API_BASE_URL = "http://localhost:5000/api";


/* ---------- Token Helpers ---------- */

function getAuthToken() {
    return localStorage.getItem("healSphereToken");
}


function setAuthToken(token) {
    if (token) {
        localStorage.setItem("healSphereToken", token);
    }
}


function removeAuthToken() {
    localStorage.removeItem("healSphereToken");
}


/* ---------- Generic API Request ---------- */

async function apiRequest(endpoint, options = {}) {

    const token = getAuthToken();

    const headers = {
        ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            config
        );

        let data = null;

        const contentType =
            response.headers.get("content-type");

        if (
            contentType &&
            contentType.includes("application/json")
        ) {
            data = await response.json();
        } else {
            const text = await response.text();

            data = text
                ? { message: text }
                : null;
        }


        /* ---------- Handle Unauthorized ---------- */

        if (response.status === 401) {

            removeAuthToken();

            localStorage.removeItem("healSphereUser");

            if (
                !window.location.pathname.includes("login.html")
            ) {
                window.location.href =
                    getProjectPath("pages/login.html");
            }

            throw new Error(
                data?.message ||
                "Your session has expired. Please login again."
            );
        }


        /* ---------- Handle Other Errors ---------- */

        if (!response.ok) {

            throw new Error(
                data?.message ||
                "Something went wrong with the request."
            );
        }


        return data;

    } catch (error) {

        console.error("HealSphere API Error:", error);

        throw error;
    }
}


/* ---------- GET ---------- */

async function apiGet(endpoint) {

    return apiRequest(endpoint, {
        method: "GET"
    });
}


/* ---------- POST ---------- */

async function apiPost(endpoint, body = {}) {

    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
    });
}


/* ---------- PUT ---------- */

async function apiPut(endpoint, body = {}) {

    return apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
    });
}


/* ---------- PATCH ---------- */

async function apiPatch(endpoint, body = {}) {

    return apiRequest(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body)
    });
}


/* ---------- DELETE ---------- */

async function apiDelete(endpoint) {

    return apiRequest(endpoint, {
        method: "DELETE"
    });
}


/* ---------- Multipart Upload ---------- */

async function apiUpload(endpoint, formData) {

    return apiRequest(endpoint, {
        method: "POST",
        body: formData
    });
}


/* ---------- Authentication API ---------- */

async function loginUser(credentials) {

    const data = await apiPost(
        "/auth/login",
        credentials
    );

    if (data?.token) {
        setAuthToken(data.token);
    }

    if (data?.user) {
        localStorage.setItem(
            "healSphereUser",
            JSON.stringify(data.user)
        );
    }

    return data;
}


async function registerUser(userData) {

    return apiPost(
        "/auth/register",
        userData
    );
}


async function logoutUser() {

    try {

        await apiPost("/auth/logout");

    } catch (error) {

        /*
         * Even if the backend logout request fails,
         * we still clear the local session.
         */

        console.warn(
            "Backend logout request failed:",
            error.message
        );

    } finally {

        removeAuthToken();

        localStorage.removeItem(
            "healSphereUser"
        );
    }
}


async function getCurrentUser() {

    return apiGet("/auth/me");
}


/* ---------- Export API Object ---------- */

window.HealSphereAPI = {

    request: apiRequest,

    get: apiGet,
    post: apiPost,
    put: apiPut,
    patch: apiPatch,
    delete: apiDelete,
    upload: apiUpload,

    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    currentUser: getCurrentUser,

    getToken: getAuthToken,
    setToken: setAuthToken,
    removeToken: removeAuthToken

};