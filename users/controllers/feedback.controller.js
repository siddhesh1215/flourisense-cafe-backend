const { Feedback, User, Location, Order } = require('../../models');
const { success, created, badRequest, notFound, serverError } = require('../../utils/response.helper');

// Common includes for feedback responses
const feedbackIncludes = [
  { model: User, as: 'user', attributes: ['id', 'name', 'email'], required: false },
  { model: Location, as: 'location', attributes: ['id', 'name', 'city'], required: false },
  { model: Order, as: 'order', attributes: ['id', 'order_number'], required: false },
];

// ─── POST /user/feedback ──────────────────────────────────────────────────────
/**
 * Submit feedback (auth required).
 * The authenticated user's id, name, and email are pulled from the DB —
 * the request body only needs: rating, message (optional), location_id, order_id.
 */
module.exports.submit = async (req, res) => {
  try {
    const { rating, message, location_id, order_id } = req.body;
    const userId = req.user.id;

    // Fetch the authenticated user's profile for name & email
    const authUser = await User.findByPk(userId, { attributes: ['id', 'name', 'email'] });
    if (!authUser) return notFound(res, 'Authenticated user not found');

    // If order_id provided, verify it belongs to this user
    if (order_id) {
      const order = await Order.findOne({ where: { id: order_id, user_id: userId, inactive: false } });
      if (!order) return notFound(res, 'The referenced order was not found or does not belong to you');
    }

    // If location_id provided, verify it exists
    if (location_id) {
      const location = await Location.findOne({ where: { id: location_id, inactive: false } });
      if (!location) return notFound(res, 'The referenced location was not found');
    }

    const feedback = await Feedback.create({
      user_id: userId,
      name: authUser.name,
      email: authUser.email,
      rating: parseInt(rating),
      message: message ? message.trim() : null,
      location_id: location_id || null,
      order_id: order_id || null,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const saved = await Feedback.findByPk(feedback.id, { include: feedbackIncludes });

    return created(res, 'Thank you! Your feedback has been submitted successfully', saved);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return badRequest(res, error.errors.map((e) => e.message).join(', '));
    }
    return serverError(res, error);
  }
};

// ─── GET /user/feedback ───────────────────────────────────────────────────────
/**
 * Get all active feedback — public endpoint (no auth required).
 * Supports pagination and optional rating filter.
 */
module.exports.getPublic = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, location_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { status: 'active' };

    if (rating) where.rating = parseInt(rating);
    if (location_id) where.location_id = parseInt(location_id);

    const { count, rows } = await Feedback.findAndCountAll({
      where,
      include: feedbackIncludes,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    return success(res, 'Feedback fetched successfully', {
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      },
      data: rows,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// ─── GET /user/feedback/my ────────────────────────────────────────────────────
/**
 * Get feedback submitted by the currently authenticated user.
 * Requires: verifyJWTToken middleware.
 * Supports: pagination via ?page=&limit=
 */
module.exports.getMyFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Feedback.findAndCountAll({
      where: { user_id: userId, status: 'active' },
      include: feedbackIncludes,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    return success(res, 'Your feedback fetched successfully', {
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      },
      data: rows,
    });
  } catch (error) {
    return serverError(res, error);
  }
};
