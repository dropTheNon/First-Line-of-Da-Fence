var express = require("express");
var router = express.Router();

const mongoose = require("mongoose");

// requiring our models to interact with database
const User = require("../models/User.model");
const Lead = require("../models/Lead.model");

// requiring our middleware to check user's level
const levelCheck = require("../middleware/levelCheck");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.json("hitting users route");
});

router.get("/user/:userId", levelCheck, (req, res, next) => {
  User.findById(req.params.userId)
  .then((userFromDB) => {
      console.log(userFromDB);
      return userFromDB;
  })
  .catch((err) => {
      res.json({ error: err, message: "Lead not found" });
  });
})

module.exports = router;
