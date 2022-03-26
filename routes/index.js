var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({ title: "First Line of Da Fence" });
});

module.exports = router;
