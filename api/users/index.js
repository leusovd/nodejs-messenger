const { Router } = require('express');
const router = new Router();

const { validate } = require('../../middlewares/index.js');
const { createValidation, updateValidation } = require('./users.validations');
const { getAll, createOne, updateOne } = require('./users.controller');

router.get('/', getAll);
router.post('/create', validate(createValidation), createOne);
router.patch('/update/:id', validate(updateValidation), updateOne);

module.exports = router;