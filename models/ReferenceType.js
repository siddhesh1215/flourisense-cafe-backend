const sequelize = require('../config/dbConfig');
const { DataTypes } = require('sequelize');

const ReferenceType = sequelize.define('ReferenceType', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mode: {
    type: DataTypes.STRING,
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
  hashline: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'reference_types',
  timestamps: false
});

module.exports = ReferenceType;
