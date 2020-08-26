const joi = require('@hapi/joi');
const { Segments } = require('celebrate');

exports.createValidation = {
    [Segments.BODY]: {
        email: joi.string().email().required(),
        password: joi.string().min(6).max(100).required(),
        repeatPassword: joi.string().min(6).max(100).required()
    }
}

exports.updateValidation = {
    [Segments.BODY]: {
        role: joi.string().valid('superadmin', 'admin', 'user'),
        accountState: joi.string().valid('active', 'deactivated'),
        permissions: joi.object({
            roleChange: joi.boolean(),
            accountsActivation: joi.boolean()            
        })
    }
}