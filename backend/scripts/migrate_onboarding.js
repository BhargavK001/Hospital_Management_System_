const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Clinic = require("../models/Clinic");
const Doctor = require("../models/Doctor");
const Service = require("../models/Service");

const connectDB = async () => {
    try {
        // Attempt to use the URI from env, fallback to local if missing
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/hospital_auth";
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const migrate = async () => {
    await connectDB();

    try {
        const clinics = await Clinic.find({});
        console.log(`Found ${clinics.length} clinics. Starting migration...`);

        for (const clinic of clinics) {
            console.log(`Processing Clinic: ${clinic.name} (${clinic._id})`);

            // 1. Migrate Doctors
            if (clinic.doctors && clinic.doctors.length > 0) {
                console.log(`  Found ${clinic.doctors.length} embedded doctors.`);

                for (const doc of clinic.doctors) {
                    // Check if doctor already exists for this clinic (by name matching)
                    const nameParts = doc.name ? doc.name.trim().split(' ') : ['Doctor'];
                    const firstName = nameParts[0];
                    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

                    const existingDoc = await Doctor.findOne({
                        clinicId: clinic._id,
                        firstName: firstName,
                        lastName: lastName
                    });

                    if (!existingDoc) {
                        console.log(`    Creating Doctor: ${doc.name}`);

                        // Generate a unique dummy email if not present, to avoid Unique Index collision
                        // We use a timestamp to ensure uniqueness
                        const dummyEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}_${Math.floor(Math.random() * 1000)}@clinic.local`;

                        await Doctor.create({
                            firstName,
                            lastName,
                            clinicId: clinic._id,
                            clinic: clinic.name,
                            specialization: doc.specialty,
                            qualification: doc.qualifications,
                            experienceYears: doc.experience,
                            avatar: doc.photo,
                            status: "Active",
                            approvalStatus: "approved",
                            email: dummyEmail
                        });
                    } else {
                        console.log(`    Doctor already exists: ${doc.name}`);
                    }
                }
            } else {
                console.log(`  No embedded doctors found.`);
            }

            // 2. Migrate Services
            if (clinic.services && clinic.services.length > 0) {
                console.log(`  Found ${clinic.services.length} embedded services.`);

                for (const service of clinic.services) {
                    const existingService = await Service.findOne({
                        clinicId: clinic._id,
                        name: service.name
                    });

                    if (!existingService) {
                        console.log(`    Creating Service: ${service.name}`);
                        await Service.create({
                            name: service.name,
                            description: service.description,
                            charges: service.price || 0,
                            duration: service.duration || 30,
                            clinicId: clinic._id,
                            clinicName: clinic.name,
                            active: true,
                            category: "General"
                        });
                    } else {
                        console.log(`    Service already exists: ${service.name}`);
                    }
                }
            } else {
                console.log(`  No embedded services found.`);
            }
        }

        console.log("Migration completed successfully.");
        process.exit(0);

    } catch (err) {
        console.error("Migration Error:", err);
        process.exit(1);
    }
};

migrate();
