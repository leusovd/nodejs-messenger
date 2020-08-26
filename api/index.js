const { Router } = require('express');
const { authGuard } = require('../middlewares/index');
const router = new Router();

router.use('/auth', require('./auth/index.js'));
router.use('/users', require('./users/index.js'));
router.use('/messages', authGuard, require('./messages/index.js'));

// Global error handler
router.use((err, req, res, next) => {
    let e = { message: "" };

    if (err.joi) {
        console.error('Joi error', err);
        e = err.joi.details;
    } else if (err.name === "MongoError") {
        e.message = err.errmsg;
    } else {
        e = err;
    }

    if(!Array.isArray(e)) {
        e = [e];
    }

    res.status(e.status || 400).send(e);
});

module.exports = router;