const { Location, MenuItem, LocationMenuItem, MenuCategory, MenuItemImage } = require('../../models');
const { Op } = require('sequelize');
const { success, created, badRequest, notFound, serverError } = require('../../utils/response.helper');

// ─── POST /admin/location ─────────────────────────────────────────────────────
/**
 * Create a new location
 */
module.exports.create = async (req, res) => {
  try {
    const { name, code, address, city, user } = req.body;

    const duplicate = await Location.findOne({ where: { name: name.trim() } });
    if (duplicate) return badRequest(res, `A location named "${name.trim()}" already exists`);

    if (code) {
      const dupCode = await Location.findOne({ where: { code: code.trim().toUpperCase() } });
      if (dupCode) return badRequest(res, `A location with code "${code.trim().toUpperCase()}" already exists`);
    }

    const location = await Location.create({
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : null,
      address: address || null,
      city: city || null,
      inactive: false,
      created_on: new Date(),
      updated_on: new Date(),
      created_by: user?.id || null,
      updated_by: user?.id || null,
    });

    return created(res, 'Location created successfully', location);
  } catch (error) {
    console.error('[ADMIN LOCATION CREATE ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/location ──────────────────────────────────────────────────────
/**
 * Get all locations (including inactive for admin)
 */
module.exports.getAll = async (req, res) => {
  try {
    const { search, inactive } = req.query;

    const where = {};

    if (inactive !== undefined) {
      where.inactive = inactive === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
      ];
    }

    const locations = await Location.findAll({
      where,
      order: [['name', 'ASC']],
    });

    return success(res, 'Locations fetched successfully', {
      count: locations.length,
      locations,
    });
  } catch (error) {
    console.error('[ADMIN LOCATION GET ALL ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/location/:id ──────────────────────────────────────────────────
/**
 * Get single location by ID
 */
module.exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findByPk(id);
    if (!location) return notFound(res, 'Location not found');

    return success(res, 'Location fetched successfully', location);
  } catch (error) {
    console.error('[ADMIN LOCATION GET BY ID ERROR]', error);
    return serverError(res, error);
  }
};

// ─── PUT /admin/location/:id ──────────────────────────────────────────────────
/**
 * Update a location
 */
module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address, city, inactive, user } = req.body;

    const location = await Location.findByPk(id);
    if (!location) return notFound(res, 'Location not found');

    if (name && name.trim() !== location.name) {
      const duplicate = await Location.findOne({ where: { name: name.trim() } });
      if (duplicate) return badRequest(res, `A location named "${name.trim()}" already exists`);
    }

    if (code && code.trim().toUpperCase() !== location.code) {
      const dupCode = await Location.findOne({ where: { code: code.trim().toUpperCase() } });
      if (dupCode) return badRequest(res, `A location with code "${code.trim().toUpperCase()}" already exists`);
    }

    await location.update({
      name: name ? name.trim() : location.name,
      code: code !== undefined ? (code ? code.trim().toUpperCase() : null) : location.code,
      address: address !== undefined ? address : location.address,
      city: city !== undefined ? city : location.city,
      inactive: inactive !== undefined ? inactive : location.inactive,
      updated_on: new Date(),
      updated_by: user?.id || null,
    });

    return success(res, 'Location updated successfully', location);
  } catch (error) {
    console.error('[ADMIN LOCATION UPDATE ERROR]', error);
    return serverError(res, error);
  }
};

// ─── DELETE /admin/location/:id ───────────────────────────────────────────────
/**
 * Soft delete a location
 */
module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findByPk(id);
    if (!location) return notFound(res, 'Location not found');

    await location.update({ inactive: true, updated_on: new Date() });

    return success(res, 'Location deleted successfully', { locationId: id });
  } catch (error) {
    console.error('[ADMIN LOCATION DELETE ERROR]', error);
    return serverError(res, error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATION ↔ MENU ITEM ASSIGNMENT
// ═══════════════════════════════════════════════════════════════════════════════

// ─── POST /admin/location/:id/menu-items ─────────────────────────────────────
/**
 * Assign one or more menu items to a location.
 * Body: { menu_item_ids: [1, 2, 3] }
 * Skips duplicates (already assigned items) gracefully.
 */
module.exports.assignMenuItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_item_ids, user } = req.body;

    const location = await Location.findByPk(id);
    if (!location) return notFound(res, 'Location not found');

    // Validate all menu item IDs exist
    const menuItems = await MenuItem.findAll({
      where: { id: { [Op.in]: menu_item_ids }, inactive: false },
    });

    if (menuItems.length !== menu_item_ids.length) {
      const foundIds = menuItems.map(m => m.id);
      const missing = menu_item_ids.filter(mid => !foundIds.includes(mid));
      return badRequest(res, `Menu item(s) not found or inactive: [${missing.join(', ')}]`);
    }

    // Find already-assigned items for this location
    const existing = await LocationMenuItem.findAll({
      where: {
        location_id: id,
        menu_item_id: { [Op.in]: menu_item_ids },
      },
    });
    const existingIds = existing.map(e => e.menu_item_id);
    const newIds = menu_item_ids.filter(mid => !existingIds.includes(mid));

    // Bulk create only the new assignments
    const records = newIds.map(menu_item_id => ({
      location_id: parseInt(id),
      menu_item_id,
      is_available: true,
      inactive: false,
      created_on: new Date(),
      updated_on: new Date(),
      created_by: user?.id || null,
      updated_by: user?.id || null,
    }));

    let created_items = [];
    if (records.length > 0) {
      created_items = await LocationMenuItem.bulkCreate(records);
    }

    return success(res, 'Menu items assigned to location successfully', {
      location_id: parseInt(id),
      assigned_count: created_items.length,
      skipped_already_assigned: existingIds.length,
      skipped_ids: existingIds,
    });
  } catch (error) {
    console.error('[ADMIN LOCATION ASSIGN MENU ITEMS ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/location/:id/menu-items ──────────────────────────────────────
/**
 * Get all menu items assigned to a location, with availability status.
 * Query: ?is_available=true|false, ?category_id=, ?search=
 */
module.exports.getMenuItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available, category_id, search } = req.query;

    const location = await Location.findByPk(id);
    if (!location) return notFound(res, 'Location not found');

    // Build filter on LocationMenuItem
    const lmiWhere = { location_id: id, inactive: false };
    if (is_available !== undefined) lmiWhere.is_available = is_available === 'true';

    // Build filter on MenuItem
    const itemWhere = { inactive: false };
    if (category_id) itemWhere.category_id = parseInt(category_id);
    if (search) {
      itemWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const locationMenuItems = await LocationMenuItem.findAll({
      where: lmiWhere,
      include: [
        {
          model: MenuItem,
          as: 'menuItem',
          where: itemWhere,
          include: [
            { model: MenuCategory, attributes: ['id', 'name'] },
            { model: MenuItemImage, attributes: ['id', 'image_url', 'alt_text', 'is_primary'], required: false },
          ],
        },
      ],
      order: [[{ model: MenuItem, as: 'menuItem' }, 'display_order', 'ASC']],
    });

    return success(res, `Menu items for location "${location.name}" fetched successfully`, {
      location: { id: location.id, name: location.name, code: location.code },
      count: locationMenuItems.length,
      items: locationMenuItems,
    });
  } catch (error) {
    console.error('[ADMIN LOCATION GET MENU ITEMS ERROR]', error);
    return serverError(res, error);
  }
};

// ─── PATCH /admin/location/:id/menu-items/:item_id ───────────────────────────
/**
 * Toggle is_available for a specific menu item at a location.
 * Body: { is_available: true|false }
 */
module.exports.updateMenuItemAvailability = async (req, res) => {
  try {
    const { id, item_id } = req.params;
    const { is_available, user } = req.body;

    const location = await Location.findByPk(id);
    if (!location) return notFound(res, 'Location not found');

    const lmi = await LocationMenuItem.findOne({
      where: { location_id: id, menu_item_id: item_id, inactive: false },
    });
    if (!lmi) return notFound(res, 'This menu item is not assigned to the specified location');

    await lmi.update({
      is_available,
      updated_on: new Date(),
      updated_by: user?.id || null,
    });

    return success(res, `Menu item availability updated successfully`, {
      location_id: parseInt(id),
      menu_item_id: parseInt(item_id),
      is_available: lmi.is_available,
    });
  } catch (error) {
    console.error('[ADMIN LOCATION UPDATE AVAILABILITY ERROR]', error);
    return serverError(res, error);
  }
};

// ─── DELETE /admin/location/:id/menu-items/:item_id ──────────────────────────
/**
 * Remove a menu item assignment from a location (soft delete the assignment)
 */
module.exports.removeMenuItems = async (req, res) => {
  try {
    const { id, item_id } = req.params;

    const location = await Location.findByPk(id);
    if (!location) return notFound(res, 'Location not found');

    const lmi = await LocationMenuItem.findOne({
      where: { location_id: id, menu_item_id: item_id, inactive: false },
    });
    if (!lmi) return notFound(res, 'This menu item is not assigned to the specified location');

    await lmi.update({ inactive: true, updated_on: new Date() });

    return success(res, 'Menu item removed from location successfully', {
      location_id: parseInt(id),
      menu_item_id: parseInt(item_id),
    });
  } catch (error) {
    console.error('[ADMIN LOCATION REMOVE MENU ITEM ERROR]', error);
    return serverError(res, error);
  }
};
