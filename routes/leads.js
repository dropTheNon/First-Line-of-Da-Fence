// declaring requirements
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

// requiring our models to interact with database
const User = require("../models/User.model");
const Lead = require("../models/Lead.model");

// requiring our middleware to check user's level
const levelCheck = require("../middleware/levelCheck");

router.get("/", levelCheck, (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: "Not logged in" });
    }
    res.json({ message: "leads router working!" });

    // Create & call React form to let users view & create new leads
});

router.post("/create", levelCheck, (req, res, next) => {
    Lead.create(req.body)
        .then((createdLead) => {
            User.findByIdAndUpdate(
                req.user._id,
                {
                    $push: { leads: createdLead._id },
                },
                { new: true }
            )
            .then((updatedUser) => {
                req.user = updatedUser;

                Lead.findByIdAndUpdate(
                    createdLead._id,
                    {
                        $push: { createdBy: req.user._id },
                    },
                    { new: true }
                )
                .then((updatedLead) => {
                    res.json({ 
                        user: updatedUser,
                        "lead created": updateLead
                    });
                })
                .catch((err) => {
                    res.json({ message: err });
                });
            })
            .catch((err) => {
                res.json({ message: err });
            });

        })
        .catch((err) => {
            res.json({ error: err });
        })
})

module.exports = router;