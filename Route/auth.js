const { Router } = require("express");
const bcrypt = require("bcryptjs");
const USERSCHEMA = require("../Model/Auth");
const passport = require("passport");
const router = Router();
/*@ HTTP GET REQUEST
@ACCESS PUBLIC
@URL /auth/register
*/
router.get("/register", (req, res) => {
  res.render("../views/auth/register", {});
});

/*@ HTTP GET REQUEST
@ACCESS PUBLIC
@URL /auth/login
*/
router.get("/login", (req, res) => {
  res.render("../views/auth/login", {});
});

/*@ HTTP GET REQUEST
@ACCESS PRIVATE
@URL /auth/logout
*/
router.get("/logout", async (req, res) => {
  req.logout();
  req.flash("SUCCESS_MESSAGE", "Successfuly logged out");
  res.redirect("/auth/login", 302, {});
});

/*@ HTTP POST REQUEST
@ACCESS PUBLIC
@URL /auth/register
*/
router.post("/register", async (req, res) => {
  let { username, email, password, password1 } = req.body;

  //server side
  let errors = [];
  if (!username) {
    errors.push({ text: "username is required" });
  }
  if (username.length < 6) {
    errors.push({ text: "username minimum 6 char" });
  }
  if (!email) {
    errors.push({ text: "email is required" });
  }
  if (!password) {
    errors.push({ text: "password is required" });
  }
  if (password !== password1) {
    errors.push({ text: "password is not match" });
  }
  if (errors.length > 0) {
    res.render("../views/auth/register", {
      errors,
      username,
      email,
      password,
      password1,
    });
  } else {
    // req.flash("SUCCESS_MESSAGE", "Registered successfully");
    // res.redirect("/employee/home", 302, {});
    // res.send("ok");
    let user = await USERSCHEMA.findOne({ email });
    if (user) {
      req.flash("ERROR_MESSAGE", "Email already exists");
      res.redirect("/auth/register", 302, {});
    } else {
      let newUser = new USERSCHEMA({
        username,
        email,
        password,
      });

      bcrypt.genSalt(12, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newUser.password, salt, async (err, hash) => {
          if (err) throw err;
          newUser.password = hash;

          await newUser.save();
          req.flash("SUCCESS_MESSAGE", "Successfully Registered");
          res.redirect("/auth/login", 302, {});
        });
      });
    }
  }
});

/* @ HTTP POST METHOD
    @ ACCESS PUBLIC
    @ URL /auth/login
*/

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/employee/emp-profile",
    // failureRedirect: "/employee/home",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
});

module.exports = router;
