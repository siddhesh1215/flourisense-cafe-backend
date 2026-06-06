const Joi = require('joi');

// ─── SHARED HELPER ────────────────────────────────────────────────────────────
const fail = (res, message) =>
  res.status(400).json({ status: false, message, data: null });

// ─── CREATE MENU ITEM VALIDATION ──────────────────────────────────────────────
module.exports.createMenu = (req, res, next) => {
  const schema = Joi.object({
    name:          Joi.string().trim().min(2).max(100).required(),
    price:         Joi.number().precision(2).positive().max(999999.99).required(),
    category_id:   Joi.number().integer().positive().required(),
    description:   Joi.string().optional().allow('', null),
    display_order: Joi.number().integer().min(0).optional(),
    is_popular:    Joi.boolean().optional(),
    is_available:  Joi.boolean().optional(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: true, stripUnknown: true });
  if (!error) req.body = value;
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── UPDATE MENU ITEM VALIDATION ──────────────────────────────────────────────
module.exports.updateMenu = (req, res, next) => {
  const schema = Joi.object({
    name:          Joi.string().trim().min(2).max(100).optional(),
    price:         Joi.number().precision(2).positive().max(999999.99).optional(),
    category_id:   Joi.number().integer().positive().optional(),
    description:   Joi.string().optional().allow('', null),
    display_order: Joi.number().integer().min(0).optional(),
    is_popular:    Joi.boolean().optional(),
    is_available:  Joi.boolean().optional(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: true, stripUnknown: true });
  if (!error) req.body = value;
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── UPDATE PRICE VALIDATION ──────────────────────────────────────────────────
module.exports.updatePrice = (req, res, next) => {
  const schema = Joi.object({
    price: Joi.number().precision(2).positive().max(999999.99).required(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: true, stripUnknown: true });
  if (!error) req.body = value;
  if (error) return fail(res, error.details[0].message);
  next();
};
