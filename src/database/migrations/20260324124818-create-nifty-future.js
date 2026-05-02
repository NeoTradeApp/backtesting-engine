'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nifty_futures', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      time: {
        type: Sequelize.BIGINT
      },
      open: {
        type: Sequelize.DECIMAL
      },
      high: {
        type: Sequelize.DECIMAL
      },
      low: {
        type: Sequelize.DECIMAL
      },
      close: {
        type: Sequelize.DECIMAL
      },
      volume: {
        type: Sequelize.BIGINT
      },
      expiry: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NiftyFutures');
  }
};
