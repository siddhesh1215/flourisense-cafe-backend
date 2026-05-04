const sequelize = require('../config/dbConfig');
const { DataTypes } = require('sequelize');

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  }
}, {
  tableName: 'menus',
  timestamps: false
});

module.exports = Menu;
