// declaring requirements
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

// requiring our models to interact with database
const User = require("../models/User.model");
const Lead = require("../models/Lead.model");
const Appointment = require("../models/Appointment.model");

// requiring our middleware to check user's level
const levelCheck = require("../middleware/levelCheck");

// GET route to READ all Appointments
router.get("/", levelCheck, (req, res, next) => {
    Appointment.find()
        .then((appointmentsFromDb) => {
            res.json({ 
                appointmentsFromDb,
                message: "Appointments router working!",
            });
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

router.post("/create", levelCheck, (req, res, next) => {
    const appointmentData = {
        ...req.body,
    };

    Appointment.create(appointmentData)
        .then((createdAppt) => {
            // Need to first structure our appointment info the way we need it for API call
            const apptDataForAPI = {

            }

            // And then make our API call to save this in the right person's Outlook calendar
            
            
            res.json({
                createdAppt,
                message: "Appointment created!" 
            });
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

router.get("/appointment/:appointmentId", levelCheck, (req, res, next) => {
    Appointment.findById(req.params.appointmentId)
        .then((appointmentFromDb) => {
            res.json({
                appointmentFromDb,
                message: "Appointment found!",
            });
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

router.post("/update/:appointmentId", levelCheck, (req, res, next) => {
    console.log("update appt called");
    let updateAppointmentData = {
        ...req.body,
    };

    Appointment.findByIdAndUpdate(
        req.params.appointmentId, updateAppointmentData,
        { new: true },
    )
        .then((updatedAppt) => {
            console.log(updatedAppt);
            // Once API is working, we'll need to create call to API to update on Estimators calendar(s), 
            // potentially deleting from one's and adding to another's

            res.json({
                updatedAppt: updatedAppt,
                message: "Appointment updated successfully!",
            });
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

router.post("/delete/:appointmentId", levelCheck, (req, res, next) => {
    Appointment.findByIdAndDelete(req.params.appointmentId)
        .then(() => {
            // Will need to remove appointment from Estimator's calendar using API call
            // 
            res.json({ message: "Appointment deleted!" });
        })
        .catch((err) => {
            res.json({ message: err });
        });
})

module.exports = router;
