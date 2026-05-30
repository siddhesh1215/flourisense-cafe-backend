const Joi = require('joi');

// ─── SHARED HELPER ────────────────────────────────────────────────────────────
const fail = (res, message) =>
  res.status(400).json({ status: false, message, data: null });

// ─── ID PARAMETER VALIDATION ──────────────────────────────────────────────────
module.exports.validateId = (req, res, next) => {
  const schema = Joi.object({ id: Joi.number().integer().positive().required() });
  const { error } = schema.validate({ id: parseInt(req.params.id) });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── GET ALL FEEDBACK VALIDATION ──────────────────────────────────────────────
module.exports.getAll = (req, res, next) => {
  const schema = Joi.object({
    page:   Joi.number().integer().min(1).optional(),
    limit:  Joi.number().integer().min(1).max(100).optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
    search: Joi.string().max(255).optional().allow(''),
  });

  const { error } = schema.validate(req.query, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── UPDATE STATUS BODY VALIDATION ────────────────────────────────────────────
module.exports.updateStatus = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid('active', 'inactive', 'resolved').required(),
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};
