const Joi = require('joi');

const isValidPhone = (phone) => /^\d{10}$/.test(phone);

module.exports.register = async (request, response, next) => {
    // Validation logic can be added here if needed
    next();
};

/**
 * Validate body for PUT /user/auth/profile
 * Allowed: name, phone
 * Email is intentionally NOT updatable here (requires re-verification).
 */
module.exports.updateProfile = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().trim().min(2).max(100).optional()
            .messages({
                'string.min': 'Name must be at least 2 characters',
                'string.max': 'Name cannot exceed 100 characters',
            }),
        phone: Joi.string().pattern(/^\d{10}$/).optional().allow('', null)
            .messages({
                'string.pattern.base': 'Phone number must be exactly 10 digits',
            }),
        // injected by JWT middleware
        user: Joi.any().optional(),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map((d) => d.message).join(', '),
            data: null,
        });
    }
    next();
};

/**
 * Validate body for PUT /user/auth/change-password
 */
module.exports.changePassword = (req, res, next) => {
    const schema = Joi.object({
        current_password: Joi.string().required()
            .messages({ 'any.required': 'Current password is required' }),
        new_password: Joi.string().min(6).required()
            .messages({
                'string.min': 'New password must be at least 6 characters',
                'any.required': 'New password is required',
            }),
        confirm_password: Joi.any().valid(Joi.ref('new_password')).required()
            .messages({
                'any.only': 'Passwords do not match',
                'any.required': 'Please confirm your new password',
            }),
        // injected by JWT middleware
        user: Joi.any().optional(),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map((d) => d.message).join(', '),
            data: null,
        });
    }
    next();
};