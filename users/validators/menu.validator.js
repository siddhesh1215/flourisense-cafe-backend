const Joi = require('joi');
const { badRequest } = require('../../utils/response.helper');

// ─── Create Menu Item ─────────────────────────────────────────────────────────
const createMenu = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional().allow('', null),
    price: Joi.number().precision(2).positive().required(),
    image: Joi.string().uri().optional().allow('', null),
    category_id: Joi.number().integer().positive().required(),
    is_available: Joi.boolean().optional(),
    is_popular: Joi.boolean().optional(),
    display_order: Joi.number().integer().min(0).optional(),
    user: Joi.any().optional(), // injected by JWT middleware
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return badRequest(res, error.details.map((d) => d.message).join(', '));
  }
  next();
};

// ─── Update Menu Item ─────────────────────────────────────────────────────────
const updateMenu = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional().allow('', null),
    price: Joi.number().precision(2).positive().optional(),
    image: Joi.string().uri().optional().allow('', null),
    category_id: Joi.number().integer().positive().optional(),
    is_available: Joi.boolean().optional(),
    is_popular: Joi.boolean().optional(),
    display_order: Joi.number().integer().min(0).optional(),
    user: Joi.any().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return badRequest(res, error.details.map((d) => d.message).join(', '));
  }
  next();
};

module.exports = { createMenu, updateMenu };
