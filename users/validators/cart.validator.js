const Joi = require('joi');
const { badRequest } = require('../../utils/response.helper');

// ─── Add to Cart ──────────────────────────────────────────────────────────────
const addToCart = async (req, res, next) => {
  const schema = Joi.object({
    menu_item_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).max(100).required(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return badRequest(res, error.details.map((d) => d.message).join(', '));
  }
  next();
};

// ─── Update Cart Item ─────────────────────────────────────────────────────────
const updateCart = async (req, res, next) => {
  const schema = Joi.object({
    quantity: Joi.number().integer().min(1).max(100).required(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return badRequest(res, error.details.map((d) => d.message).join(', '));
  }
  next();
};

module.exports = { addToCart, updateCart };
