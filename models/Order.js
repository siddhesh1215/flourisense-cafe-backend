const sequelize = require('../config/dbConfig');
const { DataTypes } = require('sequelize');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending', // pending, paid, failed, refunded
    allowNull: true
  },
  created_on: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_on: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  inactive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: false
});

module.exports = Order;
