const { Router } = require('express');
const router = new Router();

const { validate, handleMessagesQueryParams } = require('../../middlewares/index.js');
const { messagePostValidation, messageUpdateValidation } = require('./messages.validations');
const { getAll, postOne, updateOne, deleteOne, deleteAll } = require('./messages.controller');

router.post('/post', validate(messagePostValidation), postOne);
router.patch('/update/:id', validate(messageUpdateValidation), updateOne);
router.delete('/delete', deleteAll);
router.delete('/delete/:id', deleteOne);
router.get('/', handleMessagesQueryParams, getAll);

module.exports = router;