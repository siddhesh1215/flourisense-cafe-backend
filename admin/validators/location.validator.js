const Joi = require('joi');

// ─── SHARED HELPER ────────────────────────────────────────────────────────────
const fail = (res, message) =>
  res.status(400).json({ status: false, message, data: null });

// ─── CREATE LOCATION VALIDATION ───────────────────────────────────────────────
module.exports.createLocation = (req, res, next) => {
  const schema = Joi.object({
    name:    Joi.string().trim().min(2).max(100).required(),
    code:    Joi.string().trim().max(20).optional().allow('', null),
    address: Joi.string().trim().max(255).optional().allow('', null),
    city:    Joi.string().trim().max(100).optional().allow('', null),
    // injected by verifyAdminToken
    user:    Joi.any().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── UPDATE LOCATION VALIDATION ───────────────────────────────────────────────
module.exports.updateLocation = (req, res, next) => {
  const schema = Joi.object({
    name:     Joi.string().trim().min(2).max(100).optional(),
    code:     Joi.string().trim().max(20).optional().allow('', null),
    address:  Joi.string().trim().max(255).optional().allow('', null),
    city:     Joi.string().trim().max(100).optional().allow('', null),
    inactive: Joi.boolean().optional(),
    // injected by verifyAdminToken
    user:     Joi.any().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── VALIDATE LOCATION ID PARAM ───────────────────────────────────────────────
module.exports.validateId = (req, res, next) => {
  const schema = Joi.object({ id: Joi.number().integer().positive().required() });
  const { error } = schema.validate({ id: parseInt(req.params.id) });
  if (error) return fail(res, error.details[0].message);
  next();
};

// ─── ASSIGN MENU ITEMS VALIDATION ─────────────────────────────────────────────
module.exports.assignMenuItems = (req, res, next) => {
  const schema = Joi.object({
    menu_item_ids: Joi.array()
      .items(Joi.number().integer().positive())
      .min(1)
      .required(),
    // injected by verifyAdminToken
    user: Joi.any().optional(),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: true });
  if (error) return fail(res, error.details[0].message);

  // Normalize all IDs to integers
  req.body.menu_item_ids = value.menu_item_ids.map((id) => parseInt(id));
  next();
};

// ─── UPDATE MENU ITEM AVAILABILITY VALIDATION ─────────────────────────────────
module.exports.updateAvailability = (req, res, next) => {
  const bodySchema = Joi.object({
    is_available: Joi.boolean().required(),
    // injected by verifyAdminToken
    user: Joi.any().optional(),
  });
  const paramSchema = Joi.object({
    item_id: Joi.number().integer().positive().required(),
  });

  const bodyResult = bodySchema.validate(req.body, { abortEarly: true });
  if (bodyResult.error) return fail(res, bodyResult.error.details[0].message);

  const paramResult = paramSchema.validate({ item_id: parseInt(req.params.item_id) });
  if (paramResult.error) return fail(res, paramResult.error.details[0].message);

  next();
};

// ─── VALIDATE ITEM_ID PARAM ───────────────────────────────────────────────────
module.exports.validateItemId = (req, res, next) => {
  const schema = Joi.object({ item_id: Joi.number().integer().positive().required() });
  const { error } = schema.validate({ item_id: parseInt(req.params.item_id) });
  if (error) return fail(res, error.details[0].message);
  next();
};
