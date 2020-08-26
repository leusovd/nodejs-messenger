const joi = require('@hapi/joi');
const { Segments } = require('celebrate');

exports.messagePostValidation = {
    [Segments.BODY]: {
        text: joi.string().required().trim()
    }
}

exports.messageUpdateValidation = {
    [Segments.BODY]: {
        text: joi.string().required()
    }
}