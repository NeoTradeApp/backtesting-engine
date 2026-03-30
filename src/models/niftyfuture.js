'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NiftyFuture extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  NiftyFuture.init({
    time: DataTypes.BIGINT,
    open: DataTypes.DECIMAL,
    high: DataTypes.DECIMAL,
    low: DataTypes.DECIMAL,
    close: DataTypes.DECIMAL,
    volume: DataTypes.BIGINT,
    expiry: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'NiftyFuture',
  });

  return NiftyFuture;
};
