const { Router } = require('express');
const { authGuardReverse } = require('../middlewares/index.js');
const router = new Router();

router.get("/", (req, res) => {
    res.render("pages/home.njk", {
        title: "Messenger",
        active: "home",
        user: req.user,
    });
});

router.get("/login", authGuardReverse, (req, res) => {
    res.render("pages/login.njk", { title: "Login Page", active: "login" });
});

router.get("/register", authGuardReverse, (req, res) => {
    res.render("pages/register.njk", {
        title: "Registration Page",
        active: "register",
    });
});

module.exports = router;