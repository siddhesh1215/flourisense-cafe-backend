const Joi = require('joi');
const { badRequest } = require('../../utils/response.helper');

// ─── Submit Feedback ──────────────────────────────────────────────────────────
// Note: name & email are NOT accepted from the body — they are sourced from the
// authenticated user's record in the database (auth is required on this route).
const submitFeedback = (req, res, next) => {
  const schema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required()
      .messages({
        'number.min': 'Rating must be at least 1',
        'number.max': 'Rating cannot exceed 5',
        'any.required': 'Rating is required',
      }),
    message: Joi.string().trim().max(1000).optional().allow('', null),
    location_id: Joi.number().integer().positive().optional().allow(null),
    order_id: Joi.number().integer().positive().optional().allow(null),
    // injected by JWT middleware — allowed through but not used directly
    user: Joi.any().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return badRequest(res, error.details.map((d) => d.message).join(', '));
  }
  next();
};

// ─── Get Public Feedback (query param validation) ─────────────────────────────
const getPublic = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
    location_id: Joi.number().integer().positive().optional(),
  });

  const { error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    return badRequest(res, error.details.map((d) => d.message).join(', '));
  }
  next();
};

module.exports = { submitFeedback, getPublic };
