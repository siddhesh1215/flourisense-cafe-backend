const Joi = require('joi');

// ─── SHARED HELPER ────────────────────────────────────────────────────────────
const fail = (res, message) =>
  res.status(400).json({ status: false, message, data: null });

// ─── VALIDATE ID PARAM ────────────────────────────────────────────────────────
module.exports.validateId = (req, res, next) => {
  const schema = Joi.object({ id: Joi.number().integer().positive().required() });
  const { error } = schema.validate({ id: parseInt(req.params.id) });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── CREATE ADMIN VALIDATION ──────────────────────────────────────────────────
module.exports.createAdmin = (req, res, next) => {
  const schema = Joi.object({
    name:     Joi.string().trim().min(2).max(100).required(),
    email:    Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    phone:    Joi.string().optional().allow('', null),
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── UPDATE ADMIN VALIDATION ──────────────────────────────────────────────────
module.exports.updateAdmin = (req, res, next) => {
  const schema = Joi.object({
    name:  Joi.string().trim().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── TOGGLE ACTIVE VALIDATION ─────────────────────────────────────────────────
module.exports.toggle = (req, res, next) => {
  const schema = Joi.object({
    inactive: Joi.boolean().required(),
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── RESET PASSWORD VALIDATION ────────────────────────────────────────────────
module.exports.resetPassword = (req, res, next) => {
  const schema = Joi.object({
    new_password: Joi.string().min(6).max(128).required(),
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};
