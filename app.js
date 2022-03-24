require("dotenv/config");

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const mongoose = require("mongoose");

var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth.routes");
var leadsRouter = require("./routes/leads");
var projectsRouter = require("./routes/projects");
var appointmentsRouter = require("./routes/appointments");
var oAuthRouter = require("./routes/oauth");

const cors = require("cors");

var app = express();

app.use(
  cors({
    credentials: true,
    // origin: process.env.ORIGIN || "http://localhost:3000",
    origin: true,
  })
);

const session = require("express-session");
const passport = require("passport");

// Passport initial setup
require("./config/passport");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(
  session({
    secret: "some secret goes here",
    resave: true,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/leads", leadsRouter);
app.use("/projects", projectsRouter);
app.use("/appointments", appointmentsRouter);
app.use("/oauth", oAuthRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/backend-api")
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });

module.exports = app;
