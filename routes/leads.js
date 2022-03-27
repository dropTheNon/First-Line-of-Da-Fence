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
        return res.json({ message: "Not logged in" });
    }

    Lead.find()
        .then((leadsFromDB) => {
            res.json({ 
                leadsFromDB,
                message: "All leads from database found!"
            });
        })
        .catch((err) => {
            res.json({ message: err} );
        });

    // Build React form to let users view Leads & button to CREATE new Lead
});

// GET route for form to CREATE new Lead
router.get("/create", levelCheck, (req, res, next) => {
    res.json({ message: "GET-ting /create route!" });
    // Build React form to let users create new leads
});

// POST route to CREATE new Lead
router.post("/create", levelCheck, (req, res, next) => {
    
    let newLead = {};
    Object.keys(req.body).forEach((prop) => {
      if (req.body[prop]) { newLead[prop] = req.body[prop]; }
    });

    Lead.create(newLead)
        .then((createdLead) => {

            if (req.body.estimator) {
                User.findByIdAndUpdate(
                    req.body.estimator,
                    {
                        $push: { leads: createdLead._id }
                    },
                    { new: true },
                )
                .then(() => {
                    console.log("User updated - lead added!");
                })
                .catch((err) => {
                    res.json({ message: err });
                });
            }
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
                        "lead created": updatedLead
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
        });
});

// GET individual Lead to READ
router.get("/lead/:leadId", levelCheck, (req, res, next) => {
    Lead.findById(req.params.leadId)
        .then((leadFromDB) => {
            return ({ leadFromDB });
            // Create React form to display Lead to User
        })
        .catch((err) => {
            res.json({ error: err, message: "Lead not found" });
        });
})

// GET individual Lead to UPDATE *** No need for this? Edit straight from ^^ this one ^^??
// router.get("/update/:leadId", levelCheck, (req, res, next) => {
//     Lead.findById(req.params.leadId)
//         .then((leadFromDB) => {
//             res.json({ leadFromDB });
//             // Display React form to update this Lead
//         })
//         .catch((err) => {
//             res.json({ message: err });
//         });
// })

// POST route to UPDATE individual Lead
router.post("/update/:leadId", levelCheck, (req, res, next) => {
    let currentEstimator;
    let updateLeadData = {
        ...req.body,
    }

    Lead.findById(req.params.leadId)
        .then((foundLead) => {
            currentEstimator = foundLead.estimator[0];

            if (updateLeadData.estimator !== currentEstimator) {
                User.findByIdAndUpdate(
                    currentEstimator,
                    {
                        $pull: { leads: req.params.leadId },
                    },
                    {new: true},
                )
                .then(() => {
                    console.log("User updated - lead deleted!");
                    User.findByIdAndUpdate(
                        updateLeadData.estimator,
                        {
                            $push: { leads: req.params.leadId },
                        },
                        {new: true},
                    )
                    .then(() => {
                        console.log("User updated - lead added!");
                    })
                    .catch((err) => {
                        res.json({ message: err });
                    });
                })
                .catch((err) => {
                    res.json({ message: err });
                });
            };

            Lead.findByIdAndUpdate(
                req.params.leadId,
                updateLeadData,
                {new: true}
            )
            .then((updatedLead) => {
                return ({ 
                    updatedLead,
                    message: "Lead successfully updated!" 
                });
            })
            .catch((err) => {
                res.json({ message: err });
            });
        })
        .catch((err) => {
            res.json({ message: err });
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
                res.json({ message: "Lead deleted!" });
            })
            .catch((err) => {
                res.json({ message: err });
            });
    })
    .catch((err) => {
        res.json({ message: err });
    });
});

module.exports = router;