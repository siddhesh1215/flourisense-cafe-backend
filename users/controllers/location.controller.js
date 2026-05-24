const { Location, MenuItem, LocationMenuItem, MenuCategory, MenuItemImage } = require('../../models');
const { Op } = require('sequelize');
const { success, notFound, serverError } = require('../../utils/response.helper');

// ─── GET /user/location ───────────────────────────────────────────────────────
/**
 * List all active locations.
 * Used by the frontend to populate the location picker.
 * Public — no authentication required.
 */
module.exports.getAll = async (req, res) => {
  try {
    const locations = await Location.findAll({
      where: { inactive: false },
      attributes: ['id', 'name', 'code', 'address', 'city'],
      order: [['name', 'ASC']],
    });

    return success(res, 'Locations fetched successfully', { locations });
  } catch (error) {
    console.error('[USER LOCATION GET ALL ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /user/location/:id ───────────────────────────────────────────────────
/**
 * Get a single active location by ID.
 * Public — no authentication required.
 */
module.exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findOne({
      where: { id, inactive: false },
      attributes: ['id', 'name', 'code', 'address', 'city'],
    });

    if (!location) return notFound(res, 'Location not found');

    return success(res, 'Location fetched successfully', location);
  } catch (error) {
    console.error('[USER LOCATION GET BY ID ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /user/location/:id/menu-items ───────────────────────────────────────
/**
 * Get all available menu items at a specific location.
 * Supports optional filters: ?category_id=, ?search=
 * Public — no authentication required.
 */
module.exports.getMenuItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, search } = req.query;

    const location = await Location.findOne({
      where: { id, inactive: false },
      attributes: ['id', 'name', 'code'],
    });
    if (!location) return notFound(res, 'Location not found');

    // Filter on MenuItem itself
    const itemWhere = { inactive: false, is_available: true };
    if (category_id) itemWhere.category_id = parseInt(category_id);
    if (search) {
      itemWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const locationMenuItems = await LocationMenuItem.findAll({
      where: { location_id: id, is_available: true, inactive: false },
      include: [
        {
          model: MenuItem,
          as: 'menuItem',
          where: itemWhere,
          attributes: ['id', 'name', 'description', 'price', 'is_popular', 'display_order'],
          include: [
            { model: MenuCategory, attributes: ['id', 'name'] },
            {
              model: MenuItemImage,
              attributes: ['id', 'image_url', 'alt_text', 'is_primary'],
              required: false,
            },
          ],
        },
      ],
      order: [[{ model: MenuItem, as: 'menuItem' }, 'display_order', 'ASC']],
    });

    const items = locationMenuItems.map(lmi => lmi.menuItem);

    return success(res, `Menu items for "${location.name}" fetched successfully`, {
      location: { id: location.id, name: location.name, code: location.code },
      count: items.length,
      items,
    });
  } catch (error) {
    console.error('[USER LOCATION GET MENU ITEMS ERROR]', error);
    return serverError(res, error);
  }
};
