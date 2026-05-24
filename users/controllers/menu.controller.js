const { MenuItem, MenuCategory, MenuItemImage, LocationMenuItem, Location } = require('../../models');
const { Op } = require('sequelize');
const { success, notFound, serverError } = require('../../utils/response.helper');

// ─── Common includes for menu item queries ────────────────────────────────────
const menuIncludes = [
  { model: MenuCategory, attributes: ['id', 'name'] },
  { model: MenuItemImage, attributes: ['id', 'image_url', 'alt_text', 'is_primary'], required: false },
];

/**
 * Build the include array for location-filtered queries.
 * When location_id is provided, we JOIN through LocationMenuItem
 * to only return items assigned & available at that location.
 */
const buildLocationInclude = (location_id) => {
  if (!location_id) return menuIncludes;

  return [
    ...menuIncludes,
    {
      model: LocationMenuItem,
      as: 'locationMenuItems',
      where: {
        location_id: parseInt(location_id),
        is_available: true,
        inactive: false,
      },
      attributes: ['is_available'],
      required: true, // INNER JOIN — only items assigned to this location
    },
  ];
};

// ─── GET /user/menu?location_id=&category_id=&search= ────────────────────────
/**
 * Get all available menu items.
 * If location_id is provided, only returns items assigned & available at that location.
 */
module.exports.getAll = async (req, res) => {
  try {
    const { category_id, search, location_id } = req.query;

    // Validate location if provided
    if (location_id) {
      const location = await Location.findOne({
        where: { id: parseInt(location_id), inactive: false },
      });
      if (!location) return notFound(res, 'Location not found');
    }

    const where = { inactive: false, is_available: true };
    if (category_id) where.category_id = parseInt(category_id);
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const items = await MenuItem.findAll({
      where,
      include: buildLocationInclude(location_id),
      order: [['display_order', 'ASC'], ['name', 'ASC']],
    });

    return success(res, 'Menu items fetched successfully', items);
  } catch (error) {
    console.error('[USER MENU GET ALL ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /user/menu/popular?location_id= ─────────────────────────────────────
/**
 * Get popular menu items.
 * If location_id is provided, only returns popular items available at that location.
 */
module.exports.getPopular = async (req, res) => {
  try {
    const { location_id } = req.query;

    if (location_id) {
      const location = await Location.findOne({
        where: { id: parseInt(location_id), inactive: false },
      });
      if (!location) return notFound(res, 'Location not found');
    }

    const items = await MenuItem.findAll({
      where: { is_popular: true, is_available: true, inactive: false },
      include: buildLocationInclude(location_id),
      order: [['display_order', 'ASC']],
    });

    return success(res, 'Popular menu items fetched successfully', items);
  } catch (error) {
    console.error('[USER MENU GET POPULAR ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /user/menu/category/:category_id?location_id= ───────────────────────
/**
 * Get menu items by category.
 * If location_id is provided, only returns items in that category available at that location.
 */
module.exports.getByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const { location_id } = req.query;

    const category = await MenuCategory.findByPk(category_id);
    if (!category) return notFound(res, 'Menu category not found');

    if (location_id) {
      const location = await Location.findOne({
        where: { id: parseInt(location_id), inactive: false },
      });
      if (!location) return notFound(res, 'Location not found');
    }

    const items = await MenuItem.findAll({
      where: { category_id, is_available: true, inactive: false },
      include: buildLocationInclude(location_id),
      order: [['display_order', 'ASC']],
    });

    return success(res, `Menu items for category "${category.name}" fetched successfully`, {
      category,
      items,
    });
  } catch (error) {
    console.error('[USER MENU GET BY CATEGORY ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /user/menu/:id?location_id= ─────────────────────────────────────────
/**
 * Get a single menu item by ID.
 * If location_id is provided, verifies the item is assigned & available at
 * that location — returns 404 if it's not served there.
 */
module.exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const { location_id } = req.query;

    // Validate location if provided
    if (location_id) {
      const location = await Location.findOne({
        where: { id: parseInt(location_id), inactive: false },
      });
      if (!location) return notFound(res, 'Location not found');
    }

    const item = await MenuItem.findOne({
      where: { id, is_available: true, inactive: false },
      include: buildLocationInclude(location_id),
    });

    if (!item) {
      return notFound(
        res,
        location_id
          ? 'Menu item not found or not available at this location'
          : 'Menu item not found'
      );
    }

    return success(res, 'Menu item fetched successfully', item);
  } catch (error) {
    console.error('[USER MENU GET BY ID ERROR]', error);
    return serverError(res, error);
  }
};

