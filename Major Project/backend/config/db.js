/* =========================================================
   HEALSPHERE - DATABASE CONNECTION
   Major Project - iNeuBytes Internship
   ========================================================= */

const mongoose = require("mongoose");


/* ---------- Connect to MongoDB ---------- */

const connectDB = async () => {

    try {

        const connection = await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("========================================");
        console.log("       MONGODB DATABASE CONNECTED");
        console.log("========================================");
        console.log(`Database Host: ${connection.connection.host}`);
        console.log(`Database Name: ${connection.connection.name}`);
        console.log("========================================");

    } catch (error) {

        console.error("========================================");
        console.error("       MONGODB CONNECTION FAILED");
        console.error("========================================");
        console.error(error.message);

        // Stop the server if the database cannot connect.
        process.exit(1);
    }
};


module.exports = connectDB;