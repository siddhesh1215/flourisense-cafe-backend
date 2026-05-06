/**
 * Super Admin Validators
 */

// ─── VALIDATE ID PARAM ────────────────────────────────────────────────────────
module.exports.validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      data: { errors: ['ID must be a valid positive number'] },
    });
  }
  next();
};

// ─── CREATE ADMIN VALIDATION ──────────────────────────────────────────────────
module.exports.createAdmin = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  } else if (name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters');
  }

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('Email must be a valid email address');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  } else if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  if (req.body.phone && typeof req.body.phone !== 'string') {
    errors.push('Phone must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({ status: false, message: 'Validation failed', data: { errors } });
  }

  next();
};

// ─── UPDATE ADMIN VALIDATION ──────────────────────────────────────────────────
module.exports.updateAdmin = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    } else if (name.trim().length > 100) {
      errors.push('Name must not exceed 100 characters');
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('Email must be a valid email address');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ status: false, message: 'Validation failed', data: { errors } });
  }

  next();
};

// ─── TOGGLE ACTIVE VALIDATION ─────────────────────────────────────────────────
module.exports.toggle = (req, res, next) => {
  const { inactive } = req.body;
  if (inactive === undefined || typeof inactive !== 'boolean') {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      data: { errors: ['inactive is required and must be a boolean'] },
    });
  }
  next();
};

// ─── RESET PASSWORD VALIDATION ────────────────────────────────────────────────
module.exports.resetPassword = (req, res, next) => {
  const { new_password } = req.body;
  const errors = [];

  if (!new_password || typeof new_password !== 'string') {
    errors.push('new_password is required');
  } else if (new_password.length < 6) {
    errors.push('new_password must be at least 6 characters');
  } else if (new_password.length > 128) {
    errors.push('new_password must not exceed 128 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ status: false, message: 'Validation failed', data: { errors } });
  }

  next();
};
