const { Order, User, MenuItem, OrderStatusHistory, Reference, sequelize } = require('../../models');
const { success, notFound, serverError } = require('../../utils/response.helper');
const { Op } = require('sequelize');

// Common include for orders with relationships
const orderIncludes = [
  {
    model: User,
    attributes: ['id', 'name', 'email', 'phone']
  },
  {
    model: Reference,
    as: 'status',
    attributes: ['id', 'name', 'code']
  },
  {
    model: Reference,
    as: 'orderType',
    attributes: ['id', 'name', 'code']
  },
];

// ─── GET /admin/orders ────────────────────────────────────────────────────────
/**
 * Get all orders with filters and pagination
 */
module.exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date_from, date_to } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // Filter by status
    if (status) {
      where.status_id = parseInt(status);
    }

    // Filter by date range
    if (date_from || date_to) {
      where.created_on = {};
      if (date_from) {
        where.created_on[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setHours(23, 59, 59, 999);
        where.created_on[Op.lte] = endDate;
      }
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: orderIncludes,
      limit: parseInt(limit),
      offset,
      order: [['created_on', 'DESC']],
    });

    return success(res, 'Orders fetched successfully', {
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      },
      data: rows,
    });
  } catch (error) {
    console.error('[ADMIN ORDERS GET ALL ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/orders/:id ────────────────────────────────────────────────────
/**
 * Get single order with items
 */
module.exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        ...orderIncludes,
        {
          model: OrderStatusHistory,
          attributes: ['id', 'status_id', 'created_on'],
          include: [{ model: Reference, as: 'status', attributes: ['name', 'code'] }],
        },
      ],
    });

    if (!order) {
      return notFound(res, 'Order not found');
    }

    return success(res, 'Order fetched successfully', order);
  } catch (error) {
    console.error('[ADMIN ORDERS GET BY ID ERROR]', error);
    return serverError(res, error);
  }
};

// ─── PATCH /admin/orders/:id/status ───────────────────────────────────────────
/**
 * Update order status
 */
module.exports.updateStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status_id } = req.body;

    // Find order
    const order = await Order.findByPk(id);
    if (!order) {
      await t.rollback();
      return notFound(res, 'Order not found');
    }

    // Validate status exists
    const status = await Reference.findByPk(status_id);
    if (!status) {
      await t.rollback();
      return notFound(res, 'Order status not found');
    }

    const oldStatus = order.status_id;
    const now = new Date();

    // Update order status
    await order.update({ status_id, updated_on: now }, { transaction: t });

    // Add to status history — model requires `changed_on` (NOT NULL)
    await OrderStatusHistory.create({
      order_id: id,
      status_id,
      changed_on: now,
    }, { transaction: t });

    await t.commit();

    // Fetch updated order
    const updatedOrder = await Order.findByPk(id, { include: orderIncludes });

    return success(res, 'Order status updated successfully', {
      order: updatedOrder,
      statusChange: {
        from: oldStatus,
        to: status_id,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error('[ADMIN ORDERS UPDATE STATUS ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/orders/active ─────────────────────────────────────────────────
/**
 * Get active orders (pending, processing, ready)
 */
module.exports.getActive = async (req, res) => {
  try {
    // Assuming order statuses: 1=pending, 2=processing, 3=ready, 4=completed, 5=cancelled
    const activeStatuses = [1, 2, 3]; // pending, processing, ready

    const orders = await Order.findAll({
      where: {
        status_id: { [Op.in]: activeStatuses },
      },
      include: orderIncludes,
      order: [['created_on', 'DESC']],
    });

    return success(res, 'Active orders fetched successfully', {
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('[ADMIN ORDERS GET ACTIVE ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/orders/today ──────────────────────────────────────────────────
/**
 * Get today's orders
 */
module.exports.getToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.findAll({
      where: {
        created_on: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
      include: orderIncludes,
      order: [['created_on', 'DESC']],
    });

    return success(res, "Today's orders fetched successfully", {
      date: today.toISOString().split('T')[0],
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('[ADMIN ORDERS GET TODAY ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/orders/stats ──────────────────────────────────────────────────
/**
 * Get order statistics
 */
//
module.exports.getStats = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const completedOrders = await Order.count({ where: { status_id: { [Op.in]: [6, 9] } } });
    const pendingOrders = await Order.count({ where: { status_id: { [Op.in]: [4, 5, 8] } } });
    const cancelledOrders = await Order.count({ where: { status_id: 10 } });

    // Total revenue
    const totalRevenue = await Order.sum('total_amount', {
      where: { status_id: { [Op.in]: [6, 9] } }, // Only completed orders
    });

    // Average order value
    const avgOrderValue = await Order.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('total_amount')), 'average'],
      ],
      raw: true,
      where: { status_id: { [Op.in]: [6, 9] } },
    });

    return success(res, 'Order statistics fetched successfully', {
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue: totalRevenue || 0,
      averageOrderValue: avgOrderValue?.average ? parseFloat(avgOrderValue.average).toFixed(2) : 0,
    });
  } catch (error) {
    console.error('[ADMIN ORDERS STATS ERROR]', error);
    return serverError(res, error);
  }
};
