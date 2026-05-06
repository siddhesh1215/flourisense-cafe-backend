/**
 * Location Validators for Admin Module
 */

// ─── CREATE LOCATION VALIDATION ───────────────────────────────────────────────
module.exports.createLocation = (req, res, next) => {
  const { name, code, city } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string') {
    errors.push('Name is required and must be a string');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters');
  }

  if (code !== undefined && code !== null && code !== '') {
    if (typeof code !== 'string') {
      errors.push('Code must be a string');
    } else if (code.trim().length > 20) {
      errors.push('Code must not exceed 20 characters');
    }
  }

  if (city !== undefined && city !== null && city !== '') {
    if (typeof city !== 'string') {
      errors.push('City must be a string');
    }
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

// ─── UPDATE LOCATION VALIDATION ───────────────────────────────────────────────
module.exports.updateLocation = (req, res, next) => {
  const { name, code, inactive } = req.body;
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string') {
      errors.push('Name must be a string');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (name.trim().length > 100) {
      errors.push('Name must not exceed 100 characters');
    }
  }

  if (code !== undefined && code !== null && code !== '') {
    if (typeof code !== 'string') {
      errors.push('Code must be a string');
    } else if (code.trim().length > 20) {
      errors.push('Code must not exceed 20 characters');
    }
  }

  if (inactive !== undefined && typeof inactive !== 'boolean') {
    errors.push('inactive must be a boolean');
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

// ─── VALIDATE LOCATION ID PARAM ───────────────────────────────────────────────
module.exports.validateId = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      data: { errors: ['Location ID must be a valid positive number'] },
    });
  }

  next();
};

// ─── ASSIGN MENU ITEMS VALIDATION ─────────────────────────────────────────────
module.exports.assignMenuItems = (req, res, next) => {
  const { menu_item_ids } = req.body;
  const errors = [];

  if (!Array.isArray(menu_item_ids) || menu_item_ids.length === 0) {
    errors.push('menu_item_ids must be a non-empty array of menu item IDs');
  } else {
    const invalidIds = menu_item_ids.filter(id => isNaN(parseInt(id)) || parseInt(id) <= 0);
    if (invalidIds.length > 0) {
      errors.push(`Invalid menu item IDs: [${invalidIds.join(', ')}]`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      data: { errors },
    });
  }

  // Normalize all IDs to integers
  req.body.menu_item_ids = menu_item_ids.map(id => parseInt(id));

  next();
};

// ─── UPDATE MENU ITEM AVAILABILITY VALIDATION ─────────────────────────────────
module.exports.updateAvailability = (req, res, next) => {
  const { is_available } = req.body;
  const { item_id } = req.params;
  const errors = [];

  if (is_available === undefined || typeof is_available !== 'boolean') {
    errors.push('is_available is required and must be a boolean');
  }

  if (!item_id || isNaN(parseInt(item_id)) || parseInt(item_id) <= 0) {
    errors.push('Menu item ID must be a valid positive number');
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

// ─── VALIDATE ITEM_ID PARAM ───────────────────────────────────────────────────
module.exports.validateItemId = (req, res, next) => {
  const { item_id } = req.params;

  if (!item_id || isNaN(parseInt(item_id)) || parseInt(item_id) <= 0) {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      data: { errors: ['Menu item ID must be a valid positive number'] },
    });
  }

  next();
};
