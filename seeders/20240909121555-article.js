'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const  articles = [];
    const counts=100;
    for (let i=1;i<=counts;i++){
      const article = {
        title: `文字的标题${i}`,
        content: `文字的内容${i}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      articles.push(article)
    }
    await queryInterface.bulkInsert("Articles",articles,{})
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Articles',null,{})
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
