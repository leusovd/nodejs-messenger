const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const { Strategy } = require("passport-local");
const { compareSync } = require("bcryptjs");
const UserModel = require("../api/users/users.model");
const { requestInfo } = require("../middlewares/index.js");
const { authGuard } = require("../middlewares/index.js");

const router = new express.Router();

if (process.env.NODE_ENV === "dev") {
    router.use(requestInfo);
}

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.use("/assets", require("./assets.js"));

// Cookie-session
router.use(
    session({
        secret: "d41d8cd98f00b204e9800998ecf8427e",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours,
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            stringify: false,
        }),
    })
);

passport.use(
    'local',
    new Strategy(
        {
            usernameField: "email",
            passReqToCallback: true,
        },
        async (req, email, password, cb) => {
            const user = await UserModel.findOne({ email })
                .select("password")
                .lean()
                .exec();

            if (!user || !compareSync(password, user.password)) {
                cb({ status: 404, message: "User not found" });
            }

            cb(null, user._id);
        }
    )
);

passport.serializeUser((userId, cb) => {
    cb(null, userId);
});

passport.deserializeUser(async (userId, cb) => {
    const user = await UserModel.findOne({ _id: userId }).lean().exec();

    cb(null, user);
});

router.use(passport.initialize());
router.use(passport.session());

router.use("/", require("./pages.js"));
router.use("/admin", authGuard, require("./admin.js"));
router.use("/api", require("../api/index.js"));

module.exports = router;
