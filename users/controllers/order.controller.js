const { sequelize, Order, OrderStatusHistory, Cart, CartItem, MenuItem, Reference } = require('../../models');
const { success, created, badRequest, notFound, serverError } = require('../../utils/response.helper');

/**
 * Generate a unique human-readable order number: FC-YYYYMMDD-XXXX
 */
const generateOrderNumber = () => {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `FC-${datePart}-${randomPart}`;
};

/**
 * Get order status reference by code
 */
const getOrderStatusByCode = async (code) => {
  return await Reference.findOne({
    where: { code, reference_type_id: 1 } // Assuming reference_type_id 1 is for order statuses
  });
};

// Order include config for consistent responses
const orderIncludes = [
  { model: Reference, as: 'status', attributes: ['id', 'name', 'code'], required: false },
  { model: Reference, as: 'orderType', attributes: ['id', 'name', 'code'], required: false },
];

// ─── POST /order/place ────────────────────────────────────────────────────────
/**
 * Place a new order from the user's current cart.
 * Uses a DB transaction to atomically move cart → order.
 */
module.exports.place = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { payment_method, location_id, order_type_id, user } = req.body;
    const userId = user.id;

    // 1. Get user's active cart with items
    const cart = await Cart.findOne({
      where: { user_id: userId, inactive: false },
      include: [
        {
          model: CartItem,
          where: { inactive: false },
          required: true,
          include: [
            { model: MenuItem, attributes: ['id', 'name', 'price', 'is_available'] },
          ],
        },
      ],
      transaction: t,
    });

    if (!cart || !cart.CartItems?.length) {
      await t.rollback();
      return badRequest(res, 'Your cart is empty. Add items before placing an order.');
    }

    // 2. Validate all cart items are still available
    for (const item of cart.CartItems) {
      if (!item.MenuItem?.is_available) {
        await t.rollback();
        return badRequest(res, `"${item.MenuItem?.name}" is no longer available. Please update your cart.`);
      }
    }

    // 3. Calculate total amount
    const totalAmount = cart.CartItems.reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.MenuItem.price), 0
    );

    // 4. Create the order
    const order = await Order.create({
      user_id: userId,
      order_number: generateOrderNumber(),
      total_amount: totalAmount.toFixed(2),
      location_id: location_id || null,
      order_type_id: order_type_id || null,
      created_on: new Date(),
      updated_on: new Date(),
      created_by: userId,
      updated_by: userId,
    }, { transaction: t });

    // 5. Create order status history entry (initial status: pending)
    await OrderStatusHistory.create({
      order_id: order.id,
      changed_on: new Date(),
      created_on: new Date(),
      updated_on: new Date(),
      created_by: userId,
    }, { transaction: t });

    // 6. Clear user's cart
    await CartItem.update(
      { inactive: true, updated_on: new Date() },
      { where: { cart_id: cart.id, inactive: false }, transaction: t }
    );

    await t.commit();

    return created(res, 'Order placed successfully', {
      order_id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      payment_method,
      status: 'pending',
    });
  } catch (error) {
    await t.rollback();
    return serverError(res, error);
  }
};

// ─── GET /order/history ───────────────────────────────────────────────────────
/**
 * Get order history for the logged-in user
 */
module.exports.history = async (req, res) => {
  try {
    const userId = req.body.user.id;

    const orders = await Order.findAll({
      where: { user_id: userId, inactive: false },
      include: orderIncludes,
      order: [['created_on', 'DESC']],
    });

    return success(res, 'Order history fetched successfully', orders);
  } catch (error) {
    return serverError(res, error);
  }
};

// ─── GET /order/:id ───────────────────────────────────────────────────────────
/**
 * Get full details of a single order
 */
module.exports.getById = async (req, res) => {
  try {
    const userId = req.body.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, user_id: userId, inactive: false },
      include: [
        ...orderIncludes,
        {
          model: OrderStatusHistory,
          attributes: ['id', 'status_id', 'changed_on'],
          required: false,
          include: [
            { model: Reference, as: 'status', attributes: ['id', 'name', 'code'], required: false },
          ],
          order: [['changed_on', 'DESC']],
        },
      ],
    });

    if (!order) return notFound(res, 'Order not found');

    return success(res, 'Order details fetched successfully', order);
  } catch (error) {
    return serverError(res, error);
  }
};

// ─── PUT /order/:id ───────────────────────────────────────────────────────────
/**
 * Update order status or payment status (admin / internal use)
 */
module.exports.update = async (req, res) => {
  try {
    const userId = req.body.user.id;
    const { id } = req.params;
    const { status_code, payment_status } = req.body;

    const order = await Order.findOne({
      where: { id, inactive: false },
      include: orderIncludes,
    });
    if (!order) return notFound(res, 'Order not found');

    // Check if order is in a final state
    const currentStatusCode = order.status?.code;
    if (['cancelled', 'served'].includes(currentStatusCode)) {
      return badRequest(res, `Cannot update an order that is already "${currentStatusCode}"`);
    }

    const updateData = {
      updated_on: new Date(),
      updated_by: userId,
    };

    // If status code provided, resolve to status_id
    if (status_code) {
      const statusRef = await getOrderStatusByCode(status_code);
      if (!statusRef) return badRequest(res, 'Invalid order status code');
      updateData.status_id = statusRef.id;
    }

    // Add payment status if provided
    if (payment_status) {
      updateData.payment_status = payment_status;
    }

    await order.update(updateData);

    // Log status change in history if status changed
    if (status_code && status_code !== currentStatusCode) {
      const newStatus = await getOrderStatusByCode(status_code);
      await OrderStatusHistory.create({
        order_id: order.id,
        status_id: newStatus.id,
        changed_on: new Date(),
        created_on: new Date(),
        updated_on: new Date(),
        created_by: userId,
      });
    }

    // Return updated order with associations
    const updatedOrder = await Order.findByPk(id, { include: orderIncludes });
    return success(res, 'Order updated successfully', updatedOrder);
  } catch (error) {
    return serverError(res, error);
  }
};

// ─── PUT /order/cancel/:id ────────────────────────────────────────────────────
/**
 * Cancel an order (only if still in pending/confirmed state)
 */
module.exports.cancel = async (req, res) => {
  try {
    const userId = req.body.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, user_id: userId, inactive: false },
      include: orderIncludes,
    });

    if (!order) return notFound(res, 'Order not found');

    const currentStatus = order.status?.code;
    if (['preparing', 'served', 'cancelled'].includes(currentStatus)) {
      return badRequest(res, `Order cannot be cancelled — it is already "${currentStatus}"`);
    }

    // Get cancelled status reference
    const cancelledStatus = await getOrderStatusByCode('cancelled');
    if (!cancelledStatus) {
      return serverError(res, new Error('Cancelled status not found in references'));
    }

    await order.update({
      status_id: cancelledStatus.id,
      updated_on: new Date(),
      updated_by: userId,
    });

    // Log cancellation in history
    await OrderStatusHistory.create({
      order_id: order.id,
      status_id: cancelledStatus.id,
      changed_on: new Date(),
      created_on: new Date(),
      updated_on: new Date(),
      created_by: userId,
    });

    return success(res, 'Order cancelled successfully', {
      order_id: order.id,
      order_number: order.order_number,
      status: 'cancelled',
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// ─── DELETE /order/:id ────────────────────────────────────────────────────────
/**
 * Soft delete an order (admin future use)
 */
module.exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ where: { id, inactive: false } });
    if (!order) return notFound(res, 'Order not found');

    await order.update({ inactive: true, updated_on: new Date() });

    return success(res, 'Order deleted successfully');
  } catch (error) {
    return serverError(res, error);
  }
};
