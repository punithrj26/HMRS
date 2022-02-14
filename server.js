const express = require("express");
const { connect } = require("mongoose");
const { engine } = require("express-handlebars");
const Handlebars = require("handlebars");
const { PORT, MONGODB_URL } = require("./config");
const passport = require("passport"); //for geting auth from db
require("./middlewares/passport")(passport);
var methodOverride = require("method-override");
const { join } = require("path");
const flash = require("connect-flash");
const session = require("express-session");
//IMPORT ALL ROUTING MODULE
const EmployeeRoute = require("./Route/employee");
const AuthRoute = require("./Route/auth");

const app = express();

// =================DATABASE CONNECTION STARTS HERE==================
let DatabaseConnection = async () => {
  await connect(MONGODB_URL);
  console.log("Database connected");
};
DatabaseConnection();
// ==================DATABASE CONNECTION ENDS HERE==================

// =================TEMPLATE ENGINE MIDDLEWARE STARTS HERE=========
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
// =================TEMPLATE ENGINE MIDDLEWARE ENDS HERE=========

// ============BUILT-IN MIDDLEWARES STARTS HERE=========
app.use(express.static(join(__dirname, "public")));
app.use(express.static(join(__dirname, "node_modules")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// ============BUILT-IN MIDDLEWARES ENDS HERE=========

//session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//connect flash middleware
app.use(flash());

//HANDLEBARS HELPER CLASSES
Handlebars.registerHelper("trimString", function (passedString) {
  var theString = passedString.slice(6);
  return new Handlebars.SafeString(theString);
});

Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

//SET GLOBAL VARIABLES
app.use(function (req, res, next) {
  res.locals.SUCCESS_MESSAGE = req.flash("SUCCESS_MESSAGE");
  res.locals.ERROR_MESSAGE = req.flash("ERROR_MESSAGE");
  res.locals.errors = req.flash("errors");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  let userData = req.user || null;
  res.locals.finalData = Object.create(userData);
  res.locals.username = res.locals.finalData.username;
  next();
});

//ROUTING PATH ALWAYS ABOVE LISTENER
app.use("/employee", EmployeeRoute);
app.use("/auth", AuthRoute);

//listen port
app.listen(PORT, err => {
  if (err) throw err;
  console.log(`App is running on port number : ${PORT}`);
});
