// declaring requirements
const express = require("express");
const router = express.Router();
const axios = require("axios");

// requiring our User model to interact with database
const User = require("../models/User.model");

// requiring our middleware to check user's level
const levelCheck = require("../middleware/levelCheck");

// const getTokenAuthCall = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?
//     client_id=" + process.env.CLIENT_ID + "
//     &response_type=code
//     &redirect_uri=" +  process.env.CALLBACK_URI + "
//     &response_mode=form_post
//     &scope=offline_access%20user.read%20mail.read%20calendar.readwrite
//     &state=05252013";

router.post("/authorize", levelCheck, (req, res, next) => {
    console.log("oauth called");
    axios.get(getTokenAuthCall)
        .then((response) => {
            console.log(response);
            res.json({ response });
        })
        .catch((err) => {
            res.json({ message: err });
        });
})

module.exports = router;