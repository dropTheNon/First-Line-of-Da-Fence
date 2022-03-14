// declaring requirements
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

// requiring our models to interact with database
const User = require("../models/User.model");
const Lead = require("../models/Lead.model");
const Project = require("../models/Project.model");

// requiring our middleware to check user's level
const levelCheck = require("../middleware/levelCheck");

// GET all Projects
router.get("/", levelCheck, (req, res, next) => {
    Project.find()
        .then((projectsFromDB) => {
            res.status(200).json({ projects: projectsFromDB, message: "Projects router working!" });
            // Create React page to display all Projects to User
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

module.exports = router;