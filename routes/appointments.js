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
    
})

module.exports = router;
