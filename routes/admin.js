// declaring requirements
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

// requiring our models to interact with database
const User = require("../models/User.model");
const Lead = require("../models/Lead.model");
const Project = require("../models/Project.model");

// requiring our middleware to check user's level
const adminCheck = require("../middleware/adminCheck");

router.get("/", adminCheck, (req, res, next) => {
    User.find()
        .then((usersFromDb) => {
            res.json({
                usersFromDb,
                message: "Admin route working!",
            });
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

router.post("/update/:userId", adminCheck, (req, res, next) => {
    User.findByIdAndUpdate(
        req.params.userId,
        {
            ...req.body,
        },
        {new: true},
    )
    .then((updatedUser) => {
        res.json({ 
            updatedUser,
            message: "User successfully updated!",
        });
    })
    .catch((err) => {
        res.json({ message: err });
    });
});

module.exports = router;