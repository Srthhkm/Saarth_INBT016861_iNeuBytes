/* =========================================================
   HEALSPHERE - DEFAULT LANDING PAGE DOCTORS
   ========================================================= */

require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");
const Doctor = require("../models/doctorModel");
const Department = require("../models/departmentModel");
const User = require("../models/userModel");
const { hashPassword } = require("../utils/password");


const defaultDoctors = [
    {
        name: "Dr. Sunaina Sharma",
        email: "sunaina.sharma@healsphere.com",
        phone: "+91 98765 10001",
        department: {
            name: "Cardiology",
            description: "Diagnosis and treatment of heart and cardiovascular conditions."
        },
        qualification: "MBBS, MD",
        experience: 15,
        consultationFee: 1200,
        specialization: "Cardiologist",
        availability: "Mon - Sat, 9:00 AM - 2:00 PM",
        bio: "Dr. Sunaina Sharma provides evidence-based cardiovascular care with a focus on prevention, diagnosis and long-term heart health.",
        profileImage: "assets/images/femaledoc.png"
    },
    {
        name: "Dr. Shiva Reddy",
        email: "shiva.reddy@healsphere.com",
        phone: "+91 98765 10002",
        department: {
            name: "Neurology",
            description: "Diagnosis and treatment of disorders affecting the brain and nervous system."
        },
        qualification: "MBBS, DM",
        experience: 12,
        consultationFee: 1500,
        specialization: "Neurologist",
        availability: "Mon - Fri, 10:00 AM - 4:00 PM",
        bio: "Dr. Shiva Reddy specializes in the evaluation and management of neurological conditions, with an emphasis on clear communication and individualized care.",
        profileImage: "assets/images/maledoc.png"
    },
    {
        name: "Dr. Kamna Bakshi",
        email: "kamna.bakshi@healsphere.com",
        phone: "+91 98765 10003",
        department: {
            name: "Gynecology",
            description: "Comprehensive care for women's reproductive and gynecological health."
        },
        qualification: "MBBS, MS",
        experience: 14,
        consultationFee: 1300,
        specialization: "Gynecologist",
        availability: "Mon - Sat, 9:00 AM - 3:00 PM",
        bio: "Dr. Kamna Bakshi offers compassionate women's healthcare across preventive, reproductive and gynecological services.",
        profileImage: "assets/images/femaledoc.png"
    }
];


async function findOrCreateDepartment(departmentData) {
    let department = await Department.findOne({
        name: {
            $regex: `^${departmentData.name}$`,
            $options: "i"
        }
    });

    if (!department) {
        department = await Department.create({
            name: departmentData.name,
            description: departmentData.description,
            isActive: true
        });
    } else if (!department.isActive) {
        department.isActive = true;
        await department.save();
    }

    return department;
}


async function seedDefaultDoctors() {
    await connectDB();

    const defaultPassword =
        process.env.DEFAULT_DOCTOR_PASSWORD || "HealSphere@123";

    for (const doctorData of defaultDoctors) {
        const department = await findOrCreateDepartment(
            doctorData.department
        );

        let user = await User.findOne({
            email: doctorData.email
        });

        if (!user) {
            user = await User.create({
                name: doctorData.name,
                email: doctorData.email,
                phone: doctorData.phone,
                password: await hashPassword(defaultPassword),
                role: "doctor",
                isActive: true
            });
        } else {
            if (user.role !== "doctor") {
                throw new Error(
                    `Cannot seed ${doctorData.email}: the email belongs to a non-doctor user.`
                );
            }

            user.name = doctorData.name;
            user.phone = doctorData.phone;
            user.isActive = true;
            await user.save();
        }

        await Doctor.findOneAndUpdate(
            { user: user._id },
            {
                user: user._id,
                department: department._id,
                qualification: doctorData.qualification,
                experience: doctorData.experience,
                consultationFee: doctorData.consultationFee,
                specialization: doctorData.specialization,
                availability: doctorData.availability,
                bio: doctorData.bio,
                profileImage: doctorData.profileImage,
                isAvailable: true
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        console.log(`Seeded doctor: ${doctorData.name}`);
    }

    console.log("Default landing page doctors are ready.");
}


seedDefaultDoctors()
    .catch(error => {
        console.error("Default doctor seed failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
