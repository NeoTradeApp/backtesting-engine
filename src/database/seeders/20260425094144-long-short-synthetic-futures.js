'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert("strategies", [{
      id: Sequelize.literal("gen_random_uuid()"),
      user_id: "02869ff3-53cc-4ab5-bd17-ee9939b0fa36",
      strategy_id: "3574a958-d889-48f1-8546-8bfba7ca7b83",
      strategy_name: "LONG_SHORT_SYNTHETIC_FUTURES"
    }], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete("strategies", null, {});
  }
};
