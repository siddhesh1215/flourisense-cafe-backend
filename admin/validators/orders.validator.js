const Joi = require('joi');

// ─── SHARED HELPER ────────────────────────────────────────────────────────────
const fail = (res, message) =>
  res.status(400).json({ status: false, message, data: null });

// ─── UPDATE ORDER STATUS VALIDATION ───────────────────────────────────────────
module.exports.updateStatus = (req, res, next) => {
  const schema = Joi.object({
    status_id: Joi.number().integer().positive().required(),
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── GET ORDERS VALIDATION ────────────────────────────────────────────────────
module.exports.getAll = (req, res, next) => {
  const schema = Joi.object({
    page:      Joi.number().integer().min(1).optional(),
    limit:     Joi.number().integer().min(1).max(100).optional(),
    status:    Joi.number().integer().positive().optional(),
    date_from: Joi.date().iso().optional(),
    date_to:   Joi.date().iso().min(Joi.ref('date_from')).optional()
      .messages({ 'date.min': 'date_from must be before date_to' }),
  });

  const { error } = schema.validate(req.query, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── GET ORDER BY ID VALIDATION ───────────────────────────────────────────────
module.exports.getById = (req, res, next) => {
  const schema = Joi.object({ id: Joi.number().integer().positive().required() });
  const { error } = schema.validate({ id: parseInt(req.params.id) });
  if (error) return fail(res, error.details[0].message);
  next();
};
