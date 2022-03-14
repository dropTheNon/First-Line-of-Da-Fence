// declaring requirements
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

// requiring our models to interact with database
const User = require("../models/User.model");
const Lead = require("../models/Lead.model");

// requiring our middleware to check user's level
const levelCheck = require("../middleware/levelCheck");

// GET all Leads
router.get("/", levelCheck, (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: "Not logged in" });
    }

    Lead.find()
        .then((leadsFromDB) => {
            res.status(200).json({ leadsFromDB });
        })
        .catch((err) => {
            res.status(500).json({ message: err} );
        });

    // Create & call React form to let users view & create new leads
});

// POST route to CREATE new Lead
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
                    res.status(200).json({ 
                        user: updatedUser,
                        "lead created": updatedLead
                    });
                })
                .catch((err) => {
                    res.status(500).json({ message: err });
                });
            })
            .catch((err) => {
                res.status(500).json({ message: err });
            });

        })
        .catch((err) => {
            res.status(500).json({ error: err });
        })
});

// GET individual Lead to READ
router.get("/lead/:leadId", levelCheck, (req, res, next) => {
    Lead.findById(req.params.leadId)
        .then((leadFromDB) => {
            res.status(200).json({ leadFromDB });
            // Create React form to display Lead to User
        })
        .catch((err) => {
            res.status(500).json({ error: err, message: "Lead not found" });
        });
})

// GET individual Lead to UPDATE
router.get("/update/:leadId", levelCheck, (req, res, next) => {
    Lead.findById(req.params.leadId)
        .then((leadFromDB) => {
            res.status(200).json({ leadFromDB });
            // Display React form to update this Lead
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
})

// POST route to UPDATE individual Lead
router.post("/update/:leadId", levelCheck, (req, res, next) => {
    Lead.findByIdAndUpdate(
        req.params.leadId,
        {
            ...req.body,
        }
    )
    .then((updatedLead) => {
        res.status(200).json({ updatedLead });
    })
    .catch((err) => {
        res.status(500).json({ message: err });
    });
});

// POST route to DELETE individual Lead

router.post("/delete/:leadId", levelCheck, (req, res, next) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: { leads: req.params.leadId }
        },
        { new: true }
    )
    .then((updatedUser) => {
        req.user = updatedUser;

        Lead.findByIdAndDelete(req.params.leadId)
            .then(() => {
                res.status(200).json({ message: "Lead deleted!" });
            })
            .catch((err) => {
                res.status(500).json({ message: err });
            });
    })
    .catch((err) => {
        res.status(500).json({ message: err });
    });
});

module.exports = router;