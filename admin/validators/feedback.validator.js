/**
 * Feedback Validators for Admin Module
 */

// ─── ID PARAMETER VALIDATION ──────────────────────────────────────────────────
module.exports.validateId = (req, res, next) => {
  const { id } = req.params;
  const errors = [];

  if (!id || isNaN(parseInt(id))) {
    errors.push('Feedback ID must be a valid number');
  } else if (parseInt(id) <= 0) {
    errors.push('Feedback ID must be greater than 0');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      data: { errors },
    });
  }

  next();
};

// ─── GET ALL FEEDBACK VALIDATION ──────────────────────────────────────────────
module.exports.getAll = (req, res, next) => {
  const { page, limit, rating, search } = req.query;
  const errors = [];

  // Validate pagination
  if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
    errors.push('Page must be a positive number');
  }

  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    errors.push('Limit must be between 1 and 100');
  }

  // Validate rating filter
  if (rating && (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5)) {
    errors.push('Rating must be between 1 and 5');
  }

  // Validate search string
  if (search && typeof search !== 'string') {
    errors.push('Search must be a string');
  } else if (search && search.trim().length > 255) {
    errors.push('Search string is too long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      data: { errors },
    });
  }

  next();
};
