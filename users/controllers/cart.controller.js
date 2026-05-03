const { Cart, CartItem, MenuItem, MenuItemImage } = require('../../models');
const { success, created, badRequest, notFound, serverError } = require('../../utils/response.helper');

/**
 * Get full cart with all items and total for a user
 */
const getCartWithTotal = async (userId) => {
  const cart = await Cart.findOne({
    where: { user_id: userId, inactive: false },
    include: [
      {
        model: CartItem,
        where: { inactive: false },
        required: false,
        include: [
          {
            model: MenuItem,
            attributes: ['id', 'name', 'price', 'is_available'],
            include: [
              { model: MenuItemImage, attributes: ['image_url', 'is_primary'], required: false },
            ],
          },
        ],
      },
    ],
  });
  return cart;
};

// ─── POST /cart/add ───────────────────────────────────────────────────────────
/**
 * Add item to cart. If item already exists, increment quantity.
 */
module.exports.add = async (req, res) => {
  try {
    const { menu_item_id, quantity, user } = req.body;
    const userId = user.id;

    // Validate menu item exists and is available
    const menuItem = await MenuItem.findOne({
      where: { id: menu_item_id, is_available: true, inactive: false },
    });
    if (!menuItem) return notFound(res, 'Menu item not found or not available');

    // Find or create cart for user
    let [cart] = await Cart.findOrCreate({
      where: { user_id: userId, inactive: false },
      defaults: {
        user_id: userId,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: userId,
        updated_by: userId,
      },
    });

    // Check if item already in cart → update quantity instead of duplicating
    const existingItem = await CartItem.findOne({
      where: { cart_id: cart.id, menu_item_id, inactive: false },
    });

    if (existingItem) {
      await existingItem.update({
        quantity: existingItem.quantity + quantity,
        updated_on: new Date(),
        updated_by: userId,
      });
    } else {
      await CartItem.create({
        cart_id: cart.id,
        menu_item_id,
        quantity,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: userId,
        updated_by: userId,
      });
    }

    // Return full cart
    const updatedCart = await getCartWithTotal(userId);
    const total = (updatedCart?.CartItems || []).reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.MenuItem?.price || 0), 0
    );

    return created(res, 'Item added to cart successfully', { cart: updatedCart, total_amount: total.toFixed(2) });
  } catch (error) {
    return serverError(res, error);
  }
};

// ─── GET /cart ────────────────────────────────────────────────────────────────
/**
 * Get the logged-in user's cart with all items and total
 */
module.exports.getCart = async (req, res) => {
  try {
    const userId = req.body.user.id;

    const cart = await getCartWithTotal(userId);

    if (!cart || !cart.CartItems?.length) {
      return success(res, 'Cart is empty', { cart: null, items: [], total_amount: '0.00' });
    }

    const total = cart.CartItems.reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.MenuItem?.price || 0), 0
    );

    return success(res, 'Cart fetched successfully', {
      cart_id: cart.id,
      items: cart.CartItems,
      total_amount: total.toFixed(2),
      item_count: cart.CartItems.length,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// ─── GET /cart/:id ────────────────────────────────────────────────────────────
/**
 * Get a single cart item by ID
 */
module.exports.getCartItem = async (req, res) => {
  try {
    const userId = req.body.user.id;
    const { id } = req.params;

    const cartItem = await CartItem.findOne({
      where: { id, inactive: false },
      include: [
        { model: Cart, where: { user_id: userId }, attributes: ['id', 'user_id'] },
        { model: MenuItem, attributes: ['id', 'name', 'price'] },
      ],
    });

    if (!cartItem) return notFound(res, 'Cart item not found');

    return success(res, 'Cart item fetched successfully', cartItem);
  } catch (error) {
    return serverError(res, error);
  }
};

// ─── PUT /cart/update/:id ─────────────────────────────────────────────────────
/**
 * Update quantity of a cart item
 */
module.exports.update = async (req, res) => {
  try {
    const userId = req.body.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await CartItem.findOne({
      where: { id, inactive: false },
      include: [{ model: Cart, where: { user_id: userId } }],
    });

    if (!cartItem) return notFound(res, 'Cart item not found');

    await cartItem.update({ quantity, updated_on: new Date(), updated_by: userId });

    const updatedCart = await getCartWithTotal(userId);
    const total = (updatedCart?.CartItems || []).reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.MenuItem?.price || 0), 0
    );

    return success(res, 'Cart item updated successfully', {
      cart: updatedCart,
      total_amount: total.toFixed(2),
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// ─── DELETE /cart/remove/:id ──────────────────────────────────────────────────
/**
 * Remove a single item from the cart (soft delete)
 */
module.exports.removeItem = async (req, res) => {
  try {
    const userId = req.body.user.id;
    const { id } = req.params;

    const cartItem = await CartItem.findOne({
      where: { id, inactive: false },
      include: [{ model: Cart, where: { user_id: userId } }],
    });

    if (!cartItem) return notFound(res, 'Cart item not found');

    await cartItem.update({ inactive: true, updated_on: new Date() });

    return success(res, 'Item removed from cart successfully');
  } catch (error) {
    return serverError(res, error);
  }
};

// ─── DELETE /cart/clear ───────────────────────────────────────────────────────
/**
 * Clear all items from the user's cart
 */
module.exports.clearCart = async (req, res) => {
  try {
    const userId = req.body.user.id;

    const cart = await Cart.findOne({ where: { user_id: userId, inactive: false } });
    if (!cart) return success(res, 'Cart is already empty');

    await CartItem.update(
      { inactive: true, updated_on: new Date() },
      { where: { cart_id: cart.id, inactive: false } }
    );

    return success(res, 'Cart cleared successfully');
  } catch (error) {
    return serverError(res, error);
  }
};
