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
    year: 22
};

// GET all Projects
router.get("/", levelCheck, (req, res, next) => {
    Project.find()
        .then((projectsFromDB) => {
            res.json({ projects: projectsFromDB, message: "Projects router working!" });
            // Create React page to display all Projects to User
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

// GET route for form to CREATE new Project from Lead
router.get("/create", levelCheck, (req, res, next) => {
    Lead.find()
        .then((leadsFromDb) => {
            res.json({ 
                leadsFromDB: leadsFromDb,
                message: "GET-ting /projects/create form!", 
            });
            // Build React form to CREATE new Project
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

// GET route for individual Project
router.get("/project/:projectId", levelCheck, (req, res, next) => {
    Project.findById(req.params.projectId)
        .then((projectFromDb) => {
            res.json({
                projectFromDb: projectFromDb,
                message: "Individual project found!"
            });
        })
        .catch((err) => {
            res.json({ message: err });
        });
})

// POST route to CREATE new Project from scratch, not an existing Lead
router.post("/create", levelCheck, (req, res, next) => {
    let leadData = {
        ...req.body,
        createdBy: req.user._id,
    }

    Project.find()
        .then((allProjects) => {
            jobNumber.job = allProjects.length + 1;

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
                                            res.json({ 
                                                createdProject: createdProject,
                                                message: "Project created!", 
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
                            res.json({ message: err });
                        });
        
                })
                .catch((err) => {
                    res.json({ error: err });
                });
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

// POST route to CREATE new Project from existing lead
router.post("/create/:leadId", levelCheck, (req, res, next) => {
    Project.find()
    .then((allProjects) => {
        jobNumber.job = allProjects.length + 1;
        Lead.findById(req.params.leadId)
        .then((foundLead) => {
            const projectData = {
                ...req.body,
                number: `${jobNumber.year}-${jobNumber.job}`,
                lead: req.params.leadId,
                createdBy: req.user._id,
            };

            let currentEstimatorId = foundLead.estimator[0];
            if (!req.body.estimator) {projectData.estimator = currentEstimatorId;};

            if (req.body.estimator !== currentEstimatorId) {
                User.findByIdAndUpdate(
                    currentEstimatorId,
                    {
                        $pull: { leads: req.params.leadId }
                    },
                    {new: true},
                )
                .then(() => {
                    console.log("User updated - lead deleted!");
                    User.findByIdAndUpdate(
                        req.body.estimator,
                        {
                            $push: { leads: req.params.leadId }
                        },
                        {new: true},
                    )
                    .then(() => {
                        console.log("User updated - lead added!");
                        Lead.findByIdAndUpdate(
                            req.params.leadId,
                            {
                                $pull: { users: currentEstimatorId }
                            },
                            {new: true},
                        )
                        .then(() => {
                            console.log("Lead updated - user deleted!");
                            Lead.findByIdAndUpdate(
                                req.params.leadId,
                                {
                                    $push: { users: req.body.estimator }
                                },
                                {new: true},
                            )
                            .then(() => {
                                console.log("Lead updated - user added!");
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
                        res.json({ message: err });
                    });
                })
                .catch((err) => {
                    res.json({ message: err });
                });
            }

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
                            res.json({ 
                                createdProject: createdProject,
                                message: "Project created from existing lead!",
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
                    res.json({ message: err });
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

// POST route to UPDATE a Project
router.post("/update/:projectId", levelCheck, (req, res, next) => {
    let currentEstimator, currentLead;
    let updateProjectData = {
        ...req.body,
    };

    Project.findById(req.params.projectId)
        .then((foundProject) => {
            currentEstimator = foundProject.estimator[0];
            currentLead = foundProject.lead[0];

            if (updateProjectData.estimator !== currentEstimator) {
                User.findByIdAndUpdate(
                    currentEstimator,
                    {
                        $pull: { projects: req.params.projectId }
                    },
                    { new: true },
                )
                .then(() => {
                    console.log("User updated - project deleted!");
                    Project.findByIdAndUpdate(
                        req.params.projectId,
                        {
                            $pull: { users: currentEstimator }
                        },
                        { new: true },
                    )
                    .then(() => {
                        console.log("Project updated - user deleted!");
                        User.findByIdAndUpdate(
                            updateProjectData.estimator,
                            {
                                $push: { projects: req.params.projectId }
                            },
                            { new: true },
                        )
                        .then(() => {
                            console.log("User updated - project added!");

                            Project.findByIdAndUpdate(
                                req.params.projectId,
                                {
                                    $push: { users: updateProjectData.estimator }
                                },
                                { new: true },
                            )
                            .then(() => {
                                console.log("Project updated - user added!");
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
                        res.json({ message: err });
                    });
                })
                .catch((err) => {
                    res.json({ message: err });
                });
            };

            if (updateProjectData.lead !== currentLead) {
                Lead.findByIdAndUpdate(
                    currentLead,
                    {
                        $pull: { projects: req.params.projectId }
                    },
                    { new: true },
                )
                .then(() => {
                    console.log("Lead updated - project deleted!");
                    Project.findByIdAndUpdate(
                        req.params.projectId,
                        {
                            $pull: { leads: currentLead }
                        },
                        { new: true },
                    )
                    .then(() => {
                        console.log("Project updated - lead deleted!");
                        Lead.findByIdAndUpdate(
                            updateProjectData.lead,
                            {
                                $push: { projects: req.params.projectId }
                            },
                            { new: true },
                        )
                        .then(() => {
                            console.log("Lead updated - project added!")
                            Project.findByIdAndUpdate(
                                req.params.projectId,
                                {
                                    $push: { leads: updatedProjectData.lead }
                                },
                                { new: true },
                            )
                            .then(() => {
                                console.log("Project updated - lead added!");
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
                        res.json({ message: err });
                    });
                })
                .catch((err) => {
                    res.json({ message: err });
                });
            }

            Project.findByIdAndUpdate(
                req.params.projectId, updateProjectData,
                { new: true },
            )
                .then((updatedProject) => {
                    res.json({
                        updatedProject: updatedProject,
                        message: "Project updated successfully!",
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
                            res.json({ message: "Project successfully deleted!" });
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
                res.json({ message: err });
            });
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

module.exports = router;