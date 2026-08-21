/* =========================================================
   HEALSPHERE - BACKEND SERVER
   ========================================================= */


/* ---------- Environment Configuration ---------- */

require("dotenv").config();


/* ---------- Imports ---------- */

const express = require("express");

const cors = require("cors");

const connectDB =
    require("./config/db");


/* ---------- Routes ---------- */

const authRoutes =
    require("./routes/authRoutes");

const patientRoutes =
    require("./routes/patientRoutes");

const doctorRoutes =
    require("./routes/doctorRoutes");

const appointmentRoutes =
    require("./routes/appointmentRoutes");

const departmentRoutes =
    require("./routes/departmentRoutes");

const medicalRecordRoutes =
    require("./routes/medicalRecordRoutes");

const reportRoutes =
    require("./routes/reportRoutes");

const contactRoutes =
    require("./routes/contactRoutes");

const adminRoutes =
    require("./routes/adminRoutes");

const notificationRoutes =
    require("./routes/notificationRoutes");


/* ---------- Error Middleware ---------- */

const {
    notFound,
    errorHandler
} = require("./middleware/errorMiddleware");


/* ---------- App Initialization ---------- */

const app = express();


/* ---------- Server Configuration ---------- */

const PORT =
    process.env.PORT || 5000;


/* ---------- General Middleware ---------- */

// Allow frontend requests.
app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            "http://127.0.0.1:5500",

        credentials: true
    })
);


// Parse JSON request bodies.
app.use(
    express.json()
);


// Parse URL-encoded request bodies.
app.use(
    express.urlencoded({
        extended: true
    })
);


/* ---------- Basic Routes ---------- */

// Root route.
app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "HealSphere Backend API is running."

        });

    }
);


// Health-check route.
app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "HealSphere API is healthy.",

            status:
                "OK",

            environment:
                process.env.NODE_ENV ||
                "development"

        });

    }
);


/* ---------- API Routes ---------- */

app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/patients",
    patientRoutes
);


app.use(
    "/api/doctors",
    doctorRoutes
);


app.use(
    "/api/appointments",
    appointmentRoutes
);


app.use(
    "/api/departments",
    departmentRoutes
);


app.use(
    "/api/medical-records",
    medicalRecordRoutes
);


app.use(
    "/api/reports",
    reportRoutes
);


app.use(
    "/api/contact",
    contactRoutes
);


app.use(
    "/api/admin",
    adminRoutes
);


app.use(
    "/api/notifications",
    notificationRoutes
);


/* ---------- Error Handling ---------- */

// Handle unknown routes.
app.use(
    notFound
);


// Handle all application errors.
app.use(
    errorHandler
);


/* ---------- Start Server ---------- */

const startServer = async () => {

    await connectDB();


    app.listen(
        PORT,
        () => {

            console.log(
                "========================================"
            );

            console.log(
                "       HEALSPHERE BACKEND SERVER"
            );

            console.log(
                "========================================"
            );

            console.log(
                `Server running on port ${PORT}`
            );

            console.log(
                `Environment: ${
                    process.env.NODE_ENV ||
                    "development"
                }`
            );

            console.log(
                `API: http://localhost:${PORT}`
            );

            console.log(
                "========================================"
            );

        }
    );

};


startServer();