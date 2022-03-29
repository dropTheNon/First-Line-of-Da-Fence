const express = require("express");
const router = express.Router();

const passport = require("passport");
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");

const SALT_ROUNDS = 10;

// require the user model !!!!
const User = require("../models/User.model");

router.post("/signup", (req, res, next) => {
  console.log("req.body: ", req.body)
  const { username, password, name, level } = req.body;

  if (!username || !password || !name) {
    res.json({ message: "Provide username, name, and password" });
    return;
  }

  // make sure passwords are strong:
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.json({
      errorMessage:
        "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  bcryptjs
    .genSalt(SALT_ROUNDS)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        // username: username
        username,
        name,
        // password => this is the key from the User model
        //     ^
        //     |            |--> this is placeholder (how we named returning value from the previous method (.hash()))
        password: hashedPassword,
        level,
      });
    })
    .then((userFromDB) => {
      console.log("Newly created user is: ", userFromDB);
      req.login(userFromDB, (err) => {
        if (err) {
          res.json({ message: "Session save went bad." });
          return;
        }
  
        // We are now logged in (that's why we can also send req.user)
        res.json(userFromDB);
      });
      // Send the user's information to the frontend
      // We can use also: res.json(req.user);
      // res.json(userFromDB);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.json({ errorMessage: error.message });
      } else if (error.code === 11000) {
        res.json({
          errorMessage:
            "Username and email need to be unique. Either username or email is already used.",
        });
      } else {
        next(error);
      }
    }); // close .catch()
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, theUser, failureDetails) => {
    if (err) {
      res.json({ message: "Something went wrong authenticating user" });
      return;
    }

    if (!theUser) {
      // "failureDetails" contains the error messages
      // from our logic in "LocalStrategy" { message: '...' }.
      res.json(failureDetails);
      return;
    }

    // save user in session
    req.login(theUser, (err) => {
      if (err) {
        res.json({ message: "Session save went bad." });
        return;
      }

      // We are now logged in (that's why we can also send req.user)
      res.json(theUser);
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  // req.logout() is defined by passport
  req.logout();
  res.json({ message: "Log out success!" });
});

router.get("/loggedin", (req, res, next) => {
  // req.isAuthenticated() is defined by passport
  if (req.isAuthenticated()) {
    console.log(req.user);
    res.json({
      user: req.user,
      message: "Authorized"
    }) 
  } else {
    res.json({ message: "Unauthorized" });
  }
});

module.exports = router;
