/* =========================================================
   HEALSPHERE - ERROR HANDLING MIDDLEWARE
   ========================================================= */


/* ---------- Not Found Handler ---------- */

function notFound(req, res, next) {

    const error = new Error(
        `Route not found: ${req.method} ${req.originalUrl}`
    );

    error.statusCode = 404;

    next(error);
}


/* ---------- Global Error Handler ---------- */

function errorHandler(error, req, res, next) {

    console.error(
        "HealSphere Backend Error:",
        error
    );


    const statusCode =
        error.statusCode ||
        (res.statusCode !== 200
            ? res.statusCode
            : 500);


    res.status(statusCode).json({

        success: false,

        message:
            error.message ||
            "Internal server error.",

        ...(process.env.NODE_ENV === "development" && {
            stack: error.stack
        })

    });
}


module.exports = {
    notFound,
    errorHandler
};