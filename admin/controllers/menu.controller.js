const { MenuItem, MenuCategory, MenuItemImage } = require('../../models');
const { success, created, badRequest, notFound, serverError } = require('../../utils/response.helper');

// Common include for menu items with images
const menuIncludes = [
  { model: MenuCategory, attributes: ['id', 'name'] },
  { model: MenuItemImage, attributes: ['id', 'image_url', 'alt_text', 'is_primary'] },
];

// ─── POST /admin/menu ─────────────────────────────────────────────────────────
/**
 * Add new menu item
 */
module.exports.create = async (req, res) => {
  try {
    const { name, description, price, category_id, image, is_popular, is_available, display_order, user } = req.body;

    const category = await MenuCategory.findByPk(category_id);
    if (!category) return notFound(res, 'Menu category not found');

    const duplicate = await MenuItem.findOne({ where: { name: name.trim() } });
    if (duplicate) return badRequest(res, `A menu item named "${name.trim()}" already exists`);

    const menuItem = await MenuItem.create({
      name: name.trim(),
      description: description || null,
      price: parseFloat(price),
      category_id,
      is_popular: is_popular !== undefined ? is_popular : false,
      is_available: is_available !== undefined ? is_available : true,
      display_order: display_order || 0,
      created_on: new Date(),
      updated_on: new Date(),
      created_by: user?.id || null,
      updated_by: user?.id || null,
    });

    if (image) {
      await MenuItemImage.create({
        menu_item_id: menuItem.id,
        image_url: image,
        is_primary: true,
        created_on: new Date(),
        updated_on: new Date(),
      });
    }

    const createdItem = await MenuItem.findByPk(menuItem.id, { include: menuIncludes });
    return created(res, 'Menu item created successfully', createdItem);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return badRequest(res, 'A menu item with this name already exists');
    }
    return serverError(res, error);
  }
};

// ─── GET /admin/menu ──────────────────────────────────────────────────────────
/**
 * Get all menu items (including inactive ones for admin)
 */
module.exports.getAll = async (req, res) => {
  try {
    const { category_id, is_available, is_popular, search } = req.query;

    const where = {};

    if (category_id) where.category_id = parseInt(category_id);
    if (is_available !== undefined) where.is_available = is_available === 'true';
    if (is_popular !== undefined) where.is_popular = is_popular === 'true';

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const items = await MenuItem.findAll({
      where,
      include: menuIncludes,
      order: [['display_order', 'ASC'], ['name', 'ASC']],
    });

    return success(res, 'Menu items fetched successfully', {
      count: items.length,
      items,
    });
  } catch (error) {
    console.error('[ADMIN MENU GET ALL ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/menu/:id ──────────────────────────────────────────────────────
/**
 * Get single menu item by ID
 */
module.exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findByPk(id, { include: menuIncludes });

    if (!item) {
      return notFound(res, 'Menu item not found');
    }

    return success(res, 'Menu item fetched successfully', item);
  } catch (error) {
    console.error('[ADMIN MENU GET BY ID ERROR]', error);
    return serverError(res, error);
  }
};

// ─── PUT /admin/menu/:id ──────────────────────────────────────────────────────
/**
 * Update full menu item
 */
module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, image, is_popular, is_available, display_order, user } = req.body;

    const item = await MenuItem.findByPk(id);
    if (!item) return notFound(res, 'Menu item not found');

    if (category_id) {
      const category = await MenuCategory.findByPk(category_id);
      if (!category) return notFound(res, 'Menu category not found');
    }

    if (name && name.trim() !== item.name) {
      const duplicate = await MenuItem.findOne({ where: { name: name.trim() } });
      if (duplicate) return badRequest(res, `A menu item named "${name.trim()}" already exists`);
    }

    await item.update({
      name: name ? name.trim() : item.name,
      description: description !== undefined ? description : item.description,
      price: price !== undefined ? parseFloat(price) : item.price,
      category_id: category_id || item.category_id,
      is_popular: is_popular !== undefined ? is_popular : item.is_popular,
      is_available: is_available !== undefined ? is_available : item.is_available,
      display_order: display_order !== undefined ? display_order : item.display_order,
      updated_on: new Date(),
      updated_by: user?.id || null,
    });

    if (image) {
      await MenuItemImage.update({ is_primary: false }, { where: { menu_item_id: id } });

      const existingImage = await MenuItemImage.findOne({ where: { menu_item_id: id, image_url: image } });
      if (existingImage) {
        await existingImage.update({ is_primary: true });
      } else {
        await MenuItemImage.create({
          menu_item_id: id,
          image_url: image,
          is_primary: true,
          created_on: new Date(),
          updated_on: new Date(),
        });
      }
    }

    const updatedItem = await MenuItem.findByPk(id, { include: menuIncludes });
    return success(res, 'Menu item updated successfully', updatedItem);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return badRequest(res, 'A menu item with this name already exists');
    }
    return serverError(res, error);
  }
};


// ─── PATCH /admin/menu/:id/price ─────────────────────────────────────────────
/**
 * Update only the price of a menu item
 */
module.exports.updatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, user } = req.body;

    const item = await MenuItem.findByPk(id);
    if (!item) return notFound(res, 'Menu item not found');

    const oldPrice = parseFloat(item.price);
    const newPrice = parseFloat(price);

    console.log(`[UPDATE PRICE] Item ID: ${id}, Old: ${oldPrice}, New: ${newPrice}`);

    // Use raw SQL to ensure the update is committed in SQLite
    const sequelize = require('../../config/dbConfig');
    const { QueryTypes } = require('sequelize');

    await sequelize.query(
      `UPDATE menu_items SET price = :price, updated_on = :updated_on, updated_by = :updated_by WHERE id = :id`,
      {
        replacements: {
          price: newPrice,
          updated_on: new Date().toISOString(),
          updated_by: user?.id || null,
          id: parseInt(id),
        },
        type: QueryTypes.UPDATE,
      }
    );

    // Re-fetch to confirm the value was written
    const updatedItem = await MenuItem.findByPk(id);
    console.log(`[UPDATE PRICE] Confirmed price in DB: ${updatedItem.price}`);

    return success(res, 'Menu item price updated successfully', {
      id: parseInt(id),
      name: item.name,
      old_price: oldPrice,
      new_price: parseFloat(updatedItem.price),
    });
  } catch (error) {
    console.error('[ADMIN MENU UPDATE PRICE ERROR]', error);
    return serverError(res, error);
  }
};

// ─── DELETE /admin/menu/:id ───────────────────────────────────────────────────
/**
 * Delete menu item (soft delete with inactive flag)
 */
module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findByPk(id);
    if (!item) {
      return notFound(res, 'Menu item not found');
    }

    // Soft delete by marking as inactive
    await item.update({ inactive: true, updated_on: new Date() });

    return success(res, 'Menu item deleted successfully', { itemId: id });
  } catch (error) {
    console.error('[ADMIN MENU DELETE ERROR]', error);
    return serverError(res, error);
  }
};

// ─── DELETE /admin/menu/:id/permanent ──────────────────────────────────────────
/**
 * Permanently delete menu item and related data
 */
module.exports.deletePermanent = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findByPk(id);
    if (!item) {
      return notFound(res, 'Menu item not found');
    }

    // Delete associated images
    await MenuItemImage.destroy({ where: { menu_item_id: id } });

    // Delete item
    await MenuItem.destroy({ where: { id } });

    return success(res, 'Menu item permanently deleted successfully', { itemId: id });
  } catch (error) {
    console.error('[ADMIN MENU DELETE PERMANENT ERROR]', error);
    return serverError(res, error);
  }
};
