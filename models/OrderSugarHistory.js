const sequelize = require('../config/dbConfig');
const { DataTypes } = require('sequelize');

const OrderSugarHistory = sequelize.define('OrderSugarHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
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
  hashline: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'order_sugar_histories',
  timestamps: false
});

module.exports = OrderSugarHistory;
