const sequelize = require('../config/dbConfig');
const { DataTypes } = require('sequelize');

// Import all models
const User = require('./User');
const ReferenceType = require('./ReferenceType');
const Reference = require('./Reference');
const MenuCategory = require('./MenuCategory');
const MenuItem = require('./MenuItem');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const OTP = require('./OTP');
const LoginSession = require('./LoginSession');
const Order = require('./Order');
const OrderSugarHistory = require('./OrderSugarHistory');

// Define associations
// User associations
User.hasMany(Cart, { foreignKey: 'user_id' });
User.hasMany(OTP, { foreignKey: 'user_id' });
User.hasMany(LoginSession, { foreignKey: 'user_id' });
User.hasMany(Order, { foreignKey: 'user_id' });
User.belongsTo(Reference, { foreignKey: 'role_id', as: 'role' });

// Reference associations
Reference.hasMany(User, { foreignKey: 'role_id', as: 'users' });
Reference.belongsTo(ReferenceType, { foreignKey: 'reference_type_id' });
ReferenceType.hasMany(Reference, { foreignKey: 'reference_type_id' });

// Menu associations
MenuCategory.hasMany(MenuItem, { foreignKey: 'category_id' });
MenuItem.belongsTo(MenuCategory, { foreignKey: 'category_id' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'user_id' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id' });

// CartItem associations
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
CartItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id' });

// OTP associations
OTP.belongsTo(User, { foreignKey: 'user_id' });

// LoginSession associations
LoginSession.belongsTo(User, { foreignKey: 'user_id' });

// Order associations
Order.belongsTo(User, { foreignKey: 'user_id' });
Order.belongsTo(Reference, { foreignKey: 'status_id', as: 'status' });
Order.hasMany(OrderSugarHistory, { foreignKey: 'order_id' });

// OrderSugarHistory associations
OrderSugarHistory.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = {
  sequelize,
  User,
  ReferenceType,
  Reference,
  MenuCategory,
  MenuItem,
  Cart,
  CartItem,
  OTP,
  LoginSession,
  Order,
  OrderSugarHistory
};
