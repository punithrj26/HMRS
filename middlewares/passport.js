const LocalStrategy = require("passport-local").Strategy;

const bcrypt = require("bcryptjs");
// const passport = require("passport");

const USERSCHEMA = require("../Model/Auth");

module.exports = passport => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        //check emaill is present or not
        let user = await USERSCHEMA.findOne({ email });
        if (!user) {
          return done(null, false, { message: "User not exits" });
        }
        //Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (!isMatch) {
            return done(null, false, { message: "Password is not match" });
          } else {
            return done(null, user);
          }
        });
      }
    )
  );
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function (id, done) {
    USERSCHEMA.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
