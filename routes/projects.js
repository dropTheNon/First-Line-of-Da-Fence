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

// Declaring Job Number object, for tracking job #s
const jobNumber = {
    year: 22,
    job: 1,
};

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

// GET route for form to CREATE new Project from Lead
router.get("/create", levelCheck, (req, res, next) => {
    Lead.find()
        .then((leadsFromDb) => {
            res.status(200).json({ 
                leadsFromDB: leadsFromDb,
                message: "GET-ting /projects/create form!", 
            });
            // Build React form to CREATE new Project
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

// GET route for individual Project
router.get("/project/:projectId", levelCheck, (req, res, next) => {
    Project.findById(req.params.projectId)
        .then((projectFromDb) => {
            res.status(200).json({
                projectFromDb: projectFromDb,
                message: "Individual project found!"
            });
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
})

// POST route to CREATE new Project from scratch, not an existing Lead
router.post("/create", levelCheck, (req, res, next) => {
    let leadData = {
        ...req.body,
        createdBy: req.user._id,
    }
    Lead.create(leadData)
        .then((createdLead) => {
            let projectData = {
                ...req.body,
                number: `${jobNumber.year}-${jobNumber.job}`,
                createdBy: req.user._id,
                lead: createdLead._id,
            };
            Project.create(projectData)
                .then((createdProject) => {
                    jobNumber.job++;
                    User.findByIdAndUpdate(
                        createdProject.estimator[0],
                        {
                            $push: { 
                                leads: createdLead._id,
                                projects: createdProject._id,
                            },
                        },
                        { new: true }
                    )
                        .then(() => {        
                            Lead.findByIdAndUpdate(
                                createdLead._id,
                                {
                                    $push: { projects: createdProject._id },
                                },
                                { new: true }
                            )
                                .then(() => {
                                    res.status(200).json({ 
                                        createdProject: createdProject,
                                        message: "Project created!", 
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
                    res.status(500).json({ message: err });
                });

        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});

// POST route to CREATE new Project from existing lead
router.post("/create/:leadId", levelCheck, (req, res, next) => {
    let projectData = {
        ...req.body,
        number: `${jobNumber.year}-${jobNumber.job}`,
        lead: req.params.leadId,
        createdBy: req.user._id,
    };

    Project.create(projectData)
        .then((createdProject) => {
            console.log("createdProject: ", createdProject);
            Lead.findByIdAndUpdate(
                req.params.leadId,
                {
                    $push: { 
                        projects: createdProject._id, 
                    },
                },
                { new: true },
            )
            .then(() => {
                User.findByIdAndUpdate(
                    createdProject.estimator[0],
                    {
                        $push: {
                            projects: createdProject._id,
                        }
                    },
                    { new: true },
                )
                .then(() => {
                    res.status(200).json({ 
                        createdProject: createdProject,
                        message: "Project created from existing lead!",
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
            res.status(500).json({ message: err });
        });
});

// POST route to UPDATE a Project
router.post("/update/:projectId", levelCheck, (req, res, next) => {
    Project.findByIdAndUpdate(
        req.params.projectId,
        {
           ...req.body, 
        },
        { new: true },
    )
    .then((updatedProject) => {
        res.status(200).json({
            updatedProject: updatedProject,
            message: "Project updated successfully!",
        });
    })
    .catch((err) => {
        res.status(500).json({ message: err });
    });
});

// POST route to DELETE a Project
router.post("/delete/:projectId", levelCheck, (req, res, next) => {
    let leadId, estimatorId;
    
    Project.findById(req.params.projectId)
        .then((projectFromDb) => {
            leadId = projectFromDb.lead[0];
            estimatorId = projectFromDb.estimator[0];
            User.findByIdAndUpdate(
                estimatorId,
                {
                    $pull: { projects: req.params.projectId },
                },
                { new: true },
            )
            .then(() => {
                Lead.findByIdAndUpdate(
                    leadId,
                    {
                        $pull: { projects: req.params.projectId },
                    },
                    { new: true },
                )
                .then(() => {
                    Project.findByIdAndDelete(req.params.projectId)
                        .then(() => {
                            res.status(200).json({ message: "Project successfully deleted!" });
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
                res.status(500).json({ message: err });
            });
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

module.exports = router;