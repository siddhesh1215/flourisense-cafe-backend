/**
 * Menu Validators for Admin Module
 */

// ─── CREATE MENU ITEM VALIDATION ──────────────────────────────────────────────
module.exports.createMenu = (req, res, next) => {
  const { name, price, category_id } = req.body;
  const errors = [];

  // Validate name
  if (!name || typeof name !== 'string') {
    errors.push('Name is required and must be a string');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters');
  }

  // Validate price
  if (!price) {
    errors.push('Price is required');
  } else if (isNaN(parseFloat(price))) {
    errors.push('Price must be a valid number');
  } else if (parseFloat(price) <= 0) {
    errors.push('Price must be greater than 0');
  } else if (parseFloat(price) > 999999.99) {
    errors.push('Price is too high');
  }

  // Validate category_id
  if (!category_id || isNaN(parseInt(category_id))) {
    errors.push('Category ID is required and must be a valid number');
  } else if (parseInt(category_id) <= 0) {
    errors.push('Category ID must be greater than 0');
  }

  // Validate optional fields
  if (req.body.description && typeof req.body.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (req.body.emoji) {
    if (typeof req.body.emoji !== 'string') {
      errors.push('Emoji must be a string');
    } else if (req.body.emoji.trim().length > 10) {
      errors.push('Emoji must not exceed 10 characters');
    }
  }

  if (req.body.display_order && isNaN(parseInt(req.body.display_order))) {
    errors.push('Display order must be a number');
  }

  if (req.body.is_popular && typeof req.body.is_popular !== 'boolean') {
    errors.push('is_popular must be a boolean');
  }

  if (req.body.is_available && typeof req.body.is_available !== 'boolean') {
    errors.push('is_available must be a boolean');
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

// ─── UPDATE MENU ITEM VALIDATION ──────────────────────────────────────────────
module.exports.updateMenu = (req, res, next) => {
  const { name, price, category_id } = req.body;
  const errors = [];

  // Validate name if provided
  if (name) {
    if (typeof name !== 'string') {
      errors.push('Name must be a string');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (name.trim().length > 100) {
      errors.push('Name must not exceed 100 characters');
    }
  }

  // Validate price if provided
  if (price !== undefined) {
    if (isNaN(parseFloat(price))) {
      errors.push('Price must be a valid number');
    } else if (parseFloat(price) <= 0) {
      errors.push('Price must be greater than 0');
    } else if (parseFloat(price) > 999999.99) {
      errors.push('Price is too high');
    }
  }

  // Validate category_id if provided
  if (category_id) {
    if (isNaN(parseInt(category_id))) {
      errors.push('Category ID must be a valid number');
    } else if (parseInt(category_id) <= 0) {
      errors.push('Category ID must be greater than 0');
    }
  }

  // Validate optional fields
  if (req.body.description && typeof req.body.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (req.body.emoji) {
    if (typeof req.body.emoji !== 'string') {
      errors.push('Emoji must be a string');
    } else if (req.body.emoji.trim().length > 10) {
      errors.push('Emoji must not exceed 10 characters');
    }
  }

  if (req.body.display_order !== undefined && isNaN(parseInt(req.body.display_order))) {
    errors.push('Display order must be a number');
  }

  if (req.body.is_popular !== undefined && typeof req.body.is_popular !== 'boolean') {
    errors.push('is_popular must be a boolean');
  }

  if (req.body.is_available !== undefined && typeof req.body.is_available !== 'boolean') {
    errors.push('is_available must be a boolean');
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

// ─── UPDATE PRICE VALIDATION ──────────────────────────────────────────────────
module.exports.updatePrice = (req, res, next) => {
  const { price } = req.body;
  const errors = [];

  if (!price) {
    errors.push('Price is required');
  } else if (isNaN(parseFloat(price))) {
    errors.push('Price must be a valid number');
  } else if (parseFloat(price) <= 0) {
    errors.push('Price must be greater than 0');
  } else if (parseFloat(price) > 999999.99) {
    errors.push('Price is too high');
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
