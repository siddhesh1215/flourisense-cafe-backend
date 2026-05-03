const Joi = require('joi');
const { badRequest } = require('../../utils/response.helper');

// ─── Place Order ──────────────────────────────────────────────────────────────
const placeOrder = async (req, res, next) => {
  const schema = Joi.object({
    payment_method: Joi.string()
      .valid('cash', 'card', 'upi', 'online')
      .required(),
    location_id: Joi.number().integer().positive().optional().allow(null),
    order_type_id: Joi.number().integer().positive().optional().allow(null),
    user: Joi.any().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return badRequest(res, error.details.map((d) => d.message).join(', '));
  }
  next();
};

// ─── Update Order ─────────────────────────────────────────────────────────────
const updateOrder = async (req, res, next) => {
  const schema = Joi.object({
    status_code: Joi.string()
      .valid('pending', 'confirmed', 'preparing', 'served', 'cancelled')
      .optional(),
    payment_status: Joi.string()
      .valid('pending', 'paid', 'failed', 'refunded')
      .optional(),
    user: Joi.any().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return badRequest(res, error.details.map((d) => d.message).join(', '));
  }
  next();
};

module.exports = { placeOrder, updateOrder };
