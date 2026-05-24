const sequelize = require('../config/dbConfig');

// Import all models
const User = require('./User');
const ReferenceType = require('./ReferenceType');
const Reference = require('./Reference');
const MenuCategory = require('./MenuCategory');
const MenuItem = require('./MenuItem');
const MenuItemImage = require('./MenuItemImage');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const OTP = require('./OTP');
const LoginSession = require('./LoginSession');
const Order = require('./Order');
const OrderStatusHistory = require('./OrderStatusHistory');
const Location = require('./Location');
const Menu = require('./Menu');
const LocationMenuItem = require('./LocationMenuItem');
const Review = require('./Review');
const Feedback = require('./Feedback');

// ─── User associations ────────────────────────────────────────────────────────
User.belongsTo(Reference, { foreignKey: 'role_id', as: 'role' });
User.hasMany(OTP, { foreignKey: 'user_id' });
User.hasMany(LoginSession, { foreignKey: 'user_id' });
User.hasMany(Cart, { foreignKey: 'user_id' });
User.hasMany(Order, { foreignKey: 'user_id' });
User.hasMany(Review, { foreignKey: 'user_id' });

// ─── Reference / ReferenceType associations ───────────────────────────────────
ReferenceType.hasMany(Reference, { foreignKey: 'reference_type_id' });
Reference.belongsTo(ReferenceType, { foreignKey: 'reference_type_id' });
Reference.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// ─── OTP associations ─────────────────────────────────────────────────────────
OTP.belongsTo(User, { foreignKey: 'user_id' });
OTP.belongsTo(Reference, { foreignKey: 'otp_type_id', as: 'otpType' });

// ─── LoginSession associations ────────────────────────────────────────────────
LoginSession.belongsTo(User, { foreignKey: 'user_id' });

// ─── MenuCategory / MenuItem associations ─────────────────────────────────────
MenuCategory.hasMany(MenuItem, { foreignKey: 'category_id' });
MenuItem.belongsTo(MenuCategory, { foreignKey: 'category_id' });

// ─── MenuItemImage associations ───────────────────────────────────────────────
MenuItem.hasMany(MenuItemImage, { foreignKey: 'menu_item_id' });
MenuItemImage.belongsTo(MenuItem, { foreignKey: 'menu_item_id' });

// ─── Cart / CartItem associations ─────────────────────────────────────────────
Cart.belongsTo(User, { foreignKey: 'user_id' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
CartItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id' });
MenuItem.hasMany(CartItem, { foreignKey: 'menu_item_id' });

// ─── Order associations ───────────────────────────────────────────────────────
Order.belongsTo(User, { foreignKey: 'user_id' });
Order.belongsTo(Reference, { foreignKey: 'status_id', as: 'status' });
Order.belongsTo(Reference, { foreignKey: 'order_type_id', as: 'orderType' });
Order.belongsTo(Location, { foreignKey: 'location_id' });
Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id' });
Order.hasMany(Review, { foreignKey: 'order_id' });

// ─── OrderStatusHistory associations ─────────────────────────────────────────
OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id' });
OrderStatusHistory.belongsTo(Reference, { foreignKey: 'status_id', as: 'status' });

// ─── Location / Menu associations ────────────────────────────────────────────
// One Location has many Menus (breakfast, lunch, dinner menu, etc.)
Location.hasMany(Menu, { foreignKey: 'location_id', as: 'menus' });
Menu.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

// ─── Menu / LocationMenuItem associations ────────────────────────────────────
// One Menu has many LocationMenuItems (menu items in that menu at that location)
Menu.hasMany(LocationMenuItem, { foreignKey: 'menu_id', as: 'locationMenuItems' });
LocationMenuItem.belongsTo(Menu, { foreignKey: 'menu_id', as: 'menu' });

// ─── Location / LocationMenuItem (One Location → Many MenuItems) ────────────────
// One Location has many LocationMenuItems (each row = one menu item at that location)
Location.hasMany(LocationMenuItem, { foreignKey: 'location_id', as: 'locationMenuItems' });
LocationMenuItem.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

// One MenuItem can appear in many LocationMenuItems (available at multiple locations)
MenuItem.hasMany(LocationMenuItem, { foreignKey: 'menu_item_id', as: 'locationMenuItems' });
LocationMenuItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'menuItem' });

// Many-to-Many shortcut (Location ↔ MenuItem via LocationMenuItem)
Location.belongsToMany(MenuItem, { through: LocationMenuItem, foreignKey: 'location_id', as: 'menuItems' });
MenuItem.belongsToMany(Location, { through: LocationMenuItem, foreignKey: 'menu_item_id', as: 'locations' });

// ─── Location / Order associations ───────────────────────────────────────────
Location.hasMany(Order, { foreignKey: 'location_id' });

// ─── Review associations ──────────────────────────────────────────────────────
Review.belongsTo(User, { foreignKey: 'user_id' });
Review.belongsTo(MenuItem, { foreignKey: 'menu_item_id' });
Review.belongsTo(Order, { foreignKey: 'order_id' });
MenuItem.hasMany(Review, { foreignKey: 'menu_item_id' });

// ─── Feedback associations ────────────────────────────────────────────────────
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user', constraints: false });
Feedback.belongsTo(Location, { foreignKey: 'location_id', as: 'location', constraints: false });
Feedback.belongsTo(Order, { foreignKey: 'order_id', as: 'order', constraints: false });
User.hasMany(Feedback, { foreignKey: 'user_id' });
Location.hasMany(Feedback, { foreignKey: 'location_id' });
Order.hasMany(Feedback, { foreignKey: 'order_id' });

module.exports = {
  sequelize,
  User,
  ReferenceType,
  Reference,
  MenuCategory,
  MenuItem,
  MenuItemImage,
  Cart,
  CartItem,
  OTP,
  LoginSession,
  Order,
  OrderStatusHistory,
  Location,
  Menu,
  LocationMenuItem,
  Review,
  Feedback
};
