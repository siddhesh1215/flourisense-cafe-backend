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