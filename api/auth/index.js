const { Router } = require("express");
const passport = require("passport");
const router = new Router();

const { validate } = require("../../middlewares/index.js");
const { authUserValidation } = require("./auth.validations");
const { authLogin, authLogout } = require("./auth.controller");

router.post(
    "/login",
    validate(authUserValidation),
    passport.authenticate("local", {
        passReqToCallback: true,
        successRedirect: "/"
    }),
    authLogin
);
router.post("/logout", authLogout);

module.exports = router;
