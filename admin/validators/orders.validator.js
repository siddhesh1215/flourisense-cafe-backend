/**
 * Orders Validators for Admin Module
 */

// ─── UPDATE ORDER STATUS VALIDATION ───────────────────────────────────────────
module.exports.updateStatus = (req, res, next) => {
  const { status_id } = req.body;
  const errors = [];

  if (!status_id) {
    errors.push('Status ID is required');
  } else if (isNaN(parseInt(status_id))) {
    errors.push('Status ID must be a valid number');
  } else if (parseInt(status_id) <= 0) {
    errors.push('Status ID must be greater than 0');
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

// ─── GET ORDERS VALIDATION ───────────────────────────────────────────────────
module.exports.getAll = (req, res, next) => {
  const { page, limit, status, date_from, date_to } = req.query;
  const errors = [];

  // Validate pagination
  if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
    errors.push('Page must be a positive number');
  }

  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    errors.push('Limit must be between 1 and 100');
  }

  // Validate status filter
  if (status && (isNaN(parseInt(status)) || parseInt(status) <= 0)) {
    errors.push('Status must be a valid positive number');
  }

  // Validate dates
  if (date_from && isNaN(Date.parse(date_from))) {
    errors.push('date_from must be a valid date (YYYY-MM-DD)');
  }

  if (date_to && isNaN(Date.parse(date_to))) {
    errors.push('date_to must be a valid date (YYYY-MM-DD)');
  }

  if (date_from && date_to && new Date(date_from) > new Date(date_to)) {
    errors.push('date_from must be before date_to');
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

// ─── GET ORDER BY ID VALIDATION ───────────────────────────────────────────────
module.exports.getById = (req, res, next) => {
  const { id } = req.params;
  const errors = [];

  if (!id || isNaN(parseInt(id))) {
    errors.push('Order ID must be a valid number');
  } else if (parseInt(id) <= 0) {
    errors.push('Order ID must be greater than 0');
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
