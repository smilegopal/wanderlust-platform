const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsyc = require("../utils/wrapAsyc");
const passport = require("passport");

const { isLoggedIn, saveRedirectUrl } = require("./middleware.js");
const UserControllers = require("../controllers/users.js");

router
  .route("/signup")
  .get(UserControllers.renderSignupForm)
  .post(wrapAsyc(UserControllers.signup));

router
  .route("/login")
  .get(UserControllers.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    UserControllers.login
  );

router.get("/logout", UserControllers.logout);

// ✅ Profile
router.get("/profile", isLoggedIn, UserControllers.profilePage);

// ✅ Delete Account
router.post("/delete", isLoggedIn, wrapAsyc(UserControllers.deleteAccount));

// ✅ Host View Bookings
router.get("/host/bookings", isLoggedIn, wrapAsyc(UserControllers.hostBookings));

module.exports = router;
