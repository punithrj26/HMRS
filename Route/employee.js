//router level middleware
// const express = require('express').Router();
const { Router } = require("express");
const router = Router();
const multer = require("multer");
const EMPLOYEE = require("../Model/Employee");
const { ensureAuthenticated } = require("../helper/auth_helper");

//load multer middleware
let { storage } = require("../middlewares/multer");

const upload = multer({ storage: storage });

/* @ HTTP GET METHOD    
   @ ACCESS PUBLIC
   @ URL employee/home
*/
router.get("/home", async (req, res) => {
  // res.render("../views/home", { title: "Home Page" });
  let payload = await EMPLOYEE.find({}).lean();
  res.render("../views/home", { title: "Home page", payload });
});

// router.get("/welcome", (req, res) => {
//   res.render("../views/welcome", { title: "Welcome" });
// });

/*@HTTP GET METHOD
  @ACCESS PRIVATE
  @URL employee/emp-profile
*/

router.get("/emp-profile", ensureAuthenticated, async (req, res) => {
  let payload = await EMPLOYEE.find({ user: req.user.id }).lean();
  res.render("../views/employees/emp-profile", { title: "Home page", payload });
});

/* @ HTTP GET METHOD
   @ ACCESS PRIVATE
   @ URL employee/create-emp
*/
router.get("/create-emp", ensureAuthenticated, (req, res) => {
  res.render("../views/employees/create-emp", { title: "create employee" });
});

// FETCH DATA FROM MONGODB DATABASE
/* @ HTTP GET METHOD  
   @ ACCESS PUBLIC
   @ URL employee/emp-profile
*/
router.get("/:id", async (req, res) => {
  let payload = await EMPLOYEE.findOne({ _id: req.params.id }).lean();
  res.render("../views/employees/employeeProfile", { payload });
});

/* @ HTTP GET METHOD
   @ ACCESS PRIVATE
   @ URL employee/edit-emp
*/
router.get("/edit-emp/:id", ensureAuthenticated, async (req, res) => {
  let editPayload = await EMPLOYEE.findOne({ _id: req.params.id }).lean();
  res.render("../views/employees/editEmp", { editPayload });
});

// router.post('/create-emp', (req, res) => {
// res.render("../views/employees/create-emp", { title: "create employee" });
router.post(
  "/create-emp",
  ensureAuthenticated,
  upload.single("emp_photo"),
  async (req, res) => {
    let payload = {
      emp_photo: req.file,
      emp_id: req.body.emp_id,
      emp_name: req.body.emp_name,
      emp_salary: req.body.emp_salary,
      emp_edu: req.body.emp_edu,
      emp_des: req.body.emp_des,
      emp_phone: req.body.emp_phone,
      emp_location: req.body.emp_location,
      emp_email: req.body.emp_email,
      emp_skills: req.body.emp_skills,
      emp_gender: req.body.emp_gender,
      emp_exp: req.body.emp_exp,
      user: req.user.id,
    };

    let body = await EMPLOYEE.create(payload);
    req.flash("SUCCESS_MESSAGE", "Profile created successfully");
    res.redirect("/employee/emp-profile", 302, { body });
    // await new EMPLOYEE(payload).save();
  }
);
// ==================END ALL GET METHOD=================

// ================PUT REQUEST STARTS HERE================
router.put("/edit-emp/:id", upload.single("emp_photo"), (req, res) => {
  EMPLOYEE.findOne({ _id: req.params.id })
    .then(editEmp => {
      // old                  new
      (editEmp.emp_photo = req.file),
        (editEmp.emp_id = req.body.emp_id),
        (editEmp.emp_name = req.body.emp_name),
        (editEmp.emp_salary = req.body.emp_salary),
        (editEmp.emp_edu = req.body.emp_edu),
        (editEmp.emp_des = req.body.emp_des),
        (editEmp.emp_phone = req.body.emp_phone),
        (editEmp.emp_location = req.body.emp_location),
        (editEmp.emp_email = req.body.emp_email),
        (editEmp.emp_skills = req.body.emp_skills),
        (editEmp.emp_gender = req.body.emp_gender),
        (editEmp.emp_exp = req.body.emp_exp);
      //update data in database
      editEmp.save().then(_ => {
        req.flash("SUCCESS_MESSAGE", "Profile edited successfully");
        res.redirect("/employee/home", 302, {});
      });
    })
    .catch(err => {
      req.flash("ERROR_MESSAGE", "Profile editing failed");
      console.log(err);
    });
});
// ================PUT REQUEST ENDS HERE================

// =================DELETE REQUEST STARTS HERE===============
router.delete("/delete-emp/:id", async (req, res) => {
  await EMPLOYEE.deleteOne({ _id: req.params.id });
  req.flash("SUCCESS_MESSAGE", "Profile deleted successfully");
  res.redirect("/employee/home", 302, {});
});
// =================DELETE REQUEST STARTS HERE===============

module.exports = router;
