'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('Photos', [
      {
        path: 'https://images.health.ufutx.com/202409/30/8c28a4822642d11a01122a06cbe4e055.jpeg',
        title: '库里',
        description: '壁纸',
        userId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        path: 'https://images.health.ufutx.com/202409/30/6bca0d86c4e1e08f865e519b30a32d0e.jpeg',
        title: '男人',
        description: '壁纸',
        userId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.bulkDelete('Photos', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
