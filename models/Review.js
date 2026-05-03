const sequelize = require('../config/dbConfig');
const { DataTypes } = require('sequelize');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  menu_item_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'reviews',
  timestamps: false
});

module.exports = Review;
