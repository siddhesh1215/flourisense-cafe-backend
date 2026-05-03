const { Review, User, MenuItem } = require('../../models');
const { success, notFound, serverError } = require('../../utils/response.helper');

// Common include for reviews with user and menu item info
const reviewIncludes = [
  { model: User, attributes: ['id', 'name', 'email'] },
  { model: MenuItem, attributes: ['id', 'name'] },
];

// ─── GET /admin/feedback ──────────────────────────────────────────────────────
/**
 * Get all customer feedback with pagination and filters
 */
module.exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, is_approved, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { inactive: false };

    // Filter by rating
    if (rating) {
      where.rating = parseInt(rating);
    }

    // Filter by approval status
    if (is_approved !== undefined) {
      where.is_approved = is_approved === 'true';
    }

    // Search in comment or title
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { comment: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: reviewIncludes,
      limit: parseInt(limit),
      offset,
      order: [['created_on', 'DESC']],
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

    const feedback = await Review.findOne({
      where: { id, inactive: false },
      include: reviewIncludes,
    });

    if (!feedback) {
      return notFound(res, 'Feedback not found');
    }

    return success(res, 'Feedback fetched successfully', feedback);
  } catch (error) {
    console.error('[ADMIN FEEDBACK GET BY ID ERROR]', error);
    return serverError(res, error);
  }
};

// ─── DELETE /admin/feedback/:id ───────────────────────────────────────────────
/**
 * Delete feedback (soft delete)
 */
module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Review.findByPk(id);
    if (!feedback) {
      return notFound(res, 'Feedback not found');
    }

    // Soft delete
    await feedback.update({ inactive: true, updated_on: new Date() });

    return success(res, 'Feedback deleted successfully', { feedbackId: id });
  } catch (error) {
    console.error('[ADMIN FEEDBACK DELETE ERROR]', error);
    return serverError(res, error);
  }
};

// ─── PATCH /admin/feedback/:id/approve ────────────────────────────────────────
/**
 * Approve feedback
 */
module.exports.approveFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Review.findByPk(id);
    if (!feedback) {
      return notFound(res, 'Feedback not found');
    }

    await feedback.update({ 
      is_approved: true, 
      updated_on: new Date() 
    });

    const updatedFeedback = await Review.findByPk(id, { include: reviewIncludes });

    return success(res, 'Feedback approved successfully', updatedFeedback);
  } catch (error) {
    console.error('[ADMIN FEEDBACK APPROVE ERROR]', error);
    return serverError(res, error);
  }
};

// ─── PATCH /admin/feedback/:id/reject ─────────────────────────────────────────
/**
 * Reject feedback (mark as not approved)
 */
module.exports.rejectFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Review.findByPk(id);
    if (!feedback) {
      return notFound(res, 'Feedback not found');
    }

    await feedback.update({ 
      is_approved: false, 
      updated_on: new Date() 
    });

    const updatedFeedback = await Review.findByPk(id, { include: reviewIncludes });

    return success(res, 'Feedback rejected successfully', updatedFeedback);
  } catch (error) {
    console.error('[ADMIN FEEDBACK REJECT ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/feedback/stats/summary ────────────────────────────────────────
/**
 * Get feedback statistics summary
 */
module.exports.getStats = async (req, res) => {
  try {
    const { Op } = require('sequelize');

    const totalFeedback = await Review.count({ where: { inactive: false } });
    const approvedFeedback = await Review.count({ where: { is_approved: true, inactive: false } });
    const pendingFeedback = await Review.count({ where: { is_approved: false, inactive: false } });

    // Get average rating
    const avgRating = await Review.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating'],
      ],
      where: { inactive: false, is_approved: true },
      raw: true,
    });

    // Get rating distribution
    const ratingDistribution = await Review.findAll({
      attributes: [
        'rating',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      where: { inactive: false, is_approved: true },
      group: ['rating'],
      raw: true,
      order: [['rating', 'DESC']],
    });

    return success(res, 'Feedback statistics fetched successfully', {
      total: totalFeedback,
      approved: approvedFeedback,
      pending: pendingFeedback,
      averageRating: avgRating?.averageRating ? parseFloat(avgRating.averageRating).toFixed(2) : 0,
      ratingDistribution,
    });
  } catch (error) {
    console.error('[ADMIN FEEDBACK STATS ERROR]', error);
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

    const feedback = await Review.findByPk(id);
    if (!feedback) {
      return notFound(res, 'Feedback not found');
    }

    await Review.destroy({ where: { id } });

    return success(res, 'Feedback permanently deleted successfully', { feedbackId: id });
  } catch (error) {
    console.error('[ADMIN FEEDBACK DELETE PERMANENT ERROR]', error);
    return serverError(res, error);
  }
};
