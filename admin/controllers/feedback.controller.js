const { Feedback, User, Location, Order } = require('../../models');
const { success, notFound, badRequest, serverError } = require('../../utils/response.helper');
const { Op } = require('sequelize');

// Common include for feedback with associations
const feedbackIncludes = [
  { model: User, as: 'user', attributes: ['id', 'name', 'email'], required: false },
  { model: Location, as: 'location', attributes: ['id', 'name', 'city'], required: false },
  { model: Order, as: 'order', attributes: ['id', 'order_number'], required: false },
];

// ─── GET /admin/feedback ──────────────────────────────────────────────────────
/**
 * Get all feedback with pagination and filters
 */
module.exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, status, location_id, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (rating) where.rating = parseInt(rating);
    if (status) where.status = status;
    if (location_id) where.location_id = parseInt(location_id);

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } },
      ];
    }

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
    console.error('[ADMIN FEEDBACK GET ALL ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/feedback/:id ──────────────────────────────────────────────────
/**
 * Get single feedback by ID
 */
module.exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id, { include: feedbackIncludes });

    if (!feedback) return notFound(res, 'Feedback not found');

    return success(res, 'Feedback fetched successfully', feedback);
  } catch (error) {
    console.error('[ADMIN FEEDBACK GET BY ID ERROR]', error);
    return serverError(res, error);
  }
};

// ─── PATCH /admin/feedback/:id/status ─────────────────────────────────────────
/**
 * Update feedback status (active / inactive / resolved)
 */
module.exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['active', 'inactive', 'resolved'];
    if (!allowed.includes(status)) {
      return badRequest(res, `Status must be one of: ${allowed.join(', ')}`);
    }

    const feedback = await Feedback.findByPk(id);
    if (!feedback) return notFound(res, 'Feedback not found');

    await feedback.update({ status, updated_at: new Date() });

    const updated = await Feedback.findByPk(id, { include: feedbackIncludes });
    return success(res, `Feedback marked as "${status}" successfully`, updated);
  } catch (error) {
    console.error('[ADMIN FEEDBACK UPDATE STATUS ERROR]', error);
    return serverError(res, error);
  }
};

// ─── DELETE /admin/feedback/:id ───────────────────────────────────────────────
/**
 * Soft delete feedback (mark status as inactive)
 */
module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) return notFound(res, 'Feedback not found');

    await feedback.update({ status: 'inactive', updated_at: new Date() });

    return success(res, 'Feedback deleted successfully', { feedbackId: parseInt(id) });
  } catch (error) {
    console.error('[ADMIN FEEDBACK DELETE ERROR]', error);
    return serverError(res, error);
  }
};

// ─── DELETE /admin/feedback/:id/permanent ─────────────────────────────────────
/**
 * Permanently delete feedback
 */
module.exports.deletePermanent = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) return notFound(res, 'Feedback not found');

    await Feedback.destroy({ where: { id } });

    return success(res, 'Feedback permanently deleted', { feedbackId: parseInt(id) });
  } catch (error) {
    console.error('[ADMIN FEEDBACK DELETE PERMANENT ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/feedback/stats/summary ────────────────────────────────────────
/**
 * Feedback statistics: totals, average rating, rating distribution
 */
module.exports.getStats = async (req, res) => {
  try {
    const { sequelize } = require('../../models');

    const total = await Feedback.count();
    const active = await Feedback.count({ where: { status: 'active' } });
    const resolved = await Feedback.count({ where: { status: 'resolved' } });
    const inactive = await Feedback.count({ where: { status: 'inactive' } });

    const avgRating = await Feedback.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
      ],
      where: { status: 'active' },
      raw: true,
    });

    const ratingDistribution = await Feedback.findAll({
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { status: 'active' },
      group: ['rating'],
      raw: true,
      order: [['rating', 'DESC']],
    });

    return success(res, 'Feedback statistics fetched successfully', {
      total,
      active,
      resolved,
      inactive,
      averageRating: avgRating?.averageRating
        ? parseFloat(avgRating.averageRating).toFixed(2)
        : '0.00',
      ratingDistribution,
    });
  } catch (error) {
    console.error('[ADMIN FEEDBACK STATS ERROR]', error);
    return serverError(res, error);
  }
};
