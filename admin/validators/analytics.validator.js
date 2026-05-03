/**
 * Analytics Validators for Admin Module
 */

// ─── GET REVENUE VALIDATION ───────────────────────────────────────────────────
module.exports.getRevenue = (req, res, next) => {
  const { range } = req.query;
  const errors = [];

  if (range && !['daily', 'weekly', 'monthly'].includes(range)) {
    errors.push('Range must be one of: daily, weekly, monthly');
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

// ─── GET POPULAR ITEMS VALIDATION ─────────────────────────────────────────────
module.exports.getPopularItems = (req, res, next) => {
  const { limit, days } = req.query;
  const errors = [];

  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    errors.push('Limit must be between 1 and 100');
  }

  if (days && (isNaN(parseInt(days)) || parseInt(days) < 1 || parseInt(days) > 365)) {
    errors.push('Days must be between 1 and 365');
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

// ─── GET PEAK HOURS VALIDATION ────────────────────────────────────────────────
module.exports.getPeakHours = (req, res, next) => {
  const { days } = req.query;
  const errors = [];

  if (days && (isNaN(parseInt(days)) || parseInt(days) < 1 || parseInt(days) > 365)) {
    errors.push('Days must be between 1 and 365');
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
