const { MenuItem, MenuCategory, MenuItemImage } = require('../../models');
const { Op } = require('sequelize');
const { success, notFound, serverError } = require('../../utils/response.helper');

const menuIncludes = [
  { model: MenuCategory, attributes: ['id', 'name'] },
  { model: MenuItemImage, attributes: ['id', 'image_url', 'alt_text', 'is_primary'], required: false },
];

module.exports.getAll = async (req, res) => {
  try {
    const { category_id, search } = req.query;

    const where = { inactive: false, is_available: true };

    if (category_id) where.category_id = category_id;

    if (search) {
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

    return success(res, 'Menu items fetched successfully', items);
  } catch (error) {
    return serverError(res, error);
  }
};

module.exports.getPopular = async (req, res) => {
  try {
    const items = await MenuItem.findAll({
      where: { is_popular: true, is_available: true, inactive: false },
      include: menuIncludes,
      order: [['display_order', 'ASC']],
    });

    return success(res, 'Popular menu items fetched successfully', items);
  } catch (error) {
    return serverError(res, error);
  }
};

module.exports.getByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    const category = await MenuCategory.findByPk(category_id);
    if (!category) return notFound(res, 'Menu category not found');

    const items = await MenuItem.findAll({
      where: { category_id, is_available: true, inactive: false },
      include: menuIncludes,
      order: [['display_order', 'ASC']],
    });

    return success(res, `Menu items for category "${category.name}" fetched successfully`, {
      category,
      items,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

module.exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findOne({
      where: { id, is_available: true, inactive: false },
      include: menuIncludes,
    });

    if (!item) return notFound(res, 'Menu item not found');

    return success(res, 'Menu item fetched successfully', item);
  } catch (error) {
    return serverError(res, error);
  }
};
