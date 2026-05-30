const Joi = require('joi');

// ─── SHARED HELPER ────────────────────────────────────────────────────────────
const fail = (res, message) =>
  res.status(400).json({ status: false, message, data: null });

// ─── GET REVENUE VALIDATION ───────────────────────────────────────────────────
module.exports.getRevenue = (req, res, next) => {
  const schema = Joi.object({
    range: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
  });

  const { error } = schema.validate(req.query, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── GET POPULAR ITEMS VALIDATION ─────────────────────────────────────────────
module.exports.getPopularItems = (req, res, next) => {
  const schema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional(),
    days:  Joi.number().integer().min(1).max(365).optional(),
  });

  const { error } = schema.validate(req.query, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── GET PEAK HOURS VALIDATION ────────────────────────────────────────────────
module.exports.getPeakHours = (req, res, next) => {
  const schema = Joi.object({
    days: Joi.number().integer().min(1).max(365).optional(),
  });

  const { error } = schema.validate(req.query, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};
