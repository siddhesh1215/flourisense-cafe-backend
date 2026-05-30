const Joi = require('joi');

/**
 * Validate admin registration
 */
module.exports.register = async (request, response, next) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(2).max(100).required(),
            email: Joi.string().email().required(),
            phone: Joi.string().min(10).max(20).required(),
            password: Joi.string().min(6).required(),
        });

        const { error, value } = schema.validate(request.body);

        if (error) {
            return response.status(400).json({
                status: false,
                message: error.details[0].message,
                data: null,
            });
        }

        next();
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: "Validation error",
            data: null,
        });
    }
};

/**
 * Validate OTP verification
 */
module.exports.verifyOTP = async (request, response, next) => {
    try {
        const schema = Joi.object({
            userId: Joi.number().required(),
            otp: Joi.string().length(6).required(),
        });

        const { error, value } = schema.validate(request.body);

        if (error) {
            return response.status(400).json({
                status: false,
                message: error.details[0].message,
                data: null,
            });
        }

        next();
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: "Validation error",
            data: null,
        });
    }
};

/**
 * Validate admin login
 */
module.exports.login = async (request, response, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });

        const { error, value } = schema.validate(request.body);

        if (error) {
            return response.status(400).json({
                status: false,
                message: error.details[0].message,
                data: null,
            });
        }

        next();
    } catch (error) {
        return response.status(500).json({
            status: false,
            message: "Validation error",
            data: null,
        });
    }
};

/**
 * Validate body for PUT /admin/auth/profile
 * Allowed: name, phone
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
        // injected by verifyAdminToken middleware
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
 * Validate body for PUT /admin/auth/change-password
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
        // injected by verifyAdminToken middleware
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